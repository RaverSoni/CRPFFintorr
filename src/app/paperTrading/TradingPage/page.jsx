// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import dynamic from "next/dynamic";
// import Link from "next/link";

// // List of Indices
// const indices = [
//   { symbol: "^NSEI", title: "Nifty 50" },
//   { symbol: "^NSEBANK", title: "BankNifty" },
//   { symbol: "^BSESN", title: "Sensex" },
//   { symbol: "^CNXFMCG", title: "FinNifty" },
//   { symbol: "^CNXMCAP", title: "Midcap" },
//   { symbol: "^NSEMDCP50", title: "Nifty Next 50" },
//   { symbol: "^NSE100", title: "Nifty Next 100" }
// ];

// // Fetch & Display Index Data
// const IndexCard = ({ symbol, title }) => {
//   const router = useRouter();
//   const [data, setData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/index-data/${symbol}/`);
//         const result = await response.json();
//         setData(result);
//         setError(null);
//       } catch (error) {
//         setError("Error loading index data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 10000);
//     return () => clearInterval(interval);
//   }, [symbol]);

//   return (
//     <button
//       onClick={() => router.push(`/TradingPage?ticker=${symbol}`)}
//       className="flex flex-col items-center bg-gray-800 text-white p-2 rounded-lg shadow-md min-w-[130px] max-w-[160px] text-center hover:bg-gray-700 transition-all duration-200"
//     >
//       {loading ? (
//         <span className="text-xs text-gray-400">Loading...</span>
//       ) : error ? (
//         <span className="text-xs text-red-500">Error</span>
//       ) : (
//         <>
//           <span className="font-bold text-sm">{title}</span>
//           <span className={`text-lg font-semibold ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.current_price || "N/A"}
//           </span>
//           <span className={`text-sm ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.day_change} ({data.percentage_change}%)
//           </span>
//         </>
//       )}
//     </button>
//   );
// };

// const TradingPageContent = () => {
//   const router = useRouter();
//   const [ticker, setTicker] = useState("MSFT");
//   const [tradeHistory, setTradeHistory] = useState([]);
//   const [portfolio, setPortfolio] = useState({ buyingPower: 1000000, profitLoss: 0 }); // Example Paper Trading
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const searchParams = new URLSearchParams(window.location.search);
//       const paramTicker = searchParams.get("ticker");
//       if (paramTicker) setTicker(paramTicker);
//     }
//   }, []);

//   useEffect(() => {
//     if (!ticker) return;

//     const fetchTradeHistory = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/trade_history/");
//         const data = await response.json();
//         setTradeHistory(data.trades || []);
//         setPortfolio(data.portfolio);
//       } catch (error) {
//         console.error("Error fetching trade history:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTradeHistory();
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       {/* Indices Navigation Bar */}
//       <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md mb-4">
//         <div className="flex space-x-3 overflow-x-auto">
//           {indices.map((index) => (
//             <IndexCard key={index.symbol} symbol={index.symbol} title={index.title} />
//           ))}
//         </div>

//         {/* ➡️ Button to open Indices page */}
//         <button
//           className="text-sm px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600"
//           onClick={() => router.push("/paperTrading/Indices")}
//         >
//           ➡️
//         </button>
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex space-x-4 border-b border-gray-700 pb-2 mb-4">
//         {[
//           { path: "/Dashboard", label: "Dashboard" },
//           { path: "/Orders", label: "Orders" },
//           { path: "/Holdings", label: "Holdings" },
//           { path: "/Positions", label: "Positions" },
//           { path: "/Funds", label: "Funds" },
//         ].map((tab) => (
//           <Link key={tab.path} href={tab.path}>
//             <button
//               className={`px-4 py-2 text-sm rounded-md transition-all hover:bg-gray-800`}
//             >
//               {tab.label}
//             </button>
//           </Link>
//         ))}
//       </div>

//       {/* Trade Summary */}
//       <h1 className="text-2xl font-bold">Trade Summary for {ticker}</h1>

