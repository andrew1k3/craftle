"use client";

import { Button } from "@workspace/ui/components/button";
import useAuth from "@/hooks/useAuth";
import { getAuthedTestUsers } from "@/lib/api-client";
import { useState } from "react";
import { TestUser } from "@workspace/contracts/users";

export default function Page() {
  const { session } = useAuth();

  const [authedUsers, setAuthedUsers] = useState<TestUser[] | null>(null);

  const handleFetchAuthedUsers = async () => {
    try {
      const users = await getAuthedTestUsers({ limit: 5, offset: 0 });
      console.log("Fetched authed users:", users);
      setAuthedUsers(users);
    } catch (error) {
      console.error("Error fetching authed users:", error);
    }
  };

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
            {session.isPending ? (
              <p>Loading session...</p>
            ) : (
              JSON.stringify(session, null, 2)
            )}
          </pre>
        </div>
        <div>
          <h2 className="font-medium">Authed fetch</h2>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
            {!authedUsers ? (
              <p>Nothing fetched...</p>
            ) : (
              JSON.stringify(authedUsers, null, 2)
            )}
          </pre>
          <Button onClick={handleFetchAuthedUsers} className="mt-2">
            Fetch Authed Users
          </Button>
        </div>
      </div>
    </div>
  );
}
