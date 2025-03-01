// "use client";

// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";

// const HoldingsContent = () => {
//   const [holdings, setHoldings] = useState([]);
//   const [portfolioSummary, setPortfolioSummary] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch holdings and portfolio summary dynamically
//     const fetchHoldingsData = async () => {
//       try {
//         const [holdingsRes, summaryRes] = await Promise.all([
//           fetch("http://127.0.0.1:8000/api/holdings/"),
//           fetch("http://127.0.0.1:8000/api/portfolio-summary/")
//         ]);

//         const [holdingsData, summaryData] = await Promise.all([
//           holdingsRes.json(),
//           summaryRes.json()
//         ]);

//         setHoldings(holdingsData.holdings);
//         setPortfolioSummary(summaryData);
//       } catch (error) {
//         console.error("Error fetching holdings data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHoldingsData();
//     const interval = setInterval(fetchHoldingsData, 5000); // Refresh every 5s
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Holdings Overview</h1>

//       {/* Portfolio Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Total Investment */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Total Investment</h2>
//           <p className="text-2xl font-bold text-blue-400">
//             ₹{portfolioSummary?.total_investment?.toLocaleString() || "0"}
//           </p>
//         </div>

//         {/* Current Value */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Current Value</h2>
//           <p className="text-2xl font-bold text-green-400">
//             ₹{portfolioSummary?.current_value?.toLocaleString() || "0"}
//           </p>
//         </div>

//         {/* Total P&L */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Total P&L</h2>
//           <p className={`text-2xl font-bold ${portfolioSummary?.total_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
//             ₹{portfolioSummary?.total_pnl?.toLocaleString() || "0"}
//           </p>
//         </div>
//       </div>

//       {/* Holdings Table */}
//       <div className="mt-6 p-4 bg-gray-900 rounded-lg">
//         <h2 className="text-lg font-semibold">Your Holdings</h2>
//         {loading ? (
//           <p>Loading holdings...</p>
//         ) : holdings.length === 0 ? (
//           <p>No stocks held.</p>
//         ) : (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-gray-700 text-left">
//                 <th className="py-2">Stock</th>
//                 <th>Qty</th>
//                 <th>Avg Cost</th>
//                 <th>Current Price</th>
//                 <th>P&L</th>
//                 <th>% Change</th>
//               </tr>
//             </thead>
//             <tbody>
//               {holdings.map((stock, index) => (
//                 <tr key={index} className="border-b border-gray-800">
//                   <td className="py-2 font-bold">{stock.ticker}</td>
//                   <td>{stock.quantity}</td>
//                   <td>₹{stock.avg_price.toFixed(2)}</td>
//                   <td className="text-green-400">₹{stock.current_price.toFixed(2)}</td>
//                   <td className={stock.pnl >= 0 ? "text-green-400" : "text-red-400"}>
//                     ₹{stock.pnl.toFixed(2)}
//                   </td>
//                   <td className={stock.percentage_change >= 0 ? "text-green-400" : "text-red-400"}>
//                     {stock.percentage_change.toFixed(2)}%
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// // ✅ Force client-side rendering
// const Holdings = dynamic(() => Promise.resolve(HoldingsContent), { ssr: false });

// export default Holdings;

// "use client";

// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";

// const HoldingsContent = () => {
//   const [holdings, setHoldings] = useState([]);
//   const [portfolioSummary, setPortfolioSummary] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // ✅ Fetch holdings and portfolio summary dynamically
//     const fetchHoldingsData = async () => {
//       try {
//         const [holdingsRes, summaryRes] = await Promise.all([
//           fetch("http://127.0.0.1:8000/api/holdings/"),
//           fetch("http://127.0.0.1:8000/api/portfolio-summary/")
//         ]);

//         if (!holdingsRes.ok || !summaryRes.ok) {
//           throw new Error("Error fetching holdings data.");
//         }

//         const [holdingsData, summaryData] = await Promise.all([
//           holdingsRes.json(),
//           summaryRes.json()
//         ]);

//         setHoldings(holdingsData.holdings || []);
//         setPortfolioSummary(summaryData);
//         setError(null);
//       } catch (error) {
//         setError("Failed to fetch holdings data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHoldingsData();
//     const interval = setInterval(fetchHoldingsData, 5000); // Refresh every 5s
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Holdings Overview</h1>

//       {error && <p className="text-red-500">{error}</p>}

//       {/* 🔹 Portfolio Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* ✅ Total Investment */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Total Investment</h2>
//           <p className="text-2xl font-bold text-blue-400">
//             ₹{portfolioSummary?.total_investment?.toLocaleString() || "0"}
//           </p>
//         </div>

//         {/* ✅ Current Value */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Current Value</h2>
//           <p className="text-2xl font-bold text-green-400">
//             ₹{portfolioSummary?.current_value?.toLocaleString() || "0"}
//           </p>
//         </div>

//         {/* ✅ Total P&L */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Total P&L</h2>
//           <p className={`text-2xl font-bold ${portfolioSummary?.total_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
//             ₹{portfolioSummary?.total_pnl?.toLocaleString() || "0"}
//           </p>
//         </div>
//       </div>

