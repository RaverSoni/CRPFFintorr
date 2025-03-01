// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import dynamic from "next/dynamic";

// const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// const IndicesChart = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "^NSEI"; // Default to Nifty 50
//   const [chartData, setChartData] = useState(null);
//   const [chartLayout, setChartLayout] = useState(null);
//   const [technicalData, setTechnicalData] = useState(null);
//   const [technicalLayout, setTechnicalLayout] = useState(null);
//   const [selectedTimeframe, setSelectedTimeframe] = useState("5Y");
//   const [error, setError] = useState(null);
//   const [techError, setTechError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchChartData = async () => {
//       setLoading(true);
//       setError(null);
//       setTechError(null);

//       try {
//         const encodedTicker = encodeURIComponent(ticker);
//         const response = await fetch(`http://127.0.0.1:8000/api/indices_chart/${encodedTicker}/`);

//         if (!response.ok) throw new Error("Failed to fetch index chart data");

//         const data = await response.json();

//         // Handle Index Price Chart Data
//         if (data.index_chart && data.index_chart[selectedTimeframe]) {
//           setChartData(data.index_chart[selectedTimeframe].data);
//           setChartLayout({
//             ...data.index_chart[selectedTimeframe].layout,
//             height: 600,
//             width: "100%",
//             responsive: true,
//           });
//         } else {
//           setError("Invalid index chart data received");
//         }

//         // Handle Technical Indicators Chart Data
//         if (data.technical_chart && data.technical_chart[selectedTimeframe]) {
//           setTechnicalData(data.technical_chart[selectedTimeframe].data);
//           setTechnicalLayout({
//             ...data.technical_chart[selectedTimeframe].layout,
//             height: 300, // Smaller height for technical indicators
//             width: "100%",
//             responsive: true,
//           });
//         } else {
//           setTechError("Invalid technical chart data received");
//         }
//       } catch (err) {
//         setError("Error fetching index data.");
//         setTechError("Error fetching technical indicators.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChartData();
//   }, [ticker, selectedTimeframe]);

//   return (
//     <div className="flex flex-col w-full bg-black p-6 rounded-lg shadow-md text-white">
//       {/* Timeframe Selection */}
//       <div className="flex justify-end space-x-4 mb-4">
//         <label className="text-gray-300 text-sm">Timeframe:</label>
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

//       {/* Index Price Chart */}
//       <div className="w-full flex flex-col">
//         <h2 className="text-lg font-semibold mb-2">Index Price Chart</h2>
//         {loading ? (
//           <p className="text-gray-500">Loading...</p>
//         ) : error ? (
//           <p className="text-red-400">{error}</p>
//         ) : (
//           chartData && chartLayout && (
//             <div className="w-full">
//               <Plot data={chartData} layout={chartLayout} />
//             </div>
//           )
//         )}
//       </div>

//       {/* Technical Indicators Chart */}
//       <div className="w-full flex flex-col mt-6">
//         <h2 className="text-lg font-semibold mb-2">Technical Analysis</h2>
//         {loading ? (
//           <p className="text-gray-500">Loading...</p>
//         ) : techError ? (
//           <p className="text-red-400">{techError}</p>
//         ) : (
//           technicalData && technicalLayout && (
//             <div className="w-full">
//               <Plot data={technicalData} layout={technicalLayout} />
//             </div>
//           )
//         )}
//       </div>
//     </div>
//   );
// };

// export default IndicesChart;




"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const IndicesChart = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "^NSEI"; // Default to Nifty 50
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
        const response = await fetch(`http://127.0.0.1:8000/api/indices_chart/${ticker}/`);
        if (!response.ok) throw new Error("Failed to fetch stock chart data");
        const data = await response.json();

        // Handle Stock Chart Data
        if (data.index_chart && data.index_chart[selectedTimeframe]) {
          setChartData(data.index_chart[selectedTimeframe].data);
          setChartLayout({
            ...data.index_chart[selectedTimeframe].layout,
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

export default IndicesChart;
