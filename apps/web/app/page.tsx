"use client";

import { Button } from "@workspace/ui/components/button";
import useAuth from "@/hooks/useAuth";

export default function Page() {
  const { session } = useAuth();

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="text-muted-foreground font-mono text-xs">
          (Press <kbd>d</kbd> to toggle dark mode!)
        </div>
        {/* <Button onClick={handleSignUp}>Sign Up!</Button> */}
        <div>
          <h2 className="font-medium">Session Info</h2>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
