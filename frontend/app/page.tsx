"use client";

import { useEffect, useState } from "react";
import { Dashboard } from "@/components/features/dashboard/Dashboard";

export default function Home() {

  return (
    <main className="min-h-screen relative">
      <Dashboard />
    </main>
  );
}