//       {loading ? (
//         <p>Loading trades...</p>
//       ) : (
//         <>
//           {/* Portfolio Section */}
//           <div className="mt-4 p-4 bg-gray-900 rounded-lg">
//             <h2 className="text-lg font-semibold">Portfolio</h2>
//             <p>Buying Power: ${portfolio?.buyingPower?.toLocaleString() || "0"}</p>
//             <p>Total P&L: ${portfolio?.profitLoss?.toFixed(2) || "0.00"}</p>
//           </div>

//           {/* Trade History */}
//           <div className="mt-6 p-4 bg-gray-900 rounded-lg">
//             <h2 className="text-lg font-semibold">Trade History</h2>
//             <ul>
//               {tradeHistory.map((trade, index) => (
//                 <li key={index} className="py-2">
//                   {trade.tradeType.toUpperCase()} {trade.quantity} shares of {trade.ticker} @ $
//                   {trade.price !== "N/A" ? trade.price.toFixed(2) : "N/A"} ({trade.orderType})
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// // ✅ Force client-side rendering
// const TradingPage = dynamic(() => Promise.resolve(TradingPageContent), { ssr: false });

// export default TradingPage;



// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import dynamic from "next/dynamic";
// import Link from "next/link";

// // ✅ List of Indices
// const indices = [
//   { symbol: "^NSEI", title: "Nifty 50" },
//   { symbol: "^NSEBANK", title: "BankNifty" },
//   { symbol: "^BSESN", title: "Sensex" },
//   { symbol: "^CNXFMCG", title: "FinNifty" },
//   { symbol: "^CNXMCAP", title: "Midcap" },
//   { symbol: "^NSEMDCP50", title: "Nifty Next 50" },
//   { symbol: "^NSE100", title: "Nifty Next 100" }
// ];

// // ✅ Fetch & Display Index Data
// const IndexCard = ({ symbol, title }) => {
//   const router = useRouter();
//   const [data, setData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/index-data/${symbol}/`);
//         const result = await response.json();
//         setData(result);
//         setError(null);
//       } catch (error) {
//         setError("Error loading index data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 10000);
//     return () => clearInterval(interval);
//   }, [symbol]);

//   return (
//     <button
//       onClick={() => router.push(`/paperTrading/TradingPage?ticker=${symbol}`)}
//       className="flex flex-col items-center bg-gray-800 text-white p-2 rounded-lg shadow-md min-w-[130px] max-w-[160px] text-center hover:bg-gray-700 transition-all duration-200"
//     >
//       {loading ? (
//         <span className="text-xs text-gray-400">Loading...</span>
//       ) : error ? (
//         <span className="text-xs text-red-500">Error</span>
//       ) : (
//         <>
//           <span className="font-bold text-sm">{title}</span>
//           <span className={`text-lg font-semibold ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.current_price || "N/A"}
//           </span>
//           <span className={`text-sm ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.day_change} ({data.percentage_change}%)
//           </span>
//         </>
//       )}
//     </button>
//   );
// };

// // ✅ Trading Page Component
// const TradingPageContent = () => {
//   const router = useRouter();
//   const [ticker, setTicker] = useState("NIFTY");
//   const [tradeHistory, setTradeHistory] = useState([]);
//   const [portfolio, setPortfolio] = useState({ buyingPower: 1000000, profitLoss: 0 });
//   const [positions, setPositions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const searchParams = new URLSearchParams(window.location.search);
//       const paramTicker = searchParams.get("ticker");
//       if (paramTicker) setTicker(paramTicker);
//     }
//   }, []);

//   useEffect(() => {
//     if (!ticker) return;

//     // Fetch data for trading history, portfolio, and positions
//     const fetchData = async () => {
//       try {
//         const tradeResponse = await fetch("http://127.0.0.1:8000/api/trade_history/");
//         const tradeData = await tradeResponse.json();

//         const portfolioResponse = await fetch("http://127.0.0.1:8000/api/portfolio/");
//         const portfolioData = await portfolioResponse.json();

