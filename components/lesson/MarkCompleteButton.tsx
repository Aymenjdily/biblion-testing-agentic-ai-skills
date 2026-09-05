"use client";

import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/icons";
import { useLessonProgress } from "@/components/lesson/LessonProgressContext";

export function MarkCompleteButton() {
  const { completed, toggleCompleted } = useLessonProgress();

  return (
    <Button
      variant="secondary"
      onClick={toggleCompleted}
      className={completed ? "border-success text-success" : undefined}
    >
      <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
      {completed ? "Completed" : "Mark complete"}
    </Button>
  );
}
