// 'use client';
// import React, { useEffect, useState } from 'react';

// const InvestBox = () => {
//   const [currVal, setCurrVal] = useState(0);
//   const [totalVal, setTotalVal] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Simulated API response
//     const fetchData = async () => {
//       // Simulate a network request
//       //await new Promise((resolve) => setTimeout(resolve, 1000));

//       // Replace with your simulated data
//       const data = {
//         currVal: 10000,
//         totalVal: 8000,
//       };

//       setCurrVal(data.currVal);
//       setTotalVal(data.totalVal);
//       setLoading(false);
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }
//   const currValColor = currVal < totalVal ? 'text-[#F63C6B]' : 'text-[#0FEDBE]';

//   return (
//     <div className="flex flex-row justify-start hover:scale-105 duration-300 ease-in">
//       <div className="flex flex-row justify-between ml-10 mr-10 mt-5 bg-[#16181B] h-70 w-full rounded-lg p-6 shadow-lg">
//         <div className='flex flex-col'>
//           <span className={`text-2xl font-bold ${currValColor}`}>
//             {`$${currVal}`}
//           </span>
//           <span className='text-[#999999]'>
//             Current Value
//           </span>
//         </div>
//         <div className='flex flex-col'>
//           <span className='text-2xl font-bold'>
//             {`$${totalVal}`}
//           </span>
//           <span className='text-[#999999]'>
//             Total Invested
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvestBox;

"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineFund, AiOutlineStock, AiOutlineRise, AiOutlineFall } from "react-icons/ai"; // ✅ Icons for better UX
import Loader from "@/components/Loaders/loader2"; // ✅ Loader Component

const InvestmentBox = () => {
  const [holdings, setHoldings] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHoldingsData = async () => {
      try {
        const [holdingsRes, summaryRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/holdings/"),
          fetch("http://127.0.0.1:8000/api/portfolio-summary/"),
        ]);

        if (!holdingsRes.ok || !summaryRes.ok) {
          throw new Error("⚠️ Error fetching holdings data.");
        }

        const [holdingsData, summaryData] = await Promise.all([
          holdingsRes.json(),
          summaryRes.json(),
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
      <h1 className="text-2xl font-bold mb-4">📊 Investment Overview</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* 🔹 Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg flex items-center">
          <AiOutlineFund className="text-3xl text-yellow-400 mr-3" />
          <div>
            <h2 className="text-lg font-semibold">💰 Total Investment</h2>
            <p className="text-2xl font-bold text-blue-400">
              ₹{portfolioSummary?.total_investment?.toLocaleString() || "0"}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-900 rounded-lg shadow-lg flex items-center">
          <AiOutlineStock className="text-3xl text-green-400 mr-3" />
          <div>
            <h2 className="text-lg font-semibold">📈 Current Value</h2>
            <p className="text-2xl font-bold text-green-400">
              ₹{portfolioSummary?.current_value?.toLocaleString() || "0"}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-900 rounded-lg shadow-lg flex items-center">
          {portfolioSummary?.total_pnl >= 0 ? (
            <AiOutlineRise className="text-3xl text-green-400 mr-3" />
          ) : (
            <AiOutlineFall className="text-3xl text-red-400 mr-3" />
          )}
          <div>
            <h2 className="text-lg font-semibold">🔥 Total P&L</h2>
            <p
              className={`text-2xl font-bold ${
                portfolioSummary?.total_pnl >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              ₹{portfolioSummary?.total_pnl?.toLocaleString() || "0"}
            </p>
          </div>
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

export default InvestmentBox;