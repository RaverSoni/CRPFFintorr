// "use client";

// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { useRouter } from "next/navigation";

// // Indices for live updates
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
//   const [data, setData] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchIndexData = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/index-data/${symbol}/`);
//         const result = await response.json();
//         setData(result);
//       } catch (error) {
//         console.error(`Error fetching ${symbol} data`, error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchIndexData();
//     const interval = setInterval(fetchIndexData, 10000); // Refresh every 10s
//     return () => clearInterval(interval);
//   }, [symbol]);

//   return (
//     <div className="bg-gray-800 text-white p-3 rounded-lg shadow-md text-center w-40">
//       <p className="font-bold text-sm">{title}</p>
//       {loading ? (
//         <p className="text-xs text-gray-400">Loading...</p>
//       ) : (
//         <>
//           <p className={`text-lg font-semibold ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.current_price || "N/A"}
//           </p>
//           <p className={`text-sm ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.day_change} ({data.percentage_change}%)
//           </p>
//         </>
//       )}
//     </div>
//   );
// };

// const DashboardContent = () => {
//   const router = useRouter();
//   const [portfolio, setPortfolio] = useState({});
//   const [positions, setPositions] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [funds, setFunds] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch all necessary trading data
//     const fetchTradingData = async () => {
//       try {
//         const [portfolioRes, positionsRes, ordersRes, fundsRes] = await Promise.all([
//           fetch("http://127.0.0.1:8000/api/portfolio/"),
//           fetch("http://127.0.0.1:8000/api/positions/"),
//           fetch("http://127.0.0.1:8000/api/orders/"),
//           fetch("http://127.0.0.1:8000/api/funds/")
//         ]);

//         const [portfolioData, positionsData, ordersData, fundsData] = await Promise.all([
//           portfolioRes.json(),
//           positionsRes.json(),
//           ordersRes.json(),
//           fundsRes.json()
//         ]);

//         setPortfolio(portfolioData);
//         setPositions(positionsData.positions);
//         setOrders(ordersData.orders);
//         setFunds(fundsData);
//       } catch (error) {
//         console.error("Error fetching trading data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTradingData();
//     const interval = setInterval(fetchTradingData, 5000); // Refresh every 5s
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       {/* Indices Navigation */}
//       <div className="flex space-x-3 overflow-x-auto mb-6">
//         {indices.map((index) => (
//           <IndexCard key={index.symbol} symbol={index.symbol} title={index.title} />
//         ))}
//       </div>

//       {/* Dashboard Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Portfolio Summary */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Portfolio Summary</h2>
//           <p>Buying Power: ₹{portfolio?.buyingPower?.toLocaleString() || "0"}</p>
//           <p>Total P&L: ₹{portfolio?.profitLoss?.toFixed(2) || "0.00"}</p>
//         </div>

//         {/* Funds Summary */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Funds & Margins</h2>
//           <p>Available Margin: ₹{funds?.available_margin?.toLocaleString() || "0"}</p>
//           <p>Used Margin: ₹{funds?.used_margin?.toLocaleString() || "0"}</p>
//           <p>Opening Balance: ₹{funds?.opening_balance?.toLocaleString() || "0"}</p>
//         </div>

//         {/* Recent Orders */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Recent Orders</h2>
//           <ul>
//             {orders.slice(0, 3).map((order, index) => (
//               <li key={index} className="text-sm border-b border-gray-700 py-1">
//                 {order.tradeType.toUpperCase()} {order.quantity} {order.ticker} @ ₹{order.price}
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       {/* Live Positions */}
//       <div className="mt-6 p-4 bg-gray-900 rounded-lg">
//         <h2 className="text-lg font-semibold">Live Positions</h2>
//         {loading ? (
//           <p>Loading positions...</p>
//         ) : positions.length === 0 ? (
//           <p>No open positions.</p>
//         ) : (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-gray-700 text-left">
//                 <th className="py-2">Ticker</th>
//                 <th>Quantity</th>
//                 <th>Avg. Price</th>
//                 <th>P&L</th>
//               </tr>
//             </thead>
//             <tbody>
//               {positions.map((pos, index) => (
//                 <tr key={index} className="border-b border-gray-800">
//                   <td className="py-2">{pos.ticker}</td>
//                   <td>{pos.quantity}</td>
//                   <td>₹{pos.avg_price.toFixed(2)}</td>
//                   <td className={pos.pnl >= 0 ? "text-green-400" : "text-red-400"}>
//                     ₹{pos.pnl.toFixed(2)}
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
// const Dashboard = dynamic(() => Promise.resolve(DashboardContent), { ssr: false });

// export default Dashboard;



















// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import dynamic from "next/dynamic";
// import Link from "next/link";

// // ✅ Indices List
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
//   const [data, setData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchIndexData = async () => {
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

//     fetchIndexData();
//     const interval = setInterval(fetchIndexData, 5000); // Refresh every 5 seconds
//     return () => clearInterval(interval);
//   }, [symbol]);

//   return (
//     <div className="bg-gray-800 text-white p-3 rounded-lg shadow-md text-center w-40">
//       <p className="font-bold text-sm">{title}</p>
//       {loading ? (
//         <p className="text-xs text-gray-400">Loading...</p>
//       ) : error ? (
//         <p className="text-xs text-red-500">{error}</p>
//       ) : (
//         <>
//           <p className={`text-lg font-semibold ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.current_price || "N/A"}
//           </p>
//           <p className={`text-sm ${data.day_change > 0 ? "text-green-400" : "text-red-400"}`}>
//             {data.day_change} ({data.percentage_change}%)
//           </p>
//         </>
//       )}
//     </div>
//   );
// };

// // ✅ Dashboard Component
// const DashboardContent = () => {
//   const router = useRouter();
//   const [portfolio, setPortfolio] = useState({});
//   const [positions, setPositions] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [funds, setFunds] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchTradingData = async () => {
//       try {
//         const [portfolioRes, positionsRes, ordersRes, fundsRes] = await Promise.all([
//           fetch("http://127.0.0.1:8000/api/portfolio/"),
//           fetch("http://127.0.0.1:8000/api/positions/"),
//           fetch("http://127.0.0.1:8000/api/orders/"),
//           fetch("http://127.0.0.1:8000/api/funds/")
//         ]);

//         if (!portfolioRes.ok || !positionsRes.ok || !ordersRes.ok || !fundsRes.ok) {
//           throw new Error("Error fetching data");
//         }

//         const [portfolioData, positionsData, ordersData, fundsData] = await Promise.all([
//           portfolioRes.json(),
//           positionsRes.json(),
//           ordersRes.json(),
//           fundsRes.json()
//         ]);

//         setPortfolio(portfolioData);
//         setPositions(positionsData.positions || []);
//         setOrders(ordersData.orders || []);
//         setFunds(fundsData);
//         setError(null);
//       } catch (error) {
//         setError("Failed to fetch trading data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTradingData();
//     const interval = setInterval(fetchTradingData, 5000); // Refresh every 5 seconds
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       {/* 🔹 Indices Navigation */}
//       <div className="flex space-x-3 overflow-x-auto mb-6">
//         {indices.map((index) => (
//           <IndexCard key={index.symbol} symbol={index.symbol} title={index.title} />
//         ))}
//       </div>

//       {/* 🔹 Dashboard Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Portfolio Summary */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Portfolio Summary</h2>
//           <p>💰 Buying Power: ₹{portfolio?.buyingPower?.toLocaleString() || "0"}</p>
//           <p>📈 Total P&L: ₹{portfolio?.profitLoss?.toFixed(2) || "0.00"}</p>
//         </div>

//         {/* Funds Summary */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Funds & Margins</h2>
//           <p>Available Margin: ₹{funds?.available_margin?.toLocaleString() || "0"}</p>
//           <p>Used Margin: ₹{funds?.used_margin?.toLocaleString() || "0"}</p>
//           <p>Opening Balance: ₹{funds?.opening_balance?.toLocaleString() || "0"}</p>
//         </div>

//         {/* Recent Orders */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Recent Orders</h2>
//           {orders.length === 0 ? (
//             <p>No recent orders.</p>
//           ) : (
//             <ul>
//               {orders.slice(0, 3).map((order, index) => (
//                 <li key={index} className="text-sm border-b border-gray-700 py-1">
//                   {order.tradeType.toUpperCase()} {order.quantity} {order.ticker} @ ₹{order.price}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>

//       {/* 🔹 Live Positions */}
//       <div className="mt-6 p-4 bg-gray-900 rounded-lg">
//         <h2 className="text-lg font-semibold">Live Positions</h2>
//         {loading ? (
//           <p>Loading positions...</p>
//         ) : error ? (
//           <p className="text-red-500">{error}</p>
//         ) : positions.length === 0 ? (
//           <p>No open positions.</p>
//         ) : (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-gray-700 text-left">
//                 <th className="py-2">Ticker</th>
//                 <th>Quantity</th>
//                 <th>Avg. Price</th>
//                 <th>P&L</th>
//               </tr>
//             </thead>
//             <tbody>
//               {positions.map((pos, index) => (
//                 <tr key={index} className="border-b border-gray-800">
//                   <td className="py-2">{pos.ticker}</td>
//                   <td>{pos.quantity}</td>
//                   <td>₹{pos.avg_price.toFixed(2)}</td>
//                   <td className={pos.pnl >= 0 ? "text-green-400" : "text-red-400"}>
//                     ₹{pos.pnl.toFixed(2)}
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
// const Dashboard = dynamic(() => Promise.resolve(DashboardContent), { ssr: false });

