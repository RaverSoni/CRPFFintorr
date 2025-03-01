// "use client";

// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";

// const PositionsContent = () => {
//   const [positions, setPositions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Fetch live positions
//     const fetchPositions = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/positions/");
//         const data = await response.json();

//         if (response.ok) {
//           setPositions(data.positions);
//         } else {
//           setError(data.error || "Failed to fetch positions.");
//         }
//       } catch (error) {
//         setError("Error loading positions.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPositions();
//     const interval = setInterval(fetchPositions, 5000); // Refresh every 5 seconds
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Positions</h1>

//       {loading ? (
//         <p>Loading positions...</p>
//       ) : error ? (
//         <p className="text-red-400">{error}</p>
//       ) : positions.length === 0 ? (
//         <div className="text-center text-gray-400">
//           <p>No active positions today.</p>
//           <p>All trades will move to Holdings after market close.</p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {/* 🔹 Positions Table */}
//           <div className="p-4 bg-gray-900 rounded-lg">
//             <h2 className="text-lg font-semibold">Open Positions</h2>
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-gray-700 text-left">
//                   <th className="py-2">Stock</th>
//                   <th>Quantity</th>
//                   <th>Avg Price</th>
//                   <th>Current Price</th>
//                   <th>Live P&L</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {positions.map((position, index) => (
//                   <tr key={index} className="border-b border-gray-800">
//                     <td className="py-2 font-bold">{position.ticker}</td>
//                     <td>{position.quantity}</td>
//                     <td>₹{position.avg_price.toFixed(2)}</td>
//                     <td>₹{position.current_price.toFixed(2)}</td>
//                     <td
//                       className={position.pnl >= 0 ? "text-green-400" : "text-red-400"}
//                     >
//                       ₹{position.pnl.toFixed(2)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* 🔹 Positions Statistics */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Total Open Positions</h2>
//               <p className="text-2xl font-bold">{positions.length}</p>
//             </div>
//             <div className="p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Total Live P&L</h2>
//               <p
//                 className={`text-2xl font-bold ${
//                   positions.reduce((acc, p) => acc + p.pnl, 0) >= 0
//                     ? "text-green-400"
//                     : "text-red-400"
//                 }`}
//               >
//                 ₹{positions.reduce((acc, p) => acc + p.pnl, 0).toFixed(2)}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ✅ Force client-side rendering
// const Positions = dynamic(() => Promise.resolve(PositionsContent), { ssr: false });

// export default Positions;










// "use client";

// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";

// const PositionsContent = () => {
//   const [positions, setPositions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // ✅ Fetch live positions
//     const fetchPositions = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/positions/");
//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.error || "Failed to fetch positions.");
//         }

//         setPositions(data.positions || []);
//         setError(null);
//       } catch (error) {
//         setError("Error loading positions.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPositions();
//     const interval = setInterval(fetchPositions, 5000); // Refresh every 5 sec
//     return () => clearInterval(interval);
//   }, []);

//   // ✅ Calculate Total Live P&L and Exposure
//   const totalPnL = positions.reduce((acc, p) => acc + p.pnl, 0);
//   const totalExposure = positions.reduce((acc, p) => acc + p.quantity * p.avg_price, 0);

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Open Positions</h1>

//       {error && <p className="text-red-400">{error}</p>}

//       {loading ? (
//         <p>Loading positions...</p>
//       ) : positions.length === 0 ? (
//         <div className="text-center text-gray-400">
//           <p>No active positions today.</p>
//           <p>All trades will move to Holdings after market close.</p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {/* 🔹 Positions Table */}
//           <div className="p-4 bg-gray-900 rounded-lg">
//             <h2 className="text-lg font-semibold">Live Positions</h2>
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-gray-700 text-left">
//                   <th className="py-2">Stock</th>
//                   <th>Qty</th>
//                   <th>Avg Price</th>
//                   <th>Current Price</th>
//                   <th>P&L</th>
//                   <th>% Change</th>
//                   <th>Risk Score</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {positions.map((position, index) => (
//                   <tr key={index} className="border-b border-gray-800">
//                     <td className="py-2 font-bold">{position.ticker}</td>
//                     <td>{position.quantity}</td>
//                     <td>₹{position.avg_price.toFixed(2)}</td>
//                     <td className="text-green-400">₹{position.current_price.toFixed(2)}</td>
//                     <td className={position.pnl >= 0 ? "text-green-400" : "text-red-400"}>
//                       ₹{position.pnl.toFixed(2)}
//                     </td>
//                     <td className={position.percentage_change >= 0 ? "text-green-400" : "text-red-400"}>
//                       {position.percentage_change.toFixed(2)}%
//                     </td>
//                     <td className="text-yellow-400">{position.risk_score.toFixed(2)}%</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* 🔹 Positions Statistics */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Total Open Positions</h2>
//               <p className="text-2xl font-bold">{positions.length}</p>
//             </div>
//             <div className="p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Total Live P&L</h2>
//               <p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
//                 ₹{totalPnL.toFixed(2)}
//               </p>
//             </div>
//             <div className="p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Total Exposure</h2>
//               <p className="text-2xl font-bold text-blue-400">
//                 ₹{totalExposure.toLocaleString()}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ✅ Force client-side rendering
// const Positions = dynamic(() => Promise.resolve(PositionsContent), { ssr: false });