//         const positionsResponse = await fetch("http://127.0.0.1:8000/api/positions/");
//         const positionsData = await positionsResponse.json();

//         setTradeHistory(tradeData.trades || []);
//         setPortfolio(portfolioData);
//         setPositions(positionsData.positions || []);
//       } catch (error) {
//         console.error("Error fetching trade data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 10000); // Refresh data every 10 sec
//     return () => clearInterval(interval);
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       {/* 🔹 Indices Navigation */}
//       <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md mb-4">
//         <div className="flex space-x-3 overflow-x-auto">
//           {indices.map((index) => (
//             <IndexCard key={index.symbol} symbol={index.symbol} title={index.title} />
//           ))}
//         </div>
//         <button
//           className="text-sm px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600"
//           onClick={() => router.push("/paperTrading/Indices")}
//         >
//           ➡️
//         </button>
//       </div>

//       {/* 🔹 Navigation Buttons */}
//       <div className="flex space-x-4 border-b border-gray-700 pb-2 mb-4">
//         {[
//           { path: "/paperTrading/TradingPage/Dashboard", label: "Dashboard" },
//           { path: "/paperTrading/TradingPage/Orders", label: "Orders" },
//           { path: "/paperTrading/TradingPage/Holdings", label: "Holdings" },
//           { path: "/paperTrading/TradingPage/Positions", label: "Positions" },
//           { path: "/paperTrading/TradingPage/Funds", label: "Funds" },
//         ].map((tab) => (
//           <Link key={tab.path} href={tab.path}>
//             <button className="px-4 py-2 text-sm rounded-md transition-all hover:bg-gray-800">
//               {tab.label}
//             </button>
//           </Link>
//         ))}
//       </div>

//       {/* 🔹 Portfolio Overview */}
//       <h1 className="text-2xl font-bold">Trade Summary for {ticker}</h1>

//       {loading ? (
//         <p>Loading trades...</p>
//       ) : (
//         <>
//           <div className="mt-4 p-4 bg-gray-900 rounded-lg">
//             <h2 className="text-lg font-semibold">Portfolio</h2>
//             <p>💰 Buying Power: ₹{portfolio?.buyingPower?.toLocaleString() || "0"}</p>
//             <p>📈 Total P&L: ₹{portfolio?.profitLoss?.toFixed(2) || "0.00"}</p>
//           </div>

//           {/* 🔹 Open Positions */}
//           {positions.length > 0 && (
//             <div className="mt-4 p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Open Positions</h2>
//               <ul>
//                 {positions.map((position, index) => (
//                   <li key={index} className="py-2">
//                     {position.ticker} - {position.quantity} shares @ ₹{position.avg_price} 
//                     (Current Price: ₹{position.current_price}, P&L: ₹{position.pnl})
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* 🔹 Trade History */}
//           <div className="mt-6 p-4 bg-gray-900 rounded-lg">
//             <h2 className="text-lg font-semibold">Trade History</h2>
//             <ul>
//               {tradeHistory.map((trade, index) => (
//                 <li key={index} className="py-2">
//                   {trade.tradeType.toUpperCase()} {trade.quantity} shares of {trade.ticker} @ ₹{trade.price} 
//                   ({trade.orderType})
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// // ✅ Force client-side rendering
// const TradingPage = dynamic(() => Promise.resolve(TradingPageContent), { ssr: false });

// export default TradingPage;





















// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import dynamic from "next/dynamic";
// import Link from "next/link";

// // ✅ List of Indices
// const indices = [
//   { symbol: "^NSEI", title: "Nifty 50" },
//   { symbol: "^NSEBANK", title: "BankNifty" },
//   { symbol: "^BSESN", title: "Sensex" },
//   { symbol: "^CNXFMCG", title: "FinNifty" },
//   { symbol: "^CNXMCAP", title: "Midcap" },
//   { symbol: "^NSEMDCP50", title: "Nifty Next 50" },
//   { symbol: "^NSE100", title: "Nifty Next 100" },
// ];

