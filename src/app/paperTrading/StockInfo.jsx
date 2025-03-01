// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const StockInfo = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT"; // Default to MSFT if no ticker is provided
//   const [stock, setStock] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchStockInfo = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/api/stock_info/${ticker}/`);
//         const data = await response.json();

//         if (data.error) {
//           setError(data.error);
//         } else {
//           setStock(data);
//         }
//       } catch (err) {
//         setError("Error fetching stock info.");
//       }
//     };

//     fetchStockInfo();
//   }, [ticker]);

//   if (error) return <div className="text-red-500">{error}</div>;
//   if (!stock) return <div>Loading...</div>;

//   // Helper function to safely convert numbers
//   const formatNumber = (value, decimals = 2) =>
//     typeof value === "number" ? value.toFixed(decimals) : "N/A";

//   return (
//     <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
//       <div className="flex justify-between items-center">
//         <h2 className="text-lg font-semibold">{stock.ticker}</h2>
//         <span className="text-sm bg-gray-700 px-2 py-1 rounded">{stock.exchange || "N/A"}</span>
//       </div>
//       <p className="text-gray-400">{stock.company || "N/A"}</p>

//       <div className="mt-2">
//         <span className="text-3xl font-bold text-green-400">
//           ${formatNumber(stock.price)}
//         </span>
//         <span className="ml-2 text-sm text-green-300">
//           {formatNumber(stock.change)} ({formatNumber(stock.percentage)}%)
//         </span>
//       </div>

//       <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
//         <p>📈 Open: <span className="text-gray-300">${formatNumber(stock.open)}</span></p>
//         <p>📊 High: <span className="text-gray-300">${formatNumber(stock.high)}</span></p>
//         <p>📉 Low: <span className="text-gray-300">${formatNumber(stock.low)}</span></p>
//         <p>💰 Mkt Cap: <span className="text-gray-300">{stock.marketCap?.toLocaleString() || "N/A"}</span></p>
//         <p>📈 Avg Vol: <span className="text-gray-300">{stock.avgVolume?.toLocaleString() || "N/A"}</span></p>
//         <p>📑 Shares: <span className="text-gray-300">{stock.sharesOutstanding?.toLocaleString() || "N/A"}</span></p>
//         <p>🏦 Div Yield: <span className="text-gray-300">{formatNumber(stock.dividendYield, 4)}</span></p>
//       </div>
//     </div>
//   );
// };

// export default StockInfo;

// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const StockInfo = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT"; // Default to MSFT if no ticker is provided
//   const [stock, setStock] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchStockInfo = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/api/stock_info/${ticker}/`);
//         const data = await response.json();

//         if (data.error) {
//           setError(data.error);
//         } else {
//           setStock(data);
//         }
//       } catch (err) {
//         setError("Error fetching stock info.");
//       }
//     };

//     // Fetch initial data and update every 30 seconds
//     fetchStockInfo();
//     const interval = setInterval(fetchStockInfo, 30000); // Auto-refresh every 30s
//     return () => clearInterval(interval);
//   }, [ticker]);

//   if (error) return <div className="text-red-500">{error}</div>;
//   if (!stock) return <div>Loading...</div>;

//   // Helper function to safely convert numbers
//   const formatNumber = (value, decimals = 2) =>
//     typeof value === "number" ? value.toFixed(decimals) : "N/A";

//   // Determine the currency symbol dynamically
//   const currencySymbol = stock.currencySymbol || "$";

//   return (
//     <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
//       <div className="flex justify-between items-center">
//         <h2 className="text-lg font-semibold">{stock.ticker}</h2>
//         <span className="text-sm bg-gray-700 px-2 py-1 rounded">{stock.exchange || "N/A"}</span>
//       </div>
//       <p className="text-gray-400">{stock.company || "N/A"}</p>

//       <div className="mt-2">
//         <span className="text-3xl font-bold text-green-400">
//           {currencySymbol}{formatNumber(stock.price)}
//         </span>
//         <span
//           className={`ml-2 text-sm ${
//             stock.change >= 0 ? "text-green-300" : "text-red-300"
//           }`}
//         >
//           {currencySymbol}{formatNumber(stock.change)} ({formatNumber(stock.percentage)}%)
//         </span>
//       </div>

