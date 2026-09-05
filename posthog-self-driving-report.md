# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for Biblion. Session Replay, Error Tracking, and Support were enabled; health, error, and support signal sources were enabled; and a focused scout troop plus two Replay Vision monitors were created.

New findings should begin appearing in the [Self-driving inbox](https://us.posthog.com/project/588847/inbox) within about 30 minutes as fresh data and recordings arrive.

## AI data processing

Approved by the wizard's organization-level gate before this setup ran.

## GitHub

The PostHog GitHub App was already connected before this setup. GitHub Issues was not selected as a Self-driving source, so no GitHub Issues responder was enabled.

## Products enabled

| Product | Result | Notes |
|---|---|---|
| Session Replay | enabled | Web client initialization does not disable recording. No qualifying recordings were found during setup, so scanners are armed for the first incoming recordings. |
| Error Tracking | enabled | Web client initialization explicitly enables exception capture. |
| Support | enabled | Tickets start arriving only after an inbound Support channel (email, inbox, or Slack) is connected. |

## Signal sources

| Signal source | Action | Details |
|---|---|---|
| `signals_scout` / `cross_source_issue` | already enabled by default | Scout findings can reach the inbox without a configuration row. |
| `health_checks` / `health_issue` | enabled | Configuration `01a06f22-9e8f-710e-9610-49a1a25fe310`. |
| `error_tracking` / `issue_created` | enabled | Configuration `01a06f22-9f6e-745f-9d9b-1e2382aacefc`. |
| `error_tracking` / `issue_reopened` | enabled | Configuration `01a06f22-9f6e-7c78-8133-bb90f0a0636f`. |
| `error_tracking` / `issue_spiking` | enabled | Configuration `01a06f22-9f0f-7c93-b500-c1f6edb50e1b`. |
| `conversations` / `ticket` | enabled | Configuration `01a06f22-9ea6-7925-a9f6-9beb88052729`; dormant until a Support channel is connected. |
| Session Replay responder | deliberately skipped | Replay Vision scanners are the active inbox route; the retired session-analysis responder was not created. |

## Connected tools

No issue trackers, external error trackers, support desks, security scanners, or search tools were selected. No external-tool responders were enabled.

## Scout troop

**Active scouts (5):**

| Scout | Reason |
|---|---|
| `signals-scout-general` | Cross-product correlations and otherwise uncovered surfaces. |
| `signals-scout-product-analytics` | Core learning-flow conversion, retention, lifecycle, and engagement. |
| `signals-scout-web-analytics` | Web traffic, attribution, and landing-page health. |
| `signals-scout-web-vitals` | Browser performance regressions by page. |
| `signals-scout-course-start-journey` | Custom course-view to lesson-start conversion coverage. |

**Disabled built-in scouts (23):** AI observability, anomaly detection, APM, conversations, CSP violations, customer analytics, data pipelines, data warehouse, error tracking, experiments, feature flags, health checks, inbox validation, insight alerts, logs, MCP tool calls, observability gaps, Replay Vision, revenue analytics, session replay, skills store, surveys, and tasks. These surfaces had no confirmed active use, were less central to this web learning product, or are already covered by a dedicated route. Error tracking is covered by its native responder; session replay is covered by the two Replay Vision monitors.

| Run budget | Value |
|---|---|
| Maximum runs per day | 100 |
| Runs used today | 0 |
| Runs remaining today | 100 |
| Announcement | Scouts are in early access. Each project gets up to 100 scout runs a day. Contact `team-self-driving@posthog.com` if more are needed. |

## Custom scouts

| Scout | What it watches | Discriminator | Why it is distinct |
|---|---|---|---|
| `signals-scout-course-start-journey` | The learning journey from `course_viewed` to `lesson_started`, including individual course behavior. | Course-to-start conversion among distinct learners, only when course-view volume holds and a sufficient baseline exists. | The generic product-analytics scout monitors saved flows; this scout owns Biblion's named course-to-first-lesson journey and course-level breakage. |

The custom scout was proposed and approved. Search-demand monitoring was considered but ruled out because the existing `search_performed` event records query length only, not a result count or outcome, so it cannot distinguish unmet demand from normal search use.

If this scout is noisy, set `emit: false` on its scout configuration in PostHog to keep it in dry-run mode.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes qualifying visible defects to the inbox. These are the only items in this setup that spend Replay Vision quota. Findings arrive at half weight and require corroboration before promotion into a report.

| Scanner | Status | Query scope | Sampling | Estimated monthly spend |
|---|---|---|---:|---:|
| **Biblion course-start breakage** | created | Recordings visiting `/courses/` or `/lessons/`, covering the course-to-lesson-start journey. | 50% | 0 observations / 0 credits |
| **Biblion learner frustration** | created | Recordings containing `$rageclick` only; intentionally not URL-scoped to limit overlap with the breakage monitor. | 100% | 0 observations / 0 credits |

The organization has 2,500 Replay Vision credits remaining in the current period and is not exhausted. Both monitors currently estimate zero spend because no matching recordings were found; they remain armed and begin scanning once recordings arrive.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) so the enabled ticket responder can receive customer conversations.
- [ ] Generate real browser sessions after deploying the web client so Session Replay and the two Replay Vision monitors have recordings to inspect.
- [ ] Re-authenticate the PostHog MCP with `property_definition:read` if event-schema confirmation is needed; this scope was unavailable during setup. The custom scout safely closes out until its required event data is present.

## What happens next

Fresh scout configurations are picked up within about 30 minutes and draw from the verified 100-runs-per-day allowance. Self-driving groups corroborated findings into reports in the inbox, where immediately actionable reports can begin coding tasks.

## Repository changes

| File | Change |
|---|---|
| `posthog-self-driving-report.md` | Created this setup report. |

No application source files were modified.