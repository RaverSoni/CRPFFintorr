// "use client";
// import React, { useState } from "react";
// import { X, Settings } from "lucide-react";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   BarChart,
//   Bar,
//   ComposedChart,
//   Area,
// } from "recharts";

// const data = [
//   { time: "Jan", price: 350, volume: 13000, ma50: 340, ma200: 320, rsi: 45, macd: 1.5, bbUpper: 360, bbLower: 340 },
//   { time: "Feb", price: 370, volume: 19000, ma50: 350, ma200: 330, rsi: 50, macd: 1.7, bbUpper: 380, bbLower: 355 },
//   { time: "Mar", price: 400, volume: 14000, ma50: 370, ma200: 340, rsi: 60, macd: 2.0, bbUpper: 420, bbLower: 380 },
//   { time: "Apr", price: 420, volume: 21000, ma50: 390, ma200: 350, rsi: 55, macd: 1.8, bbUpper: 440, bbLower: 400 },
//   { time: "May", price: 450, volume: 24000, ma50: 410, ma200: 360, rsi: 70, macd: 2.3, bbUpper: 470, bbLower: 420 },
// ];

// const StockChart = () => {
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [showMA50, setShowMA50] = useState(true);
//   const [showMA200, setShowMA200] = useState(true);
//   const [showRSI, setShowRSI] = useState(true);
//   const [showVolume, setShowVolume] = useState(true);
//   const [showMACD, setShowMACD] = useState(true);
//   const [showBollinger, setShowBollinger] = useState(true);

//   return (
//     <>
//       {/* FULL-SCREEN CHART WITH TOGGLE CONTROLS */}
//       {isFullScreen && (
//         <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-4">
//           <button
//             onClick={() => setIsFullScreen(false)}
//             className="absolute top-4 right-4 text-gray-300 hover:text-white bg-gray-800 p-2 rounded"
//           >
//             <X size={30} />
//           </button>

//           <h2 className="text-xl text-white mb-2">MSFT Stock Price (Click to Exit Fullscreen)</h2>

//           {/* Toggle Controls */}
//           <div className="flex space-x-4 mb-4 bg-gray-800 p-3 rounded-lg">
//             <button onClick={() => setShowMA50(!showMA50)} className={`px-3 py-2 rounded ${showMA50 ? "bg-blue-500" : "bg-gray-600"}`}>MA50</button>
//             <button onClick={() => setShowMA200(!showMA200)} className={`px-3 py-2 rounded ${showMA200 ? "bg-blue-500" : "bg-gray-600"}`}>MA200</button>
//             <button onClick={() => setShowRSI(!showRSI)} className={`px-3 py-2 rounded ${showRSI ? "bg-blue-500" : "bg-gray-600"}`}>RSI</button>
//             <button onClick={() => setShowVolume(!showVolume)} className={`px-3 py-2 rounded ${showVolume ? "bg-blue-500" : "bg-gray-600"}`}>Volume</button>
//             <button onClick={() => setShowMACD(!showMACD)} className={`px-3 py-2 rounded ${showMACD ? "bg-blue-500" : "bg-gray-600"}`}>MACD</button>
//             <button onClick={() => setShowBollinger(!showBollinger)} className={`px-3 py-2 rounded ${showBollinger ? "bg-blue-500" : "bg-gray-600"}`}>Bollinger</button>
//           </div>

//           {/* Advanced Chart */}
//           <ResponsiveContainer width="90%" height={500}>
//             <ComposedChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#444" />
//               <XAxis dataKey="time" stroke="#bbb" />
//               <YAxis stroke="#bbb" />
//               <Tooltip />
//               <Line type="monotone" dataKey="price" stroke="#34d399" strokeWidth={2} />
//               {showMA50 && <Line type="monotone" dataKey="ma50" stroke="yellow" strokeWidth={2} strokeDasharray="5 5" />}
//               {showMA200 && <Line type="monotone" dataKey="ma200" stroke="orange" strokeWidth={2} strokeDasharray="3 3" />}
//               {showBollinger && <Line type="monotone" dataKey="bbUpper" stroke="red" strokeDasharray="4 4" />}
//               {showBollinger && <Line type="monotone" dataKey="bbLower" stroke="red" strokeDasharray="4 4" />}
//               {showMACD && <Area type="monotone" dataKey="macd" stroke="purple" fill="rgba(128, 0, 128, 0.3)" />}
//             </ComposedChart>
//           </ResponsiveContainer>

//           {/* Volume Chart */}
//           {showVolume && (
//             <ResponsiveContainer width="90%" height={150}>
//               <BarChart data={data}>
//                 <XAxis dataKey="time" stroke="#bbb" />
//                 <YAxis stroke="#bbb" />
//                 <Tooltip />
//                 <Bar dataKey="volume" fill="#4F46E5" />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </div>
//       )}

