"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type LessonProgressContextValue = {
  completed: boolean;
  toggleCompleted: () => void;
};

const LessonProgressContext = createContext<LessonProgressContextValue | null>(null);

/**
 * Local-only "mark complete" state for the lesson currently being viewed —
 * there's no progress backend yet (a separate future feature), so this never
 * persists past a reload. Shared between the header button and the sidebar
 * row via context since they sit in different, server-rendered branches of
 * the page.
 */
export function LessonProgressProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState(false);
  return (
    <LessonProgressContext.Provider
      value={{ completed, toggleCompleted: () => setCompleted((v) => !v) }}
    >
      {children}
    </LessonProgressContext.Provider>
  );
}

export function useLessonProgress() {
  const ctx = useContext(LessonProgressContext);
  if (!ctx) {
    throw new Error("useLessonProgress must be used within a LessonProgressProvider");
  }
  return ctx;
}
