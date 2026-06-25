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
        // Profile doesn't exist yet — redirect to onboarding
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
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Leaf className="w-10 h-10 text-[var(--foreground)] animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-[var(--foreground)]/60">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading Grove...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[var(--background)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Hey, {userName} 👋
            </h2>
            <p className="text-sm text-[var(--foreground)]/50">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
