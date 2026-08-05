"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import { getProfile } from "@/lib/api";
import { Leaf, Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    async function checkOnboarding() {
      try {
        const profile = await getProfile(() => getToken());
        setUserName(profile.name || "there");

        if (!profile.onboarding_completed) {
          router.replace("/onboarding");
          return;
        }
      } catch {
        router.replace("/onboarding");
        return;
      }
      setLoading(false);
    }

    checkOnboarding();
  }, [isLoaded, getToken, router]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative">
            <Leaf className="w-10 h-10 text-[var(--foreground)] animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-[var(--foreground)]/60">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Loading Grove...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden text-[var(--foreground)] relative">
      {/* Abstract Background for Glassmorphism */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--foreground)]/5 blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#059669]/5 blur-[120px] mix-blend-multiply" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-amber-500/5 blur-[80px] mix-blend-multiply" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-0 z-10">{children}</main>
      </div>
    </div>
  );
}
