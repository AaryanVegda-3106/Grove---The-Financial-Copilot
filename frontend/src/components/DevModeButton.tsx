"use client";

import { useRouter } from "next/navigation";

export default function DevModeButton() {
  const router = useRouter();

  const handleDevMode = () => {
    // Set a cookie to bypass auth in middleware
    document.cookie = "dev_mode=true; path=/; max-age=86400"; // 24h
    router.push("/dashboard");
  };

  return (
    <button
      onClick={handleDevMode}
      className="fixed bottom-6 right-6 px-5 py-2.5 bg-amber-500/90 text-black rounded-full font-mono text-sm font-semibold hover:bg-amber-400 transition-all shadow-lg backdrop-blur-sm border border-amber-400/50 flex items-center gap-2 z-50"
      title="Bypass login and go directly to dashboard"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
      Dev Mode
    </button>
  );
}