//       {/* 🔹 Holdings Table */}
//       <div className="mt-6 p-4 bg-gray-900 rounded-lg">
//         <h2 className="text-lg font-semibold">Your Holdings</h2>
//         {loading ? (
//           <p>Loading holdings...</p>
//         ) : holdings.length === 0 ? (
//           <p>No stocks held.</p>
//         ) : (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-gray-700 text-left">
//                 <th className="py-2">Stock</th>
//                 <th>Quantity</th>
//                 <th>Avg Cost</th>
//                 <th>Current Price</th>
//                 <th>P&L</th>
//                 <th>% Change</th>
//                 <th>Sector</th>
//               </tr>
//             </thead>
//             <tbody>
//               {holdings.map((stock, index) => (
//                 <tr key={index} className="border-b border-gray-800">
//                   <td className="py-2 font-bold">{stock.ticker}</td>
//                   <td>{stock.quantity}</td>
//                   <td>₹{stock.avg_price.toFixed(2)}</td>
//                   <td className="text-green-400">₹{stock.current_price.toFixed(2)}</td>
//                   <td className={stock.pnl >= 0 ? "text-green-400" : "text-red-400"}>
//                     ₹{stock.pnl.toFixed(2)}
//                   </td>
//                   <td className={stock.percentage_change >= 0 ? "text-green-400" : "text-red-400"}>
//                     {stock.percentage_change.toFixed(2)}%
//                   </td>
//                   <td className="text-gray-400">{stock.sector || "N/A"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* 🔹 Summary Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Total Holdings</h2>
//           <p className="text-2xl font-bold">{holdings.length}</p>
//         </div>
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Top Gainer</h2>
//           {holdings.length > 0 ? (
//             <p className="text-xl font-bold text-green-400">
//               {holdings.reduce((prev, current) => (prev.percentage_change > current.percentage_change ? prev : current)).ticker}
//             </p>
//           ) : (
//             <p className="text-gray-400">N/A</p>
//           )}
//         </div>
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Top Loser</h2>
//           {holdings.length > 0 ? (
//             <p className="text-xl font-bold text-red-400">
//               {holdings.reduce((prev, current) => (prev.percentage_change < current.percentage_change ? prev : current)).ticker}
//             </p>
//           ) : (
//             <p className="text-gray-400">N/A</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ✅ Force client-side rendering
// const Holdings = dynamic(() => Promise.resolve(HoldingsContent), { ssr: false });

// export default Holdings;

"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/Loaders/loader2"; // ✅ Updated Loader Component

const HoldingsContent = () => {
  const [holdings, setHoldings] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHoldingsData = async () => {
      try {
        const [holdingsRes, summaryRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/holdings/"),
          fetch("http://127.0.0.1:8000/api/portfolio-summary/")
        ]);

        if (!holdingsRes.ok || !summaryRes.ok) {
          throw new Error("⚠️ Error fetching holdings data.");
        }

        const [holdingsData, summaryData] = await Promise.all([
          holdingsRes.json(),
          summaryRes.json()
        ]);

        setHoldings(holdingsData.holdings || []);
        setPortfolioSummary(summaryData);
        setError(null);
      } catch (error) {
        console.error("❌ Failed to fetch holdings data:", error);
        setError("Failed to fetch holdings data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHoldingsData();
    const interval = setInterval(fetchHoldingsData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">📊 Holdings Overview</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* 🔹 Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">💰 Total Investment</h2>
          <p className="text-2xl font-bold text-blue-400">
            ₹{portfolioSummary?.total_investment?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">📈 Current Value</h2>
          <p className="text-2xl font-bold text-green-400">
            ₹{portfolioSummary?.current_value?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">🔥 Total P&L</h2>
          <p className={`text-2xl font-bold ${portfolioSummary?.total_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
            ₹{portfolioSummary?.total_pnl?.toLocaleString() || "0"}
          </p>
        </div>
      </div>

      {/* 🔹 Holdings Table */}
      <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">📌 Your Holdings</h2>
        {loading ? (
          <Loader />
        ) : holdings.length === 0 ? (
          <p>No stocks held.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="py-2">📌 Stock</th>
                <th>📦 Quantity</th>
                <th>💰 Avg Cost</th>
                <th>📊 Current Price</th>
                <th>💹 P&L</th>
                <th>📈 % Change</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((stock, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="py-2 font-bold">{stock.ticker}</td>
                  <td>{stock.quantity}</td>
                  <td>₹{stock.avg_price.toFixed(2)}</td>
                  <td>₹{stock.current_price.toFixed(2)}</td>
                  <td className={stock.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                    ₹{stock.pnl.toFixed(2)}
                  </td>
                  <td className={stock.percentage_change >= 0 ? "text-green-400" : "text-red-400"}>
                    {stock.percentage_change.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ✅ Force client-side rendering
export default dynamic(() => Promise.resolve(HoldingsContent), { ssr: false });