// // ✅ Fetch & Display Index Data
// const IndexCard = ({ symbol, title }) => {
//   const router = useRouter();
//   const [data, setData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/index-data/${symbol}/`);
//         const result = await response.json();
//         setData(result);
//         setError(null);
//       } catch (error) {
//         setError("Error loading index data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 5000);
//     return () => clearInterval(interval);
//   }, [symbol]);

//   return (
//     <button
//       onClick={() => router.push(`/paperTrading/TradingPage?ticker=${symbol}`)}
//       className="flex flex-col items-center bg-gray-800 text-white p-2 rounded-lg shadow-md min-w-[130px] max-w-[160px] text-center hover:bg-gray-700 transition-all duration-200"
//     >
//       {loading ? (
//         <span className="text-xs text-gray-400">Loading...</span>
//       ) : error ? (
//         <span className="text-xs text-red-500">Error</span>
//       ) : (
//         <>
//           <span className="font-bold text-sm">{title}</span>
//           <span className={`text-lg font-semibold ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.current_price || "N/A"}
//           </span>
//           <span className={`text-sm ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.day_change} ({data.percentage_change}%)
//           </span>
//         </>
//       )}
//     </button>
//   );
// };

// // ✅ Trading Page Component
// const TradingPageContent = () => {
//   const router = useRouter();
//   const [ticker, setTicker] = useState("NIFTY");
//   const [tradeHistory, setTradeHistory] = useState([]);
//   const [portfolio, setPortfolio] = useState({ buyingPower: 1000000, profitLoss: 0 });
//   const [positions, setPositions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const searchParams = new URLSearchParams(window.location.search);
//       const paramTicker = searchParams.get("ticker");
//       if (paramTicker) setTicker(paramTicker);
//     }
//   }, []);

//   useEffect(() => {
//     if (!ticker) return;

//     const fetchData = async () => {
//       try {
//         const [tradeRes, portfolioRes, positionsRes] = await Promise.all([
//           fetch("http://127.0.0.1:8000/api/trade_history/"),
//           fetch("http://127.0.0.1:8000/api/portfolio/"),
//           fetch("http://127.0.0.1:8000/api/positions/"),
//         ]);

//         if (!tradeRes.ok || !portfolioRes.ok || !positionsRes.ok) {
//           throw new Error("Error fetching data");
//         }

//         const [tradeData, portfolioData, positionsData] = await Promise.all([
//           tradeRes.json(),
//           portfolioRes.json(),
//           positionsRes.json(),
//         ]);

//         setTradeHistory(tradeData.trades || []);
//         setPortfolio(portfolioData);
//         setPositions(positionsData.positions || []);
//         setError(null);
//       } catch (err) {
//         setError("Failed to fetch data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 5000);
//     return () => clearInterval(interval);
//   }, [ticker]);

//   // ✅ Function to reset buying power
//   const resetBuyingPower = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/reset-buying-power/", {
//         method: "POST",
//       });

//       if (response.ok) {
//         setPortfolio((prev) => ({ ...prev, buyingPower: 1000000 }));
//       } else {
//         console.error("Failed to reset buying power");
//       }
//     } catch (error) {
//       console.error("Error resetting buying power:", error);
//     }
//   };

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       {/* 🔹 Navigation Bar */}
//       <div className="flex space-x-4 border-b border-gray-700 pb-2 mb-4">
//         {[
//           { path: "/paperTrading/Dashboard", label: "Dashboard" },
//           { path: "/paperTrading/Orders", label: "Orders" },
//           { path: "/paperTrading/Holdings", label: "Holdings" },
//           { path: "/paperTrading/Positions", label: "Positions" },
//           { path: "/paperTrading/Funds", label: "Funds" },
//         ].map((tab) => (
//           <Link key={tab.path} href={tab.path}>
//             <button className="px-4 py-2 text-sm rounded-md transition-all hover:bg-gray-800">
//               {tab.label}
//             </button>
//           </Link>
//         ))}
//       </div>

