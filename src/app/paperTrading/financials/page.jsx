// "use client";
// import React from "react";

// const Financials = () => {
//   return (
//     <div className="flex justify-center items-center h-screen text-gray-400">
//       <h1 className="text-2xl">Financials Page - Balance Sheets & Reports</h1>
//     </div>
//   );
// };

// export default Financials;

// "use client";

// import React, { useState } from "react";
// import { useSearchParams, usePathname } from "next/navigation";
// import Link from "next/link";
// import Overview from "@/app/paperTrading/financials/Fundamentals/Overview";
// import Revenue from "@/app/paperTrading/financials/Fundamentals/Revenue";
// import Financials from "@/app/paperTrading/financials/Fundamentals/Financials";
// import Events from "@/app/paperTrading/financials/Fundamentals/Events";
// import Ideas from "@/app/paperTrading/financials/Fundamentals/Ideas";
// import Technical from "@/app/paperTrading/financials/Technicals/Technical";
// import Market from "@/app/paperTrading/financials/Technicals/Market";
// import Scanners from "@/app/paperTrading/financials/Technicals/Scanners";
// import Strategies from "@/app/paperTrading/financials/Technicals/Strategies";

// const FinancialsPage = () => {
//   const searchParams = useSearchParams();
//   const pathname = usePathname();
//   const ticker = searchParams.get("ticker") || "MSFT"; // Default ticker
//   const [activeTab, setActiveTab] = useState("fundamentals");
//   const [subTab, setSubTab] = useState("overview");

//   // Component mapping for fundamentals
//   const fundamentalsComponents = {
//     overview: <Overview ticker={ticker} />, 
//     revenue: <Revenue ticker={ticker} />, 
//     financials: <Financials ticker={ticker} />, 
//     events: <Events ticker={ticker} />, 
//     ideas: <Ideas ticker={ticker} />,
//   };

//   // Component mapping for technicals
//   const technicalsComponents = {
//     technical: <Technical ticker={ticker} />, 
//     market: <Market ticker={ticker} />, 
//     scanners: <Scanners ticker={ticker} />, 
//     strategies: <Strategies ticker={ticker} />,
//   };

//   return (
//     <div className="flex flex-col bg-black text-white p-6 gap-6 min-h-screen">
//       {/* Tab Navigation */}
//       <div className="flex space-x-4 border-b border-gray-700 pb-2">
//         <button
//           onClick={() => setActiveTab("fundamentals")}
//           className={`px-4 py-2 rounded-md transition-all ${
//             activeTab === "fundamentals" ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
//           }`}
//         >
//           Fundamentals
//         </button>
//         <button
//           onClick={() => setActiveTab("technicals")}
//           className={`px-4 py-2 rounded-md transition-all ${
//             activeTab === "technicals" ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
//           }`}
//         >
//           Technicals
//         </button>
//       </div>

//       {/* Sub Tabs */}
//       <div className="flex space-x-4 border-b border-gray-700 pb-2">
//         {(activeTab === "fundamentals"
//           ? ["overview", "revenue", "financials", "events", "ideas"]
//           : ["technical", "market", "scanners", "strategies"]
//         ).map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setSubTab(tab)}
//             className={`px-4 py-2 rounded-md transition-all ${
//               subTab === tab ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
//             }`}
//           >
//             {tab.charAt(0).toUpperCase() + tab.slice(1)}
//           </button>
//         ))}
//       </div>

//       {/* Content */}
//       <div className="mt-4">
//         {activeTab === "fundamentals" ? fundamentalsComponents[subTab] : technicalsComponents[subTab]}
//       </div>
//     </div>
//   );
// };

// export default FinancialsPage;

// "use client";

// import React, { useState } from "react";
// import Link from "next/link";

// const FinancialsPage = () => {
//   const [activeTab, setActiveTab] = useState("Fundamentals");

//   return (
//     <div className="bg-black text-white min-h-screen p-6">
//       {/* Tab Switcher */}
//       <div className="flex space-x-4 mb-6">
//         <button
//           className={`px-4 py-2 rounded-md transition-all ${
//             activeTab === "Fundamentals" ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
//           }`}
//           onClick={() => setActiveTab("Fundamentals")}
//         >
//           Fundamentals
//         </button>
//         <button
//           className={`px-4 py-2 rounded-md transition-all ${
//             activeTab === "Technicals" ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
//           }`}
//           onClick={() => setActiveTab("Technicals")}
//         >
//           Technicals
//         </button>
//       </div>

