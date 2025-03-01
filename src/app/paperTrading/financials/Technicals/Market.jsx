// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { Treemap, Tooltip, ResponsiveContainer } from "recharts";

// const Market = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [marketData, setMarketData] = useState([]);
//   const [indexData, setIndexData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let isMounted = true;
//     const fetchMarketData = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/api/market/${ticker}/`);
//         if (!response.ok) {
//           throw new Error(`Failed to fetch market data: ${response.status} ${response.statusText}`);
//         }
//         const data = await response.json();

//         if (isMounted) {
//           setMarketData(
//             data.sectors.map((stock) => ({
//               name: stock.ticker,
//               sector: stock.sector,
//               size: Math.abs(stock.change_percent),
//               change_percent: stock.change_percent,
//             })) || []
//           );
//           setIndexData(data.index || {});
//           setLoading(false);
//         }
//       } catch (err) {
//         console.error("❌ Error fetching market data:", err);
//         if (isMounted) {
//           setError(err.message);
//           setLoading(false);
//         }
//       }
//     };

//     fetchMarketData();
//     return () => {
//       isMounted = false;
//     };
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-3xl font-bold mb-4">Market Overview</h1>

//       {indexData.name && (
//         <div className="mb-6">
//           <h2 className="text-xl font-semibold">{indexData.name}</h2>
//           <p className="text-lg">
//             {indexData.price}{" "}
//             <span className={indexData.change > 0 ? "text-green-400" : "text-red-400"}>
//               {indexData.change > 0 ? "▲" : "▼"} {indexData.change} ({indexData.change_percent}%)
//             </span>
//           </p>
//         </div>
//       )}

//       {loading && <p>Loading market data...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {marketData.length > 0 ? (
//         <ResponsiveContainer width="100%" height={500}>
//           <Treemap
//             data={marketData}
//             dataKey="size"
//             nameKey="name"
//             stroke="black"
//             fill="#82ca9d"
//           >
//             <Tooltip />
//           </Treemap>
//         </ResponsiveContainer>
//       ) : (
//         !loading && <p>No market data available.</p>
//       )}
//     </div>
//   );
// };

// export default Market;

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Treemap, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { AiOutlineStock, AiOutlineLineChart, AiOutlineRise, AiOutlineFall } from "react-icons/ai";

const Market = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT";

  const [marketData, setMarketData] = useState([]);
  const [indexData, setIndexData] = useState({});
  const [scannerData, setScannerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMarketData = async () => {
      try {
        const [marketResponse, scannerResponse] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/market/${ticker}/`),
          fetch(`http://127.0.0.1:8000/api/scanners/${ticker}/`)
        ]);

        if (!marketResponse.ok || !scannerResponse.ok) {
          throw new Error("Failed to fetch market or scanner data.");
        }

        const [marketData, scannerData] = await Promise.all([
          marketResponse.json(),
          scannerResponse.json()
        ]);

        if (isMounted) {
          setMarketData(
            marketData.sectors.map((stock) => ({
              name: stock.ticker,
              sector: stock.sector,
              size: Math.abs(stock.change_percent),
              change_percent: stock.change_percent,
            })) || []
          );
          setIndexData(marketData.index || {});
          setScannerData(scannerData.popular_scanners || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching market data:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchMarketData();
    return () => {
      isMounted = false;
    };
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
  
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">⚠️ {error}</p>;
  }

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-3xl font-bold flex items-center mb-6">
        <AiOutlineStock className="mr-2 text-yellow-400" />
        Market Overview - {ticker}
      </h1>

      {/* 📊 Index Summary */}
      {indexData.name && (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">{indexData.name}</h2>
          <p className="text-lg flex items-center">
            {indexData.price}{" "}
            <span className={indexData.change > 0 ? "text-green-400" : "text-red-400"}>
              {indexData.change > 0 ? "▲" : "▼"} {indexData.change} ({indexData.change_percent}%)
            </span>
          </p>
        </div>
      )}

      {/* 📌 Treemap Visualization */}
      {marketData.length > 0 ? (
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineLineChart className="mr-2 text-green-400" /> Market Performance Treemap
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={marketData}
              dataKey="size"
              nameKey="name"
              stroke="black"
              fill="#82ca9d"
            >
              <Tooltip />
            </Treemap>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-400">No market data available.</p>
      )}

      {/* 🔹 Sector-wise Performance Graph */}
      <div className="mt-6 bg-gray-900 p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold flex items-center">
          <AiOutlineRise className="mr-2 text-blue-400" />
          Sector Performance
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={marketData}>
            <XAxis dataKey="sector" stroke="white" />
            <YAxis stroke="white" />
            <Tooltip />
            <Legend />
            <Bar dataKey="change_percent" fill="#00FF7F" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Scanner Insights */}
      <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">📊 Scanner Insights</h2>
        {scannerData.length === 0 ? (
          <p className="text-gray-400">No scanner data available.</p>
        ) : (
          <ul className="mt-3 list-disc pl-5">
            {scannerData.map((scanner, index) => (
              <li key={index} className="text-white">
                {scanner.name} - <span className="text-yellow-300">{scanner.timeframe}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Market;