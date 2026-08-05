"use client";

import { 
  LayoutDashboard, 
  MessageSquare, 
  Receipt, 
  PiggyBank, 
  Target, 
  TrendingUp, 
  BarChart3,
  Bell,
  Settings,
  ChevronDown,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  Coffee,
  Car,
  Wallet
} from "lucide-react";

export default function HeroMockup() {
  return (
    <div className="w-[1000px] h-[650px] bg-[#F9FAFB] rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex overflow-hidden border border-white relative transform origin-top-left scale-[0.85] xl:scale-100">
      
      {/* Sidebar */}
      <div className="w-[240px] bg-[#164132] text-white/90 flex flex-col justify-between py-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white px-8 mb-10 tracking-tight">
            Grove.
          </h1>
          <nav className="space-y-1 px-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-white text-[#164132] rounded-xl font-bold text-[13px] shadow-sm">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </div>
            {[
              { label: "Chat", icon: MessageSquare },
              { label: "Expenses", icon: Receipt },
              { label: "Budgets", icon: PiggyBank },
              { label: "Goals", icon: Target },
              { label: "Investments", icon: TrendingUp },
              { label: "Reports", icon: BarChart3 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3 text-white/70 font-semibold text-[13px] hover:bg-white/10 rounded-xl cursor-default transition-colors">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            ))}
          </nav>
        </div>
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center overflow-hidden border-2 border-white/20">
              <div className="w-full h-full bg-gradient-to-tr from-amber-400 to-orange-300" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">Dev User</p>
              <p className="text-[10px] font-medium text-white/50">devuser@gmail.com</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-white/50" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 flex flex-col gap-6 relative bg-[#FAFBFA]">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-[#164132] tracking-tight">Good morning, Dev! 👋</h2>
            <p className="text-sm font-semibold text-[#164132]/60 mt-1">Here&apos;s what&apos;s happening with your finances today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#164132]/5 text-[#164132]">
              <Bell className="w-4 h-4" />
            </div>
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#164132]/5 text-[#164132]">
              <Settings className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-5">
          {/* Stat 1 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#164132]/5 flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#164132]/60">Total Balance</p>
              <p className="text-3xl font-extrabold text-[#164132] mt-2 mb-3">₹1,24,560</p>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit">
                <ArrowUpRight className="w-3 h-3" />
                12.5% vs last month
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          {/* Stat 2 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#164132]/5 flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#164132]/60">Monthly Spending</p>
              <p className="text-3xl font-extrabold text-[#164132] mt-2 mb-3">₹48,230</p>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md w-fit">
                <ArrowDownRight className="w-3 h-3" />
                8.2% vs last month
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          {/* Stat 3 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#164132]/5 flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#164132]/60">Savings Rate</p>
              <p className="text-3xl font-extrabold text-[#164132] mt-2 mb-3">32%</p>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit">
                <ArrowUpRight className="w-3 h-3" />
                5% vs last month
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-emerald-600">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Two Columns */}
        <div className="grid grid-cols-5 gap-5 flex-1 min-h-0">
          
          {/* Main Column */}
          <div className="col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-[#164132]/5 flex flex-col">
            <h3 className="text-[13px] font-bold text-[#164132] mb-8">Spending Overview</h3>
            <div className="flex items-center justify-center gap-12 flex-1">
              {/* Fake Donut Chart */}
              <div className="relative w-44 h-44 rounded-full border-[24px] border-[#417B5A] border-t-[#8DB596] border-r-[#D4E4D7] border-b-[#EAEFF1] shadow-inner flex items-center justify-center transform -rotate-45">
                <div className="transform rotate-45 text-center">
                  <p className="text-xl font-extrabold text-[#164132]">₹48,230</p>
                  <p className="text-[10px] font-bold text-[#164132]/50 uppercase tracking-widest mt-0.5">Total</p>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-4 text-[12px] font-semibold w-36">
                <div className="flex justify-between items-center"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#417B5A]" />Housing</span><span className="text-[#164132]/60 font-bold">₹18,200</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#8DB596]" />Food & Dining</span><span className="text-[#164132]/60 font-bold">₹8,450</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#D4E4D7]" />Transport</span><span className="text-[#164132]/60 font-bold">₹6,320</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#EAEFF1]" />Utilities</span><span className="text-[#164132]/60 font-bold">₹5,280</span></div>
                <div className="flex justify-between items-center"><span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#F3F4F6]" />Others</span><span className="text-[#164132]/60 font-bold">₹9,000</span></div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-2 flex flex-col gap-5">
            {/* AI Insight */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#164132]/5 flex-1 relative overflow-hidden">
              <h3 className="text-[13px] font-bold text-[#164132] mb-3">AI Insight</h3>
              <p className="text-[13px] font-medium text-[#164132]/70 leading-relaxed pr-8">
                Great job! You&apos;ve spent 8% less on dining out this month.
              </p>
              <button className="mt-4 px-4 py-2 bg-[#164132] text-white text-[11px] font-bold rounded-full">
                View Details
              </button>
              {/* Fake plant graphic */}
              <div className="absolute -right-4 -bottom-6 w-24 h-24 text-[#8DB596] opacity-40">
                <Leaf className="w-full h-full" />
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#164132]/5 flex-[1.5]">
              <h3 className="text-[13px] font-bold text-[#164132] mb-5">Recent Transactions</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-[#164132]">Starbucks</p>
                      <p className="text-[10px] font-semibold text-[#164132]/50">Today</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-[#164132]">- ₹350</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-[#164132]">Uber</p>
                      <p className="text-[10px] font-semibold text-[#164132]/50">Yesterday</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-[#164132]">- ₹520</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center text-emerald-600">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-[#164132]">Salary</p>
                      <p className="text-[10px] font-semibold text-[#164132]/50">24 July</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-emerald-600">+ ₹75,000</p>
                </div>
              </div>
              <div className="text-center mt-5">
                <button className="text-[11px] font-bold text-[#164132]/60 hover:text-[#164132]">View All</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Input Bar */}
        <div className="absolute bottom-6 left-10 right-10 bg-white rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-[#164132]/5 p-2 flex items-center pr-3">
          <input 
            type="text" 
            placeholder="Ask Grove anything about your finances..." 
            className="flex-1 bg-transparent border-none outline-none px-6 text-[13px] font-semibold placeholder-[#164132]/40 text-[#164132]"
            disabled
          />
          <button className="w-9 h-9 rounded-full bg-[#164132]/5 flex items-center justify-center mr-2">
            <MessageSquare className="w-4 h-4 text-[#164132]/60" />
          </button>
          <button className="w-10 h-10 rounded-full bg-[#8DB596] flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </button>
        </div>

      </div>
    </div>
  );
}