//       {/* Render Sub-Pages */}
//       {activeTab === "Fundamentals" && (
//         <div className="flex flex-col space-y-4">
//           {["Overview", "Revenue", "Financials", "Events", "Ideas"].map((tab) => (
//             <Link key={tab} href={`/paperTrading/financials/Fundamentals/${tab}`}>
//               <button className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-blue-600">
//                 {tab}
//               </button>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FinancialsPage;

// "use client";

// import React, { useState, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
// import Overview from "@/app/paperTrading/financials/Fundamentals/Overview";
// import Revenue from "@/app/paperTrading/financials/Fundamentals/Revenue";
// import Financials from "@/app/paperTrading/financials/Fundamentals/Financials";
// import Events from "@/app/paperTrading/financials/Fundamentals/Events";
// import Ideas from "@/app/paperTrading/financials/Fundamentals/Ideas";
// import Technical from "@/app/paperTrading/financials/Technicals/Technical";
// import Market from "@/app/paperTrading/financials/Technicals/Market";
// import Scanners from "@/app/paperTrading/financials/Technicals/Scanners";
// import Strategies from "@/app/paperTrading/financials/Technicals/Strategies";

// // Placeholder for Suspense Fallback
// const Loading = () => <div className="text-gray-400">Loading...</div>;

// const FinancialsPageWrapper = () => {
//   return (
//     <Suspense fallback={<Loading />}>
//       <FinancialsPage />
//     </Suspense>
//   );
// };

// const FinancialsPage = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT"; // Default ticker
//   const [activeTab, setActiveTab] = useState("fundamentals");
//   const [subTab, setSubTab] = useState("overview");

//   // Component mapping for Fundamentals
//   const fundamentalsComponents = {
//     overview: <Overview ticker={ticker} />,
//     revenue: <Revenue ticker={ticker} />,
//     financials: <Financials ticker={ticker} />,
//     events: <Events ticker={ticker} />,
//     ideas: <Ideas ticker={ticker} />,
//   };

//   // Component mapping for Technicals
//   const technicalsComponents = {
//     technical: <Technical ticker={ticker} />,
//     market: <Market ticker={ticker} />,
//     scanners: <Scanners ticker={ticker} />,
//     strategies: <Strategies ticker={ticker} />,
//   };

//   return (
//     <div className="flex flex-col bg-black text-white p-6 gap-6 min-h-screen">
//       {/* Main Tab Navigation */}
//       <div className="flex space-x-4 border-b border-gray-700 pb-2">
//         <button
//           onClick={() => {
//             setActiveTab("fundamentals");
//             setSubTab("overview");
//           }}
//           className={`px-4 py-2 rounded-md transition-all ${
//             activeTab === "fundamentals" ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
//           }`}
//         >
//           Fundamentals
//         </button>
//         <button
//           onClick={() => {
//             setActiveTab("technicals");
//             setSubTab("technical");
//           }}
//           className={`px-4 py-2 rounded-md transition-all ${
//             activeTab === "technicals" ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
//           }`}
//         >
//           Technicals
//         </button>
//       </div>

//       {/* Sub Tabs */}
//       <div className="flex space-x-4 border-b border-gray-700 pb-2">
//         {(activeTab === "fundamentals"
//           ? ["overview", "revenue", "financials", "events", "ideas"]
//           : ["technical", "market", "scanners", "strategies"]
//         ).map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setSubTab(tab)}
//             className={`px-4 py-2 rounded-md transition-all ${
//               subTab === tab ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
//             }`}
//           >
//             {tab.charAt(0).toUpperCase() + tab.slice(1)}
//           </button>
//         ))}
//       </div>

//       {/* Display Content */}
//       <div className="mt-4">
//         {activeTab === "fundamentals"
//           ? fundamentalsComponents[subTab]
//           : technicalsComponents[subTab]}
//       </div>
//     </div>
//   );
// };

// export default FinancialsPage;

"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// Placeholder for Suspense Fallback
const Loading = () => <div className="text-gray-400">Loading...</div>;

// Load FinancialsPageContent dynamically (client-side only)
const FinancialsPageContent = dynamic(() => import("./FinancialsPageContent"), {
  ssr: false,
  loading: () => <Loading />,
});

const FinancialsPageWrapper = () => {
  return (
    <Suspense fallback={<Loading />}>
      <FinancialsPageContent />
    </Suspense>
  );
};

export default FinancialsPageWrapper;
