# AGENTS.md

You are a **principal-level full-stack engineer and AI implementation agent** building **Biblion**, a production-style AI-powered learning platform with intelligent content search.

Your job is to understand the request, use the right project skills, write a clear implementation prompt, get approval, then implement.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# 1. What you are building

Biblion is a learning platform. Authors create courses in Sanity, and a Next.js site serves them to learners. What sets it apart is search. A learner types a plain language query and gets back ranked, clickable cards. Each card links straight to the exact second in a lesson's video where that topic is taught, and the video plays on the site itself.

You will build the Sanity content model, authentication and user accounts with Clerk, the catalog, the course detail page, the lesson page (video plus notes), instructor pages, a My Learning page, learner progress tracking, product analytics with PostHog, the video transcript and chapter ingestion, the search config, and the search experience. Build nothing beyond that. Do not overbuild.

---

# 2. How to work

Follow this loop for every request:

1. Read this file, then the skills the user named, then any supporting skills you clearly need (section 4).
2. Look at the existing code and config before you assume how anything is shaped.
3. Ask one focused question only if the task is genuinely ambiguous.
4. Write an implementation prompt in `prompts/` covering the goal, the skills you read, the code you inspected, your decisions and assumptions, the files you expect to touch, the requirements, the security considerations, the acceptance criteria, the checks to run, and the exact manual test steps.
5. Ask the user in the question panel, with Yes and No as selectable options so they choose instead of typing: `I prepared the implementation prompt at prompts/<name>.md. Is this good to execute?`
6. Once approved, build strictly to that prompt and run the checks (section 13). Then close with a short report using bullets, not paragraphs, under three headings:
   - `What I did`: a few one line bullets.
   - `Test`: numbered steps to run or see.
   - `Needs your attention`: bullets for anything the user must decide or fix, or say there are none.
     Keep every line short. Put detail and rationale in the prompt file, not in this report.

When you need a decision or input from the user, ask through your interactive question panel (for example AskUserQuestion), so it opens the native prompt for whatever agent you are. Use plain text only if you have no such panel.

Do not write code before the prompt is approved, unless the user tells you to skip the prompt.

---

# 3. UI work

You do not design UI. The user gives you the design as desktop images plus a prompt. Reproduce them exactly: layout, spacing, typography, color, and states. There is no mobile reference, so make each page responsive down to mobile, adapting the layout sensibly (stack columns, collapse the lesson sidebar) while keeping the desktop exact. Do not restyle or improve beyond the reference. Reuse the components and Tailwind patterns already in the project before you add new ones. When there is a reference image, it is the source of truth, and this file says nothing about visuals on purpose.

---

# 4. Skills to lean on

Reach for these instead of guessing. Do not invent new ones.

- sanity-best-practices (`~/.claude/skills/sanity-best-practices/SKILL.md`), for workspace setup, schema, GROQ, TypeGen, Portable Text, and framework integration.
- sanity-migration (`~/.claude/skills/sanity-migration/SKILL.md`), for importing content into Sanity from another system.
- create-agent-with-sanity-context (`.claude/skills/create-agent-with-sanity-context/SKILL.md`), for wiring the search agent to the Context MCP.
- dial-your-context (`.claude/skills/dial-your-context/SKILL.md`), for the Context document's instructions and content filter.
- shape-your-agent (`.claude/skills/shape-your-agent/SKILL.md`), for the search agent's tone and guardrails.
- `node_modules/next/dist/docs/`, for Next.js routing, server and client boundaries, and data fetching.

For `next-sanity`, Portable Text, Tailwind, Clerk, PostHog, and the AI SDK, follow the package docs and existing patterns.

---

# 5. How the app is structured

The project is two standalone workspaces in one repo. Build it this way and do not embed the Studio inside Next.js. Keeping them separate is what preserves independent deploys, Studio auto updates, and TypeGen.

- A Studio workspace holds the Sanity schema and content authoring, nothing else.
- A web workspace holds the Next.js pages, the search UI, and all server side integration.

Inside web, keep these responsibilities apart:

- Pages (catalog, course, lesson, instructor) are read only. They display stored data.
- Auth is Clerk, wired through Next.js middleware. It gates whatever a feature marks as private, keeps its secret key on the server, and exposes only its publishable key to the browser.
- Data access is a server only Sanity client and fetch helper, reading a private dataset with a token.
- The search API is a server route that connects to the Sanity Context MCP, injects the schema and the system prompt, calls the LLM, and streams results back.
- The search UI is a client component that renders the search results page (video results and lesson results) from that response.
- Analytics is PostHog, running in the browser with the public project key and capturing the engagement events. Any server side capture keeps a private key on the server.
- The video pipeline is offline tooling that ingests transcripts and chapters into video documents. It never runs in the request path.
- The search config is a Sanity Context document holding the content scope and the query instructions.