//       <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
//         <p>📈 Open: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.open)}</span></p>
//         <p>📊 High: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.high)}</span></p>
//         <p>📉 Low: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.low)}</span></p>
//         <p>💰 Mkt Cap: <span className="text-gray-300">{stock.marketCap?.toLocaleString() || "N/A"}</span></p>
//         <p>📈 Avg Vol: <span className="text-gray-300">{stock.avgVolume?.toLocaleString() || "N/A"}</span></p>
//         <p>📑 Shares: <span className="text-gray-300">{stock.sharesOutstanding?.toLocaleString() || "N/A"}</span></p>
//         <p>🏦 Div Yield: <span className="text-gray-300">{formatNumber(stock.dividendYield, 4)}</span></p>
//       </div>
//     </div>
//   );
// };

// export default StockInfo;


// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const StockInfo = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT"; // Default to MSFT if no ticker is provided
//   const [stock, setStock] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchStockInfo = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/api/stock_info/${ticker}/`);
//         const data = await response.json();

//         if (data.error) {
//           setError(data.error);
//         } else {
//           setStock(data);
//         }
//       } catch (err) {
//         setError("Error fetching stock info.");
//       }
//     };

//     // Fetch initial data and update every 30 seconds
//     fetchStockInfo();
//     const interval = setInterval(fetchStockInfo, 30000);
//     return () => clearInterval(interval);
//   }, [ticker]);

//   if (error) return <div className="text-red-500">{error}</div>;
//   if (!stock) return <div>Loading...</div>;

//   const formatNumber = (value, decimals = 2) =>
//     typeof value === "number" ? value.toFixed(decimals) : "N/A";

//   const currencySymbol = stock.currencySymbol || "$";

//   return (
//     <div className="bg-black text-white p-6 rounded-lg shadow-md">
//       <div className="flex justify-between items-center">
//         <h2 className="text-lg font-semibold">{stock.ticker} <span className="text-gray-400 text-sm">{stock.company}</span></h2>
//         <span className="text-sm bg-gray-700 px-2 py-1 rounded">{stock.exchange || "N/A"}</span>
//       </div>

//       <div className="mt-2 text-4xl font-bold text-green-400">
//         {currencySymbol}{formatNumber(stock.price)}
//         <span className={`ml-2 text-lg ${stock.change >= 0 ? "text-green-300" : "text-red-300"}`}>
//           {currencySymbol}{formatNumber(stock.change)} ({formatNumber(stock.percentage)}%)
//         </span>
//       </div>

//       {stock.afterHoursPrice && (
//         <p className="text-gray-400 text-sm mt-1">
//           After hours: {currencySymbol}{formatNumber(stock.afterHoursPrice)}
//         </p>
//       )}

//       <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
//         <p>📈 Open: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.open)}</span></p>
//         <p>📊 High: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.high)}</span></p>
//         <p>📉 Low: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.low)}</span></p>
//         <p>💰 Mkt Cap: <span className="text-gray-300">{stock.marketCap?.toLocaleString() || "N/A"}</span></p>
//         <p>📈 Avg Vol: <span className="text-gray-300">{stock.avgVolume?.toLocaleString() || "N/A"}</span></p>
//         <p>📑 Shares: <span className="text-gray-300">{stock.sharesOutstanding?.toLocaleString() || "N/A"}</span></p>
//         <p>🏦 Div Yield: <span className="text-gray-300">{formatNumber(stock.dividendYield, 4)}</span></p>
//         <p>📅 52W High: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.week52High)}</span></p>
//         <p>📅 52W Low: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.week52Low)}</span></p>
//       </div>
//     </div>
//   );
// };

// export default StockInfo;

// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const StockInfo = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";
//   const [stock, setStock] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchStockInfo = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/api/stock_info/${ticker}/`);
//         const data = await response.json();

//         if (data.error) {
//           setError(data.error);
//         } else {
//           setStock(data);
//         }
//       } catch (err) {
//         setError("Error fetching stock info.");
//       }
//     };

//     fetchStockInfo();
//     const interval = setInterval(fetchStockInfo, 30000);
//     return () => clearInterval(interval);
//   }, [ticker]);

//   if (error) return <div className="text-red-500">{error}</div>;
//   if (!stock) return <div>Loading...</div>;

//   const formatNumber = (value, decimals = 2) =>
//     typeof value === "number" ? value.toFixed(decimals) : value;

//   const currencySymbol = stock.currencySymbol || "$";