// export default Positions;

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Loader from "@/components/Loaders/loader2"; // ✅ Updated Loader Component
import Loader1 from "@/components/Loaders/loader"; // ✅ Updated Loader Component

// ✅ List of Market Indices
const indices = [
  { symbol: "^NSEI", title: "📌 Nifty 50" },
  { symbol: "^NSEBANK", title: "🏦 BankNifty" },
  { symbol: "^BSESN", title: "📊 Sensex" },
  { symbol: "NIFTY_FIN_SERVICE.NS", title: "💳 FinNifty" },
  { symbol: "NIFTYMIDCAP150.NS", title: "📈 Midcap" },
  { symbol: "^NSEMDCP50", title: "📡 Nifty Next 50" },
  { symbol: "^CNX100", title: "🔥 Nifty Next 100" }
];

// ✅ Fetch & Display Index Data (Reused from Dashboard)
const IndexCard = ({ symbol, title }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIndexData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/index-data/${symbol}/`);
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (error) {
        setError("Error loading index data");
      } finally {
        setLoading(false);
      }
    };

    fetchIndexData();
    const interval = setInterval(fetchIndexData, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <Link href="/app/paperTrading/IndicesPage/page.jsx">
      <button className="bg-gray-800 text-white p-4 rounded-xl shadow-lg text-center w-44 hover:scale-105 transition-transform duration-300 hover:bg-blue-700">
        <p className="font-bold text-sm">{title}</p>
        {loading ? (
          <Loader1 />
        ) : error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : (
          <>
            <p className={`text-lg font-semibold ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
              {data.current_price || "N/A"}
            </p>
            <p className={`text-sm ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
              {data.day_change} ({data.percentage_change}%)
            </p>
          </>
        )}
      </button>
    </Link>
  );
};

// ✅ Trading Page Component
const TradingPageContent = () => {
  const router = useRouter();
  const [ticker, setTicker] = useState("NIFTY");
  const [portfolio, setPortfolio] = useState({ buyingPower: 1000000, profitLoss: 0 });
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const paramTicker = searchParams.get("ticker");
      if (paramTicker) setTicker(paramTicker);
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/portfolio/");
      if (!response.ok) throw new Error("Error fetching portfolio");
      const data = await response.json();
      setPortfolio(data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // ✅ Reset Buying Power and Immediately Refresh Portfolio
  const resetBuyingPower = async () => {
    try {
      setIsResetting(true);
      const response = await fetch("http://127.0.0.1:8000/api/reset-price/", { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reset");
      }
  
      const result = await response.json();
      alert(result.message);
  
      // ✅ Update buying power immediately before backend refresh
      setPortfolio((prev) => ({
        ...prev,
        buyingPower: result.buyingPower
      }));
  
      // ✅ Fetch portfolio **after a short delay** to ensure backend updates are reflected
      setTimeout(fetchPortfolio, 1500);
    } catch (error) {
      console.error("Error resetting buying power:", error);
      alert("Failed to reset buying power. Try again.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      {/* 🔹 Indices Navigation (Updated from Dashboard) */}
      <div className="flex space-x-4 overflow-x-auto mb-6 scrollbar-hide">
        {indices.map((index) => (
          <IndexCard key={index.symbol} symbol={index.symbol} title={index.title} />
        ))}
      </div>

      {/* 🔹 Navigation Buttons */}
      <div className="flex space-x-4 border-b border-gray-700 pb-2 mb-4">
        {["Dashboard", "Orders", "Holdings", "Positions", "Funds"].map((tab) => (
          <Link key={tab} href={`/paperTrading/TradingPage/${tab}`}>
            <button
              className={`px-4 py-2 text-sm rounded-md transition-all ${
                tab === "Dashboard" ? "bg-indigo-600 text-white" : "hover:bg-gray-800"
              }`}
            >
              {tab}
            </button>
          </Link>
        ))}
      </div>

      {/* 🔹 Portfolio Overview */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📊 Trade Summary for {ticker}</h1>
        <button 
          className={`px-4 py-2 rounded-lg text-white ${
            isResetting ? "bg-gray-500" : "bg-red-500 hover:bg-red-600"
          }`}
          onClick={resetBuyingPower}
          disabled={isResetting}
        >
          {isResetting ? "Resetting..." : "♻️ Reset Buying Power"}
        </button>
      </div>

      {/* 🔹 Portfolio Display */}
      {loading ? (
        <Loader />
      ) : (
        <div className="mt-4 p-6 bg-gray-900 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">💼 Portfolio</h2>
          <p>💰 Buying Power: ₹{portfolio?.buyingPower?.toLocaleString() || "0"}</p>
          <p>📈 Total P&L: ₹{portfolio?.profitLoss?.toFixed(2) || "0.00"}</p>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(TradingPageContent), { ssr: false });