Never cross these boundaries. The browser holds no token, never calls the MCP or the LLM, and never writes content or progress. Any write, such as saving progress, goes through a server route. The UI only shows stored data.

---

# 6. Tech stack

Use Next.js (App Router), Clerk for authentication, PostHog for product analytics, Sanity Studio with `next-sanity`, `@sanity/image-url`, and `@portabletext/react`, Tailwind with typography, the Sanity Context MCP over server side HTTP, the Vercel AI SDK with the OpenAI provider, `react-markdown` only for rendering the search reply, Zod for validating structured output, and TypeScript.

Do not use the `@sanity/context` Studio plugin when it lags the Studio's Sanity major version, `text::semanticSimilarity()` unless embeddings are enabled, an embedded Studio, a public dataset, a client side token, or a separate backend framework. Section 12 explains why.

---

# 7. Decisions already made for you

Build to these unless the user changes them. They exist because search quality and safety depend on them.

- Search is the Sanity Context MCP plus an LLM, and you surface it as result cards, not a chatbox. The LLM writes GROQ over the schema through the MCP, and the UI renders structured lesson cards instead of conversational prose.
- Search is grounded. Say only what the data returns. Never invent a course, lesson, price, duration, or timestamp.
- Video intelligence lives in dedicated video documents, one per unique video. Each holds a table of contents and the transcript split into timestamped pieces (section 8). Lessons link to them by video URL. Treat these documents as an internal lookup and never show them to the user as results.
- Timestamps resolve in two stages. Match the chapters (the table of contents) first, and fall back to matching the transcript only if no chapter matches. Chapter labels are clean, and transcript text is the noisier backstop.
- Playback stays on the site through a provider embed. Videos are YouTube, Vimeo, or Bunny embeds shown on the lesson page with the provider's own player. Do not build a custom player. A result links to the lesson page with a start seconds query param, and the embed starts at that second using the provider's own start parameter. Never send the learner out to the provider.
- Content is coherent from top to bottom. A module's lessons genuinely cover that module's topic. If the lessons are unrelated to their module, search returns junk.
- Content is structured, using Portable Text and typed fields, never markdown. Markdown shows up only in what the search agent replies.
- Authentication is Clerk. Do not use Sanity's auth or roll your own. Keep browsing public and gate only what a feature marks as protected. Learner progress and any other per user state key off the Clerk user id. The browser never writes it directly. Those writes go through a server route with a write token, and this state is kept apart from the read only content the pages render.
- Progress is tracked per learner: which lessons they have completed and where they left off in a lesson (a resume position). Surface it as completion marks and a resume affordance on the catalog, course, and lesson pages.
- Product analytics is PostHog. Instrument the moments that show engagement: catalog and lesson views, a search performed, a video play and how far it is watched, and a lesson completed. The browser uses the public PostHog project key. Keep any private PostHog API key on the server.
- Search is a full results page, not a compact widget and not a chatbox. It returns all ranked matches with a result count and a sort control, and it shows two kinds of result, video moments and lessons (section 11).
- Some surfaces are presentational only, with no backend of their own: the My Learning page, the notifications bell, the lesson Notes tab, and the free preview badge. My Learning may read existing progress for display. Free preview is a label, not access control.

---

# 8. The data you are modeling

Here is the shape of the content in Sanity. The relationships and the fields called out below are fixed. Everything else about each field is yours to choose sensibly.

- A course is the top level. It has a title and slug, marketing fields (summary, cover image, level, price), an optional popular flag and a student count for display, a short list of learning outcomes for the what you'll learn section (each with an icon, a title, and a description), a reference to an instructor and a category, and an ordered list of modules.
- A module is an embedded object inside a course, not its own document. It has a title, a summary, and an ordered list of references to lessons. The numbers shown in the UI, like Module 5 or Lesson 5.1, are derived from order, not stored.
- A lesson is a document. It has a title and slug, a video URL, a poster or thumbnail image, a duration, a free preview flag, and a student count for display. It also has rich text notes in Portable Text, a short list of key points for the in this lesson you will section, an optional pro tip, and a list of resources (each with a type, a title, a description, and a url). A lesson does not store its parent course, so derive the course with a reverse reference when you need it.
- An instructor has a name and slug, a photo, expertise, and a bio. Surface the instructor on the course and lesson, and give each instructor their own page.
- A category has a title and slug and a description.
- A video document is built by the ingestion pipeline (section 9), one per unique video URL. It holds an id and url, a chapters array of `{ startSeconds, label }` for the table of contents, and a chunks array of `{ startSeconds, text }` for the transcript in short timestamped pieces. It never keeps the whole transcript in one field that a query would return wholesale.
- An agent context document is the search configuration: a content scope filter and the search agent's query instructions (section 10).
- A progress record captures a learner's state, keyed by the Clerk user id: which lessons they completed and their last position in a lesson. It is app state, written only through a server route, and kept apart from the read only content above.