//   return (
//     <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
//       <div className="flex justify-between items-center">
//         <h2 className="text-lg font-semibold">{stock.ticker}</h2>
//         <span className="text-sm bg-gray-700 px-2 py-1 rounded">{stock.exchange || "N/A"}</span>
//       </div>
//       <p className="text-gray-400">{stock.company || "N/A"}</p>
//       <p className="text-gray-500 text-sm">📌 {stock.marketStatus}</p>

//       <div className="mt-2">
//         <span className="text-3xl font-bold text-green-400">
//           {currencySymbol}{formatNumber(stock.price)}
//         </span>
//         <span
//           className={`ml-2 text-sm ${
//             stock.change >= 0 ? "text-green-300" : "text-red-300"
//           }`}
//         >
//           {currencySymbol}{formatNumber(stock.change)} ({formatNumber(stock.percentage)}%)
//         </span>
//       </div>

//       {stock.afterHoursPrice && (
//         <p className="text-gray-400 text-sm mt-1">
//           After hours: {typeof stock.afterHoursPrice === "string" ? stock.afterHoursPrice : `${currencySymbol}${formatNumber(stock.afterHoursPrice)}`}
//         </p>
//       )}

//       <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
//         <p>📈 Open: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.open)}</span></p>
//         <p>📊 High: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.high)}</span></p>
//         <p>📉 Low: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.low)}</span></p>
//         <p>💰 Mkt Cap: <span className="text-gray-300">{stock.marketCap?.toLocaleString() || "N/A"}</span></p>
//         <p>📈 Avg Vol: <span className="text-gray-300">{stock.avgVolume?.toLocaleString() || "N/A"}</span></p>
//         <p>📑 Shares: <span className="text-gray-300">{stock.sharesOutstanding?.toLocaleString() || "N/A"}</span></p>
//         <p>🏦 Div Yield: <span className="text-gray-300">{formatNumber(stock.dividendYield, 4)}</span></p>
//       </div>

//       <p className="text-gray-500 text-xs mt-4">⏳ Last Updated: {stock.lastUpdated}</p>
//     </div>
//   );
// };

// export default StockInfo;

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const StockInfo = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT";
  const [stock, setStock] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockInfo = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/stock_info/${ticker}/`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setStock(data);
        }
      } catch (err) {
        setError("Error fetching stock info.");
      }
    };

    fetchStockInfo();
    const interval = setInterval(fetchStockInfo, 30000);
    return () => clearInterval(interval);
  }, [ticker]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!stock) return <div>Loading...</div>;

  const formatNumber = (value, decimals = 2) =>
    typeof value === "number" ? value.toFixed(decimals) : value;

  const currencySymbol = stock.currencySymbol || "$";

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{stock.ticker}</h2>
        <span className="text-sm bg-gray-700 px-2 py-1 rounded">{stock.exchange || "N/A"}</span>
      </div>
      <p className="text-gray-400">{stock.company || "N/A"}</p>
      <p className="text-gray-500 text-sm">📌 {stock.marketStatus}</p>

      <div className="mt-2">
        <span className="text-3xl font-bold text-green-400">
          {currencySymbol}{formatNumber(stock.price)}
        </span>
        <span
          className={`ml-2 text-sm ${
            stock.change >= 0 ? "text-green-300" : "text-red-300"
          }`}
        >
          {currencySymbol}{formatNumber(stock.change)} ({formatNumber(stock.percentage)}%)
        </span>
      </div>

      {stock.afterHoursPrice && (
        <p className="text-gray-400 text-sm mt-1">
          After hours: {typeof stock.afterHoursPrice === "string" ? stock.afterHoursPrice : `${currencySymbol}${formatNumber(stock.afterHoursPrice)}`}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
        <p>📈 Open: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.open)}</span></p>
        <p>📊 High: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.high)}</span></p>
        <p>📉 Low: <span className="text-gray-300">{currencySymbol}{formatNumber(stock.low)}</span></p>
        <p>💰 Mkt Cap: <span className="text-gray-300">{stock.marketCap?.toLocaleString() || "N/A"}</span></p>
        <p>📈 Avg Vol: <span className="text-gray-300">{stock.avgVolume?.toLocaleString() || "N/A"}</span></p>
        <p>📑 Shares: <span className="text-gray-300">{stock.sharesOutstanding?.toLocaleString() || "N/A"}</span></p>
        <p>🏦 Div Yield: <span className="text-gray-300">{formatNumber(stock.dividendYield, 4)}</span></p>
      </div>

      <p className="text-gray-500 text-xs mt-4">⏳ Last Updated: {stock.lastUpdated}</p>
    </div>
  );
};

export default StockInfo;
