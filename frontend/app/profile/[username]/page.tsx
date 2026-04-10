"use client";

import React from "react";
import { UserProfileExpanded } from "../../../components/profile/UserProfileExpanded";
import { AnimatedBackground } from "../../../components/shared/AnimatedBackground";

export default function ProfilePage(props: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = React.useState<string>("");

  React.useEffect(() => {
    props.params.then(p => setUsername(p.username));
  }, [props.params]);

  if (!username) return null;

  return (
    <main className="min-h-screen relative overflow-x-hidden pt-32 pb-20">
      <AnimatedBackground />

      {/* Container */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10 w-full">
        <UserProfileExpanded username={username} />
      </div>
    </main>
  );
}
