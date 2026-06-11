import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-screen relative overflow-hidden bg-[var(--background)]">
      {/* Abstract background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--foreground)] opacity-[0.03] rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--foreground)] opacity-[0.02] rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>
      
      <div className="z-10 flex flex-col items-center gap-8 max-w-3xl">
        <h1 className="text-8xl sm:text-9xl font-bold font-serif tracking-tight text-[var(--foreground)]">
          Grove.
        </h1>
        
        <p className="text-xl sm:text-2xl font-light tracking-wide text-[var(--foreground)]/80">
          Where financial confidence grows.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {!userId ? (
            <>
              <SignUpButton mode="modal">
                <button className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-full font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg">
                  Get Started
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-4 border-2 border-[var(--foreground)]/30 text-[var(--foreground)] rounded-full font-semibold text-lg hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all">
                  Sign In
                </button>
              </SignInButton>
            </>
          ) : (
            <Link href="/dashboard" className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-full font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
