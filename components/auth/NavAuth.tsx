"use client";

import { useEffect } from "react";
import { useAuth, useClerk, useUser, UserButton } from "@clerk/nextjs";
import posthog from "posthog-js";
import { Button } from "@/components/ui/Button";

/** Nav auth controls: Sign in / Get started when signed out, UserButton when signed in. */
export function NavAuth() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  // Identify the signed-in user with PostHog on mount and whenever auth state changes.
  // useEffect is appropriate here as it synchronizes with the external Clerk auth system.
  useEffect(() => {
    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName ?? undefined,
      });
    }
  }, [isSignedIn, user]);

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
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
        onClick={() => { posthog.capture("user_signed_in"); clerk.openSignIn(); }}
        className="hidden text-sm text-neutral-600 transition-colors hover:text-ink-900 sm:block"
      >
        Sign in
      </button>
      <Button onClick={() => { posthog.capture("user_signed_up"); clerk.openSignUp(); }}>Get started</Button>
    </div>
  );
}