// export default Dashboard;

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Button from "@/components/buttons/buttons"; // ✅ Custom Styled Button
import Loader from "@/components/Loaders/loader"; // ✅ Loading Wave Component

// ✅ Indices List
const indices = [
  { symbol: "^NSEI", title: "📌 Nifty 50" },
  { symbol: "^NSEBANK", title: "🏦 BankNifty" },
  { symbol: "^BSESN", title: "📊 Sensex" },
  { symbol: "NIFTY_FIN_SERVICE.NS", title: "💳 FinNifty" },
  { symbol: "NIFTYMIDCAP150.NS", title: "📈 Midcap" },
  { symbol: "^NSEMDCP50", title: "📡 Nifty Next 50" },
  { symbol: "^CNX100", title: "🔥 Nifty Next 100" }
];

// ✅ Fetch & Display Index Data
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
          <Loader />
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

// ✅ Dashboard Component
const DashboardContent = () => {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState({});
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [funds, setFunds] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTradingData = async () => {
      try {
        const [portfolioRes, positionsRes, ordersRes, fundsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/portfolio/"),
          fetch("http://127.0.0.1:8000/api/positions/"),
          fetch("http://127.0.0.1:8000/api/orders/"),
          fetch("http://127.0.0.1:8000/api/funds/")
        ]);

        if (!portfolioRes.ok || !positionsRes.ok || !ordersRes.ok || !fundsRes.ok) {
          throw new Error("Error fetching data");
        }

        const [portfolioData, positionsData, ordersData, fundsData] = await Promise.all([
          portfolioRes.json(),
          positionsRes.json(),
          ordersRes.json(),
          fundsRes.json()
        ]);

        setPortfolio(portfolioData);
        setPositions(positionsData.positions || []);
        setOrders(ordersData.orders || []);
        setFunds(fundsData);
        setError(null);
      } catch (error) {
        setError("Failed to fetch trading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTradingData();
    const interval = setInterval(fetchTradingData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      {/* 🔹 Indices Navigation */}
      <div className="flex space-x-4 overflow-x-auto mb-6 scrollbar-hide">
        {indices.map((index) => (
          <IndexCard key={index.symbol} symbol={index.symbol} title={index.title} />
        ))}
      </div>

      {/* 🔹 Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Portfolio Summary */}
        <div className="p-6 bg-gray-900 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold">💰 Portfolio Summary</h2>
          <p>💸 Buying Power: ₹{portfolio?.buyingPower?.toLocaleString() || "0"}</p>
          <p>📈 Total P&L: ₹{portfolio?.profitLoss?.toFixed(2) || "0.00"}</p>
          
        </div>

        {/* Funds Summary */}
        <div className="p-6 bg-gray-900 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold">🏦 Funds & Margins</h2>
          <p>💲 Available Margin: ₹{funds?.available_margin?.toLocaleString() || "0"}</p>
          <p>📉 Used Margin: ₹{funds?.used_margin?.toLocaleString() || "0"}</p>
          
        </div>

        {/* Recent Orders */}
        <div className="p-6 bg-gray-900 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold">📜 Recent Orders</h2>
          {orders.length === 0 ? (
            <p>No recent orders.</p>
          ) : (
            <ul>
              {orders.slice(0, 3).map((order, index) => (
                <li key={index} className="text-sm border-b border-gray-700 py-1">
                  {order.tradeType.toUpperCase()} {order.quantity} {order.ticker} @ ₹{order.price}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 🔹 Live Positions */}
      <div className="mt-6 p-6 bg-gray-900 rounded-xl shadow-lg">
        <h2 className="text-lg font-semibold">📊 Live Positions</h2>
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : positions.length === 0 ? (
          <p>No open positions.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="py-2">📌 Ticker</th>
                <th>📦 Quantity</th>
                <th>💲 Avg. Price</th>
                <th>🔥 P&L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                  <td className="py-2">{pos.ticker}</td>
                  <td>{pos.quantity}</td>
                  <td>₹{pos.avg_price.toFixed(2)}</td>
                  <td className={pos.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                    ₹{pos.pnl.toFixed(2)}
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

const Dashboard = dynamic(() => Promise.resolve(DashboardContent), { ssr: false });

export default Dashboard;