//       {/* 🔹 Portfolio Overview */}
//       <h1 className="text-2xl font-bold">Trade Summary for {ticker}</h1>

//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p className="text-red-500">{error}</p>
//       ) : (
//         <>
//           <div className="mt-4 p-4 bg-gray-900 rounded-lg flex justify-between items-center">
//             <div>
//               <h2 className="text-lg font-semibold">Portfolio</h2>
//               <p>💰 Buying Power: ₹{portfolio?.buyingPower?.toLocaleString() || "0"}</p>
//               <p>📈 Total P&L: ₹{portfolio?.profitLoss?.toFixed(2) || "0.00"}</p>
//             </div>
//             <button
//               className="bg-red-500 px-3 py-2 text-sm rounded-md hover:bg-red-600"
//               onClick={resetBuyingPower}
//             >
//               Reset Buying Power
//             </button>
//           </div>

//           {/* 🔹 Open Positions */}
//           {positions.length > 0 && (
//             <div className="mt-4 p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Open Positions</h2>
//               <ul>
//                 {positions.map((position, index) => (
//                   <li key={index} className="py-2">
//                     {position.ticker} - {position.quantity} shares @ ₹{position.avg_price}
//                     (Current Price: ₹{position.current_price}, P&L: ₹{position.pnl})
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// // ✅ Force client-side rendering
// const TradingPage = dynamic(() => Promise.resolve(TradingPageContent), { ssr: false });

// export default TradingPage;

// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import dynamic from "next/dynamic";
// import Link from "next/link";

// // ✅ List of Indices
// const indices = [
//   { symbol: "^NSEI", title: "Nifty 50" },
//   { symbol: "^NSEBANK", title: "BankNifty" },
//   { symbol: "^BSESN", title: "Sensex" },
//   { symbol: "^CNXFMCG", title: "FinNifty" },
//   { symbol: "^CNXMCAP", title: "Midcap" },
//   { symbol: "^NSEMDCP50", title: "Nifty Next 50" },
//   { symbol: "^NSE100", title: "Nifty Next 100" }
// ];