//       {/* REGULAR DARK BACKGROUND CHART */}
//       <div
//         className="bg-gray-900 p-6 rounded-lg shadow-md w-full cursor-pointer"
//         onClick={() => setIsFullScreen(true)}
//       >
//         <h2 className="text-lg font-semibold mb-4">MSFT Stock Price</h2>
//         <ResponsiveContainer width="100%" height={350}>
//           <LineChart data={data}>
//             <XAxis dataKey="time" stroke="#ccc" />
//             <YAxis stroke="#ccc" />
//             <Tooltip />
//             <Line type="monotone" dataKey="price" stroke="#34d399" strokeWidth={2} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </>
//   );
// };

// export default StockChart;


// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import dynamic from "next/dynamic";

// const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// const StockChart = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT"; // Default to MSFT
//   const [chartData, setChartData] = useState(null);
//   const [chartLayout, setChartLayout] = useState(null);
//   const [selectedTimeframe, setSelectedTimeframe] = useState("5Y");
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchChartData = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/api/stock_chart/${ticker}/`);
//         if (!response.ok) throw new Error("Failed to fetch stock chart data");
//         const data = await response.json();

//         if (data[selectedTimeframe] && data[selectedTimeframe].data) {
//           setChartData(data[selectedTimeframe].data);
//           setChartLayout({
//             ...data[selectedTimeframe].layout,
//             height: 750,
//             width: 1300,
//           });
//         } else {
//           setError("Invalid chart data received");
//         }
//       } catch (err) {
//         setError("Error fetching data");
//       }
//     };

//     fetchChartData();
//   }, [ticker, selectedTimeframe]);

//   return (
//     <div className="bg-black p-6 rounded-lg shadow-md w-full text-white">
//       <div className="flex justify-end space-x-4 mb-2">
//         <select
//           className="bg-gray-800 text-white p-2 rounded"
//           value={selectedTimeframe}
//           onChange={(e) => setSelectedTimeframe(e.target.value)}
//         >
//           <option value="1D">1D</option>
//           <option value="1M">1M</option>
//           <option value="6M">6M</option>
//           <option value="1Y">1Y</option>
//           <option value="5Y">5Y</option>
//         </select>
//       </div>

//       {error ? <p className="text-red-400">{error}</p> : <Plot data={chartData} layout={chartLayout} />}
//     </div>
//   );
// };

// export default StockChart;

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const StockChart = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT"; // Default to MSFT
  const [chartData, setChartData] = useState(null);
  const [chartLayout, setChartLayout] = useState(null);
  const [technicalData, setTechnicalData] = useState(null);
  const [technicalLayout, setTechnicalLayout] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("5Y");
  const [error, setError] = useState(null);
  const [techError, setTechError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/stock_chart/${ticker}/`);
        if (!response.ok) throw new Error("Failed to fetch stock chart data");
        const data = await response.json();

        // Handle Stock Chart Data
        if (data.stock_chart && data.stock_chart[selectedTimeframe]) {
          setChartData(data.stock_chart[selectedTimeframe].data);
          setChartLayout({
            ...data.stock_chart[selectedTimeframe].layout,
            height: 600,
            width: 1200,
          });
        } else {
          setError("Invalid stock chart data received");
        }

        // Handle Technical Chart Data
        if (data.technical_chart && data.technical_chart[selectedTimeframe]) {
          setTechnicalData(data.technical_chart[selectedTimeframe].data);
          setTechnicalLayout({
            ...data.technical_chart[selectedTimeframe].layout,
            height: 300, // Smaller height for technical indicators
            width: 1200,
          });
        } else {
          setTechError("Invalid technical chart data received");
        }
      } catch (err) {
        setError("Error fetching data");
        setTechError("Error fetching technical data");
      }
    };

    fetchChartData();
  }, [ticker, selectedTimeframe]);

  return (
    <div className="bg-black p-6 rounded-lg shadow-md w-full text-white">
      {/* Timeframe Selection for Both Charts */}
      <div className="flex justify-end space-x-4 mb-4">
        <label className="text-gray-300 text-sm">Timeframe:</label>
        <select
          className="bg-gray-800 text-white p-2 rounded"
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
        >
          <option value="1D">1D</option>
          <option value="1M">1M</option>
          <option value="6M">6M</option>
          <option value="1Y">1Y</option>
          <option value="5Y">5Y</option>
        </select>
      </div>

      {/* Closing Price Chart */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Stock Price Chart</h2>
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          chartData && chartLayout ? <Plot data={chartData} layout={chartLayout} /> : <p className="text-gray-500">Loading...</p>
        )}
      </div>

      {/* Technical Indicators Chart */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Technical Analysis</h2>
        {techError ? (
          <p className="text-red-400">{techError}</p>
        ) : (
          technicalData && technicalLayout ? <Plot data={technicalData} layout={technicalLayout} /> : <p className="text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default StockChart;
