"use client";

import { useClerk } from "@clerk/nextjs";
import posthog from "posthog-js";
import { Button } from "@/components/ui/Button";

/** A primary "start/get started" CTA button — opens the Clerk sign-up flow, same as the nav's "Get started". */
export function CtaButton({ label, ctaId, className }: { label: string; ctaId: string; className?: string }) {
  const clerk = useClerk();

  return (
    <Button
      className={className}
      onClick={() => {
        posthog.capture("cta_clicked", { cta_id: ctaId, cta_label: label });
        clerk.openSignUp();
      }}
    >
      {label}
    </Button>
  );
}
