// "use client";

// import React, { useState } from "react";
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

// const FinancialsPageContent = () => {
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

// export default FinancialsPageContent;

"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Overview from "@/app/paperTrading/financials/Fundamentals/Overview";
import Revenue from "@/app/paperTrading/financials/Fundamentals/Revenue";
import Financials from "@/app/paperTrading/financials/Fundamentals/Financials";
import Events from "@/app/paperTrading/financials/Fundamentals/Events";
import Ideas from "@/app/paperTrading/financials/Fundamentals/Ideas";
import Technical from "@/app/paperTrading/financials/Technicals/Technical";
import Market from "@/app/paperTrading/financials/Technicals/Market";
import Scanners from "@/app/paperTrading/financials/Technicals/Scanners";
import Strategies from "@/app/paperTrading/financials/Technicals/Strategies";

const FinancialsPageContent = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT"; // Default ticker
  const [activeTab, setActiveTab] = useState("fundamentals");
  const [subTab, setSubTab] = useState("overview");

  // Component mapping for Fundamentals
  const fundamentalsComponents = {
    overview: <Overview ticker={ticker} />,
    revenue: <Revenue ticker={ticker} />,
    financials: <Financials ticker={ticker} />,
    events: <Events ticker={ticker} />,
    ideas: <Ideas ticker={ticker} />,
  };

  // Component mapping for Technicals
  const technicalsComponents = {
    technical: <Technical ticker={ticker} />,
    market: <Market ticker={ticker} />,
    scanners: <Scanners ticker={ticker} />,
    strategies: <Strategies ticker={ticker} />,
  };

  return (
    <div className="flex flex-col bg-black text-white p-6 gap-6 min-h-screen">
      {/* Main Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-700 pb-2">
        {["fundamentals", "technicals"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSubTab(tab === "fundamentals" ? "overview" : "technical");
            }}
            className={`px-4 py-2 rounded-md transition-all ${
              activeTab === tab ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-4 border-b border-gray-700 pb-2">
        {(activeTab === "fundamentals"
          ? Object.keys(fundamentalsComponents)
          : Object.keys(technicalsComponents)
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2 rounded-md transition-all ${
              subTab === tab ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Display Content */}
      <div className="mt-4">
        {activeTab === "fundamentals"
          ? fundamentalsComponents[subTab] || <p>No data available</p>
          : technicalsComponents[subTab] || <p>No data available</p>}
      </div>
    </div>
  );
};

export default FinancialsPageContent;
