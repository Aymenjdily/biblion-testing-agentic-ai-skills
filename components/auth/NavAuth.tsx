"use client";

import { useAuth, useClerk, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { AlertsIcon } from "@/components/icons";

/** Nav auth controls: Sign in / Get started when signed out, notifications bell + UserButton when signed in. */
export function NavAuth() {
  const { isSignedIn } = useAuth();
  const clerk = useClerk();

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-control border border-border bg-surface text-ink-900 transition-colors duration-[120ms] hover:bg-neutral-50"
        >
          <AlertsIcon className="h-4 w-4" />
        </button>
        <UserButton
          appearance={{ elements: { avatarBox: "h-10 w-10" } }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <button
        type="button"
        onClick={() => clerk.openSignIn()}
        className="hidden text-sm text-neutral-600 transition-colors hover:text-ink-900 sm:block"
      >
        Sign in
      </button>
      <Button onClick={() => clerk.openSignUp()}>Get started</Button>
    </div>
  );
}
