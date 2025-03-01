"use client";

import React, { Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import StockInfo from "@/app/paperTrading/StockInfo";
import StockChart from "@/app/paperTrading/StockChart";
import TradingPanel from "@/app/paperTrading/TradingPanel";
import Link from "next/link";

// Placeholder loading component
const Loading = () => <div>Loading...</div>;

const PaperTrading = () => {
  return (
    <Suspense fallback={<Loading />}>
      <PaperTradingContent />
    </Suspense>
  );
};

const PaperTradingContent = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname(); // Get current path

  const ticker = searchParams.get("ticker") || "MSFT"; // Default to MSFT if not provided

  return (
    <div className="flex flex-col bg-black text-white p-6 gap-6 min-h-screen">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-700 pb-2">
        {[
          { path: "/paperTrading", label: "Chart" }, // Main page
          { path: "/paperTrading/options", label: "Options" },
          { path: "/paperTrading/news", label: "News" },
          { path: "/paperTrading/financials", label: "Financials" },
          { path: "/paperTrading/analysis", label: "Analysis" },
          { path: "/paperTrading/risk-analysis", label: "Risk Analysis" },
          { path: "/paperTrading/releases", label: "Releases" },
          { path: "/paperTrading/notes", label: "Notes" },
          { path: "/paperTrading/profile", label: "Profile" },
        ].map((tab) => (
          <Link key={tab.path} href={`${tab.path}?ticker=${ticker}`}>
            <button
              className={`px-4 py-2 text-sm rounded-md transition-all ${
                pathname === tab.path ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          </Link>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <StockInfo ticker={ticker} />
          <StockChart ticker={ticker} />
        </div>

        {/* Trading Panel (Right Side) */}
        <div className="w-1/3">
          <TradingPanel ticker={ticker} />
        </div>
      </div>
    </div>
  );
};

export default PaperTrading;

// "use client";

// import React, { Suspense } from "react";
// import { useSearchParams, usePathname } from "next/navigation";
// import StockInfo from "@/app/paperTrading/StockInfo";
// import StockChart from "@/app/paperTrading/StockChart";
// import TradingPanel from "@/app/paperTrading/TradingPanel";
// import OptionsPage from "@/app/paperTrading/options/OptionsPage"; // Ensure this is imported!
// import Link from "next/link";

// // Placeholder loading component
// const Loading = () => <div>Loading...</div>;

// const PaperTrading = () => {
//   return (
//     <Suspense fallback={<Loading />}>
//       <PaperTradingContent />
//     </Suspense>
//   );
// };

// const PaperTradingContent = () => {
//   const searchParams = useSearchParams();
//   const pathname = usePathname(); // Get current path

//   const ticker = searchParams.get("ticker") || "MSFT"; // Default to MSFT if not provided

//   return (
//     <div className="flex flex-col bg-black text-white p-6 gap-6 min-h-screen">
//       {/* Navigation Tabs */}
//       <div className="flex space-x-4 border-b border-gray-700 pb-2">
//         {[
//           { path: "/paperTrading", label: "Chart" },
//           { path: "/paperTrading/options", label: "Options" }, // Options Link
//           { path: "/paperTrading/news", label: "News" },
//         ].map((tab) => (
//           <Link key={tab.path} href={`${tab.path}?ticker=${ticker}`}>
//             <button
//               className={`px-4 py-2 text-sm rounded-md transition-all ${
//                 pathname.startsWith(tab.path) ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
//               }`}
//             >
//               {tab.label}
//             </button>
//           </Link>
//         ))}
//       </div>

//       {/* ✅ If user is on /paperTrading/options, show OptionsPage */}
//       {pathname.startsWith("/paperTrading/options") ? (
//         <OptionsPage />
//       ) : (
//         <>
//           <div className="flex-1 flex flex-col gap-6">
//             <StockInfo ticker={ticker} />
//             <StockChart ticker={ticker} />
//           </div>
//           <div className="w-1/3">
//             <TradingPanel ticker={ticker} />
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default PaperTrading;
