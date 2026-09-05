"use client";

import { useState } from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import {
  CheckIcon,
  CourseIcon,
  ListIcon,
  NextIcon,
  ProTipIcon,
  SavedIcon,
} from "@/components/icons";
import { clsx } from "@/lib/clsx";

type Resource = { type: string; title: string; description?: string; url: string };

const RESOURCE_ICONS: Record<string, typeof SavedIcon> = {
  link: SavedIcon,
  article: CourseIcon,
  download: SavedIcon,
  code: ListIcon,
};

const portableTextComponents: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h2 className="mt-8 font-display text-2xl font-bold text-ink-900 first:mt-0">{children}</h2>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 font-display text-xl font-bold text-ink-900 first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 font-display text-lg font-semibold text-ink-900 first:mt-0">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mt-4 text-[15px] leading-7 text-neutral-600 first:mt-0">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-4 border-l-2 border-ember-600 pl-4 text-[15px] italic text-neutral-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px] text-neutral-600">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-[15px] text-neutral-600">
        {children}
      </ol>
    ),
  },
};

function LessonNotesTab({
  keyPoints,
  notes,
  proTip,
}: {
  keyPoints: string[];
  notes: unknown;
  proTip?: string;
}) {
  return (
    <div>
      {keyPoints.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">In this lesson you will</h2>
          <ul className="mt-4 space-y-3">
            {keyPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px] text-neutral-700">
                <CheckIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-ember-600" strokeWidth={2.4} />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(notes) && notes.length > 0 && (
        <div className={keyPoints.length > 0 ? "mt-8" : ""}>
          <PortableText value={notes} components={portableTextComponents} />
        </div>
      )}

      {proTip && (
        <div className="mt-8 rounded-control border-l-2 border-ember-600 bg-soft px-5 py-4">
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-ember-700">
            <ProTipIcon className="h-3.5 w-3.5" />
            PRO TIP
          </p>
          <p className="mt-1.5 text-[15px] leading-7 text-ember-900">{proTip}</p>
        </div>
      )}
    </div>
  );
}

function ResourcesTab({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) {
    return <p className="text-sm text-neutral-500">No resources for this lesson.</p>;
  }

  return (
    <div className="space-y-3">
      {resources.map((resource) => {
        const Icon = RESOURCE_ICONS[resource.type] ?? SavedIcon;
        return (
          <a
            key={resource.url}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-control border border-border bg-surface px-5 py-4 transition-colors hover:bg-neutral-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-soft text-ember-600">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[10px] tracking-wide text-neutral-400">
                {resource.type.toUpperCase()}
              </span>
              <span className="block font-medium text-ink-900">{resource.title}</span>
              {resource.description && (
                <span className="mt-0.5 block text-sm text-neutral-500">
                  {resource.description}
                </span>
              )}
            </span>
            <NextIcon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          </a>
        );
      })}
    </div>
  );
}

const TABS = ["Lesson notes", "Resources", "Transcript"] as const;
type Tab = (typeof TABS)[number];

export function LessonTabs({
  keyPoints,
  notes,
  proTip,
  resources,
}: {
  keyPoints: string[];
  notes: unknown;
  proTip?: string;
  resources: Resource[];
}) {
  const [active, setActive] = useState<Tab>("Lesson notes");

  return (
    <div>
      <div className="flex gap-8 overflow-x-auto border-b border-border [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={clsx(
              "-mb-px shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors",
              active === tab
                ? "border-ember-600 text-ink-900"
                : "border-transparent text-neutral-500 hover:text-ink-900",
            )}
          >
            {tab === "Resources" && resources.length > 0 ? `Resources · ${resources.length}` : tab}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {active === "Lesson notes" && (
          <LessonNotesTab keyPoints={keyPoints} notes={notes} proTip={proTip} />
        )}
        {active === "Resources" && <ResourcesTab resources={resources} />}
        {active === "Transcript" && (
          <p className="text-sm text-neutral-500">
            Transcript isn&apos;t available for this lesson yet.
          </p>
        )}
      </div>
    </div>
  );
}
