import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import DevModeButton from "@/components/DevModeButton";
import HeroMockup from "@/components/HeroMockup";
import { Leaf, Sparkles, Shield, Gift, ArrowRight } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen relative overflow-hidden bg-[var(--background)] text-[#164132] flex flex-col font-sans">
      
      {/* Background Leaves (Top Left) */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] pointer-events-none opacity-40 z-0">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-50 -50 C 100 -50, 250 50, 200 200 C 150 350, 0 350, -50 200 C -100 50, -200 -50, -50 -50 Z" fill="#D4E4D7" opacity="0.6"/>
          <path d="M-80 -20 C 50 0, 180 80, 150 180 C 120 280, -20 300, -80 180 C -140 60, -210 -40, -80 -20 Z" fill="#8DB596" opacity="0.4"/>
        </svg>
      </div>

      {/* Background Leaves (Bottom Right) */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-40 z-0 transform rotate-180 origin-center">
        <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-50 -50 C 150 -50, 350 100, 300 300 C 250 500, 0 500, -50 300 C -100 100, -200 -50, -50 -50 Z" fill="#D4E4D7" opacity="0.6"/>
          <path d="M-80 -20 C 100 0, 280 120, 250 280 C 220 440, -20 450, -80 280 C -140 110, -210 -40, -80 -20 Z" fill="#FDE68A" opacity="0.4"/>
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-10 py-6 max-w-[1440px] w-full mx-auto">
        <div className="text-4xl font-serif font-extrabold tracking-tight">
          Grove.
        </div>
        
        <div className="hidden md:flex items-center gap-10 font-bold text-[15px] text-[#164132]/80">
          <Link href="#features" className="hover:text-[#164132] transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-[#164132] transition-colors">How It Works</Link>
          <Link href="#resources" className="hover:text-[#164132] transition-colors">Resources</Link>
          <Link href="#pricing" className="hover:text-[#164132] transition-colors">Pricing</Link>
        </div>

        <div>
          {!userId ? (
            <SignUpButton mode="modal">
              <button className="px-8 py-3.5 bg-[#164132] text-white rounded-full font-bold text-[15px] hover:bg-[#164132]/90 transition-colors shadow-lg">
                Get Started
              </button>
            </SignUpButton>
          ) : (
            <Link href="/dashboard" className="px-8 py-3.5 bg-[#164132] text-white rounded-full font-bold text-[15px] hover:bg-[#164132]/90 transition-colors shadow-lg inline-block">
              Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto px-10 py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Column - Content */}
        <div className="flex-1 max-w-xl flex flex-col items-start pt-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-white backdrop-blur-md shadow-sm mb-8">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span className="text-[13px] font-bold text-[#164132] tracking-wide">Your AI Financial Companion</span>
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-[80px] leading-[1.05] font-serif font-bold text-[#164132] tracking-tight mb-6">
            Where financial<br />
            confidence <span className="italic text-[#8DB596] font-light">grows.</span>
          </h1>

          <p className="text-[19px] font-medium text-[#164132]/80 leading-relaxed mb-10 max-w-[480px]">
            Grove helps you understand your money, make smarter decisions, and build a better future.
          </p>

          <div className="flex items-center gap-6 mb-16">
            {!userId ? (
              <>
                <SignUpButton mode="modal">
                  <button className="group flex items-center gap-3 px-8 py-4 bg-[#164132] text-white rounded-full font-bold text-[17px] shadow-xl hover:shadow-2xl transition-all">
                    Get Started
                    <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4 text-[#164132]" />
                    </div>
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="px-8 py-4 bg-transparent border-2 border-[#164132] text-[#164132] rounded-full font-bold text-[17px] hover:bg-[#164132]/5 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </>
            ) : (
              <Link href="/dashboard" className="group flex items-center gap-3 px-8 py-4 bg-[#164132] text-white rounded-full font-bold text-[17px] shadow-xl hover:shadow-2xl transition-all">
                Enter Dashboard
                <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-[#164132]" />
                </div>
              </Link>
            )}
          </div>

          {/* Features Row */}
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/60 shadow-sm border border-white flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#8DB596]" />
              </div>
              <span className="text-[15px] font-bold leading-tight">AI-Powered<br />Insights</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/60 shadow-sm border border-white flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#8DB596]" />
              </div>
              <span className="text-[15px] font-bold leading-tight">Bank-Level<br />Security</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/60 shadow-sm border border-white flex items-center justify-center">
                <Gift className="w-5 h-5 text-[#8DB596]" />
              </div>
              <span className="text-[15px] font-bold leading-tight">100% Free<br />to Start</span>
            </div>
          </div>
        </div>

        {/* Right Column - Mockup */}
        <div className="flex-1 flex justify-end relative">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-[40px] transform translate-x-10 translate-y-10" />
            <HeroMockup />
          </div>
        </div>

      </div>

      {/* Developer mode bypass */}
      <DevModeButton />
    </main>
  );
}
