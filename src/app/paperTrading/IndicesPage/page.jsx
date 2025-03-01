// "use client";

// import React, { Suspense } from "react";
// import { useSearchParams, usePathname } from "next/navigation";
// import IndicesInfo from "@/app/paperTrading/IndicesPage/IndicesInfo";
// import IndicesChart from "@/app/paperTrading/IndicesPage/IndicesChart";
// import Link from "next/link";

// // Placeholder loading component
// const Loading = () => <div>Loading...</div>;

// const IndicesPage = () => {
//   return (
//     <Suspense fallback={<Loading />}>
//       <IndicesPageContent />
//     </Suspense>
//   );
// };

// const IndicesPageContent = () => {
//   const searchParams = useSearchParams();
//   const pathname = usePathname();

//   const ticker = searchParams.get("ticker") || "^NSEI"; // Default to Nifty 50

//   return (
//     <div className="flex flex-col bg-black text-white p-6 gap-6 min-h-screen">
//       {/* Navigation Tabs */}
//       <div className="flex space-x-4 border-b border-gray-700 pb-2">
//         {[
//           { path: "/paperTrading/IndicesPage", label: "Chart" },
//           { path: "/paperTrading/IndicesPage/options", label: "Options" },
//           { path: "/paperTrading/IndicesPage/news", label: "News" },
//           { path: "/paperTrading/IndicesPage/financials", label: "Financials" },
//           { path: "/paperTrading/IndicesPage/analysts", label: "Analysts" },
//           { path: "/paperTrading/IndicesPage/risk-analysis", label: "Risk Analysis" },
//           { path: "/paperTrading/IndicesPage/releases", label: "Releases" },
//           { path: "/paperTrading/IndicesPage/notes", label: "Notes" },
//           { path: "/paperTrading/IndicesPage/profile", label: "Profile" },
//         ].map((tab) => (
//           <Link key={tab.path} href={`${tab.path}?ticker=${ticker}`}>
//             <button
//               className={`px-4 py-2 text-sm rounded-md transition-all ${
//                 pathname === tab.path ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
//               }`}
//             >
//               {tab.label}
//             </button>
//           </Link>
//         ))}
//       </div>

//       {/* Main Content Layout */}
//       <div className="flex flex-row gap-6">
//         {/* Left Side: Indices Info & Charts */}
//         <div className="flex-1 flex flex-col gap-6">
//           <IndicesInfo ticker={ticker} />
//           <IndicesChart ticker={ticker} />
//         </div>

//         {/* Right Side: Trading Panel Placeholder */}
//         <div className="w-1/3">
//           <div className="bg-gray-800 p-4 rounded-md text-center text-gray-300">
//             Trading Panel (Coming Soon)
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default IndicesPage;







"use client";

import React, { Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import IndicesInfo from "@/app/paperTrading/IndicesPage/IndicesInfo";
import IndicesChart from "@/app/paperTrading/IndicesPage/IndicesChart";
import TradingOptionsPanel from "@/app/paperTrading/IndicesPage/TradingOptionsPanel";
import Link from "next/link";

// Placeholder loading component
const Loading = () => <div>Loading...</div>;

const IndicesPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <IndicesPageContent />
    </Suspense>
  );
};

const IndicesPageContent = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const ticker = searchParams.get("ticker") || "^NSEI"; // Default to Nifty 50

  return (
    <div className="flex flex-col bg-black text-white p-6 gap-6 min-h-screen">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-700 pb-2">
        {[
          { path: "/paperTrading/IndicesPage", label: "Chart" },
          { path: "/paperTrading/IndicesPage/options", label: "Options" },
          { path: "/paperTrading/IndicesPage/news", label: "News" },
          { path: "/paperTrading/IndicesPage/financials", label: "Financials" },
          { path: "/paperTrading/IndicesPage/analysts", label: "Analysts" },
          { path: "/paperTrading/IndicesPage/risk-analysis", label: "Risk Analysis" },
          { path: "/paperTrading/IndicesPage/releases", label: "Releases" },
          { path: "/paperTrading/IndicesPage/notes", label: "Notes" },
          { path: "/paperTrading/IndicesPage/profile", label: "Profile" },
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
        {/* Left Side: Indices Info & Charts */}
        <div className="flex-1 flex flex-col gap-6">
          <IndicesInfo ticker={ticker} />
          <IndicesChart ticker={ticker} />
        </div>

        {/* Right Side: Trading Options Panel */}
        <div className="w-1/3">
          <TradingOptionsPanel />
        </div>
      </div>
    </div>
  );
};

export default IndicesPage;