// // ✅ Fetch & Display Index Data
// const IndexCard = ({ symbol, title }) => {
//   const router = useRouter();
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchIndexData = useCallback(async () => {
//     try {
//       const response = await fetch(`http://127.0.0.1:8000/index-data/${symbol}/`);
//       const result = await response.json();
//       setData(result);
//       setError(null);
//     } catch {
//       setError("Error loading index data");
//     } finally {
//       setLoading(false);
//     }
//   }, [symbol]);

//   useEffect(() => {
//     fetchIndexData();
//     const interval = setInterval(fetchIndexData, 10000); // Refresh every 10s
//     return () => clearInterval(interval);
//   }, [fetchIndexData]);

//   return (
//     <button
//       onClick={() => router.push(`/paperTrading/TradingPage?ticker=${symbol}`)}
//       className="flex flex-col items-center bg-gray-800 text-white p-2 rounded-lg shadow-md min-w-[130px] max-w-[160px] text-center hover:bg-gray-700 transition-all duration-200"
//     >
//       {loading ? (
//         <span className="text-xs text-gray-400">Loading...</span>
//       ) : error ? (
//         <span className="text-xs text-red-500">Error</span>
//       ) : (
//         <>
//           <span className="font-bold text-sm">{title}</span>
//           <span className={`text-lg font-semibold ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.current_price || "N/A"}
//           </span>
//           <span className={`text-sm ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.day_change} ({data.percentage_change}%)
//           </span>
//         </>
//       )}
//     </button>
//   );
// };

// // ✅ Trading Page Component
// const TradingPageContent = () => {
//   const router = useRouter();
//   const [ticker, setTicker] = useState("NIFTY");
//   const [tradeHistory, setTradeHistory] = useState([]);
//   const [portfolio, setPortfolio] = useState({ buyingPower: 1000000, profitLoss: 0 });
//   const [positions, setPositions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const searchParams = new URLSearchParams(window.location.search);
//       const paramTicker = searchParams.get("ticker");
//       if (paramTicker) setTicker(paramTicker);
//     }
//   }, []);

//   const fetchTradingData = useCallback(async () => {
//     try {
//       const [tradeRes, portfolioRes, positionsRes] = await Promise.all([
//         fetch("http://127.0.0.1:8000/api/trade_history/"),
//         fetch("http://127.0.0.1:8000/api/portfolio/"),
//         fetch("http://127.0.0.1:8000/api/positions/")
//       ]);

//       const [tradeData, portfolioData, positionsData] = await Promise.all([
//         tradeRes.json(),
//         portfolioRes.json(),
//         positionsRes.json()
//       ]);

//       setTradeHistory(tradeData.trades || []);
//       setPortfolio(portfolioData);
//       setPositions(positionsData.positions || []);
//     } catch (error) {
//       console.error("Error fetching trade data:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchTradingData();
//     const interval = setInterval(fetchTradingData, 10000); // Refresh every 10s
//     return () => clearInterval(interval);
//   }, [fetchTradingData]);

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       {/* 🔹 Indices Navigation */}
//       <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md mb-4">
//         <div className="flex space-x-3 overflow-x-auto">
//           {indices.map((index) => (
//             <IndexCard key={index.symbol} symbol={index.symbol} title={index.title} />
//           ))}
//         </div>
//         <button
//           className="text-sm px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600"
//           onClick={() => router.push("/paperTrading/Indices")}
//         >
//           ➡️
//         </button>
//       </div>

//       {/* 🔹 Navigation Buttons */}
//       <div className="flex space-x-4 border-b border-gray-700 pb-2 mb-4">
//         {[
//           { path: "/paperTrading/TradingPage/Dashboard", label: "Dashboard" },
//           { path: "/paperTrading/TradingPage/Orders", label: "Orders" },
//           { path: "/paperTrading/TradingPage/Holdings", label: "Holdings" },
//           { path: "/paperTrading/TradingPage/Positions", label: "Positions" },
//           { path: "/paperTrading/TradingPage/Funds", label: "Funds" }
//         ].map((tab) => (
//           <Link key={tab.path} href={tab.path}>
//             <button className="px-4 py-2 text-sm rounded-md transition-all hover:bg-gray-800">
//               {tab.label}
//             </button>
//           </Link>
//         ))}
//       </div>

//       {/* 🔹 Portfolio Overview */}
//       <h1 className="text-2xl font-bold">Trade Summary for {ticker}</h1>

//       {loading ? (
//         <p>Loading trades...</p>
//       ) : (
//         <>
//           <div className="mt-4 p-4 bg-gray-900 rounded-lg">
//             <h2 className="text-lg font-semibold">Portfolio</h2>
//             <p>💰 Buying Power: ₹{portfolio?.buyingPower?.toLocaleString() || "0"}</p>
//             <p>📈 Total P&L: ₹{portfolio?.profitLoss?.toFixed(2) || "0.00"}</p>
//           </div>

//           {/* 🔹 Open Positions */}
//           {positions.length > 0 && (
//             <div className="mt-4 p-4 bg-gray-900 rounded-lg">
//               <h2 className="text-lg font-semibold">Open Positions</h2>
//               <ul>
//                 {positions.map((position, index) => (
//                   <li key={index} className="py-2">
//                     {position.ticker} - {position.quantity} shares @ ₹{position.avg_price}
//                     (Current Price: ₹{position.current_price}, P&L: ₹{position.pnl})
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* 🔹 Trade History */}
//           <div className="mt-6 p-4 bg-gray-900 rounded-lg">
//             <h2 className="text-lg font-semibold">Trade History</h2>
//             <ul>
//               {tradeHistory.map((trade, index) => (
//                 <li key={index} className="py-2">
//                   {trade.tradeType.toUpperCase()} {trade.quantity} shares of {trade.ticker} @ ₹{trade.price}
//                   ({trade.orderType})
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default dynamic(() => Promise.resolve(TradingPageContent), { ssr: false });

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