---

# 9. How videos get their transcripts

Build the video documents with offline tooling, keyed by an id derived from the video URL, stripping any characters the datastore rejects in ids. Store the transcript as many short timestamped chunks, and store the source's chapter markers as the table of contents. Keep whole transcripts out of anything the request path returns.

The supported providers are YouTube, Vimeo, and Bunny, each shown as an embed on the lesson page. Ingestion is specific to each provider: to support one you need a way to turn its captions into chunks, a source of chapters or authored ones, and a playback and seek case for its embed. Do not treat a provider as supported until both ingestion and playback exist for it.

---

# 10. The search config document

The Sanity Context document lets the user tune the agent without a code change. It carries a content scope filter that limits the visible types to the content ones, and instructions that hold the query guidance from section 11, kept short as deltas the schema does not already make obvious. Use dial-your-context to write it. If the Studio plugin is not available (section 12), create and edit this document by import or through the Sanity MCP. Edits to it reach the agent on the next request, but changes to the inline system prompt need a server restart.

---

# 11. How search must behave

Search is a full results page, not a compact widget and not a chatbox. Keep it behaving like this.

- Return all relevant results, ranked best first, with a count (for example, found 28 results across 8 courses) and a sort control that defaults to most relevant. Do not cap to a handful. When nothing fits, show an empty state that points to the full catalog.
- Results come in two kinds, matching the design.
  - A video result is a lesson's video matched at a specific moment. Carry the course (name and icon), the module and lesson label (for example, Lesson 5.1 in Data Fetching and Caching), a thumbnail, the clip length, a short description, and the matched second. Its action watches from that second on the lesson page.
  - A lesson result is a lesson matched on its own topic. Carry the course, the module and lesson label, the lesson's key points, and a short description. Its action opens the lesson page.
- For a query, search both ways and merge: match lessons on their topic (title and notes), and match video moments (chapters first, then transcript, per section 7). Rank by specificity, so a title that contains the exact concept beats a broad keyword hit.
- Ground every result in real data. Never invent a course, lesson, timestamp, or count. The video documents stay an internal lookup, and a video result is always tied to the lesson that uses that video, never shown on its own.
- Text match is token based, so wildcard your keywords and OR multiple words. Never match a whole phrase as one pattern. You cannot text match a Portable Text field directly, so match its plain text projection.
- Put the critical query and ranking rules in both the inline system prompt and the Context document, because the model follows the system prompt more reliably.

---

# 12. Things that will trip you up

You cannot infer these from the code, so keep them in mind.

- The Context MCP only serves a dataset that has a deployed Studio application. A schema only deploy is not enough.
- The `@sanity/context` Studio plugin may not support the Studio's current Sanity major version. When it does not, do not install it. Edit the Context document by import, and expect Conversation Insights to be unavailable until the plugin catches up.
- Semantic search may be turned off. If `text::semanticSimilarity()` errors with embeddings not enabled, fall back to keyword match with wildcards. Turning embeddings on is a plan and billing decision.
- The model follows the inline system prompt more reliably than the injected Context document instructions, so put the critical rules in both.
- If the system prompt is a template literal, escape backticks inside it or the build fails.
- The search route should cache initial context. Once it does, your instruction and prompt changes only take effect after a server restart.
- Never return a whole transcript or chunks array to the model. It overflows the context window. Fetch only the filtered matches, a few per video.
- The dataset is private. Keep the read token on the server, never expose it to the client, and fetch all content server side.
- Keep project ids and keys in env, expose only client safe values to the browser, and keep a committed `.env.example` as the canonical list.
- Clerk's secret key is server only. Only its publishable key may reach the browser, and protect private routes in Next.js middleware, not in client code.
- Any write token, such as the one used to save progress, is server only and used only inside a server route. The browser never writes content or progress.
- PostHog's project key is public by design and may reach the browser. Any private PostHog API key stays server only.

---

# 13. Checks to run

Run these from the correct workspace and report the real output. Never claim a check passed without running it.

- In web: type check, lint, a production build when routes, config, or server code change, and the dev server.
- In Studio: deploy the Studio application, which is required before the Context MCP will serve the dataset, deploy the schema, and import content and config documents.

After you implement, run the type check and lint at minimum, add a build when routes, config, or server modules changed, and for search or ingestion work verify against the live MCP endpoint.

---

# 14. When in doubt

Keep it small. Use the relevant skill. Preserve the server and client boundaries and the private token rule. Match the provided UI exactly. Get specifics from setup and config instead of hardcoding them. Save a prompt and get approval before coding. Run the checks. Share exact test steps.
