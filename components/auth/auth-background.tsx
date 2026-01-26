"use client";

import { useState } from "react";

export function AuthBackground({ children }: { children: React.ReactNode }) {
  const [randomSeed] = useState(() => Math.random().toString(36).substring(7));

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-center bg-cover bg-no-repeat p-6 md:p-10"
      style={{
        backgroundImage: `url(https://picsum.photos/seed/${randomSeed}/1920/1080.jpg)`,
      }}
    >
      <div className="absolute inset-0 bg-background/50" />
      {children}
    </div>
  );
}
