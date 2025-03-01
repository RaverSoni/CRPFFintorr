// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const Technical = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [technicalData, setTechnicalData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let isMounted = true;
//     const fetchTechnicalData = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/api/technicals/${ticker}/`);
//         if (!response.ok) {
//           throw new Error(`Failed to fetch technical data: ${response.status} ${response.statusText}`);
//         }
//         const data = await response.json();

//         if (isMounted) {
//           setTechnicalData(data || null);
//           setLoading(false);
//         }
//       } catch (err) {
//         console.error("❌ Error fetching technical data:", err);
//         if (isMounted) {
//           setError(err.message);
//           setLoading(false);
//         }
//       }
//     };

//     fetchTechnicalData();

//     return () => {
//       isMounted = false;
//     };
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-2xl font-bold">Technical Indicators - {ticker}</h1>
//       {loading && <p>Loading technical data...</p>}
//       {error && <p className="text-red-500">{error}</p>}
//       {technicalData ? (
//         <div className="mt-4 space-y-2">
//           <p>RSI (14): {technicalData.oscillators?.RSI}</p>
//           <p>50-day SMA: {technicalData.moving_averages?.SMA_50}</p>
//           <p>200-day SMA: {technicalData.moving_averages?.SMA_200}</p>
//           <p>MACD: {technicalData.oscillators?.MACD}</p>
//           <p>Bollinger Bands: {technicalData.volatility?.Bollinger_Upper} - {technicalData.volatility?.Bollinger_Lower}</p>
//         </div>
//       ) : (
//         !loading && <p>No technical data available.</p>
//       )}
//     </div>
//   );
// };

// export default Technical;

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  AiOutlineStock,
  AiOutlineLineChart,
  AiOutlineRise,
  AiOutlineFall,
} from "react-icons/ai";

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Technical = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT";

  const [technicalData, setTechnicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTechnicalData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/technicals/${ticker}/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch technical data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (isMounted) {
          setTechnicalData(data || null);
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching technical data:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchTechnicalData();

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

  // ✅ Extract technical indicators safely
  const {
    moving_averages = {},
    oscillators = {},
    volatility = {},
    trend_analysis = {},
  } = technicalData || {};

  const rsi = oscillators?.RSI || "N/A";
  const sma50 = moving_averages?.SMA_50 || "N/A";
  const sma200 = moving_averages?.SMA_200 || "N/A";
  const macd = oscillators?.MACD || "N/A";
  const bollingerUpper = volatility?.Bollinger_Upper || "N/A";
  const bollingerLower = volatility?.Bollinger_Lower || "N/A";
  const atr = volatility?.ATR || "N/A";
  const obv = trend_analysis?.OBV || "N/A";
  const adx = trend_analysis?.ADX || "N/A";

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-3xl font-bold flex items-center">
        <AiOutlineStock className="mr-2 text-yellow-400" />
        Technical Indicators - {ticker}
      </h1>

      {/* 📊 Technical Indicator Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">📈 RSI (14)</h2>
          <p className={`text-2xl font-bold ${rsi > 70 ? "text-red-400" : rsi < 30 ? "text-green-400" : "text-yellow-400"}`}>
            {rsi}
          </p>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">📊 MACD</h2>
          <p className={`text-2xl font-bold ${macd > 0 ? "text-green-400" : "text-red-400"}`}>{macd}</p>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">📌 SMA 50</h2>
          <p className="text-2xl font-bold">{sma50}</p>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">📌 SMA 200</h2>
          <p className="text-2xl font-bold">{sma200}</p>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">📈 ADX</h2>
          <p className="text-2xl font-bold">{adx}</p>
        </div>
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">📊 ATR</h2>
          <p className="text-2xl font-bold">{atr}</p>
        </div>
      </div>

      {/* 📌 Bollinger Bands */}
      <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">📉 Bollinger Bands</h2>
        <p className="text-2xl font-bold">
          {bollingerLower} - {bollingerUpper}
        </p>
      </div>

      {/* 📈 RSI Line Chart */}
      <div className="mt-6 bg-gray-900 p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold flex items-center">
          <AiOutlineLineChart className="mr-2 text-blue-400" /> RSI Over Time
        </h2>
        <Line
          data={{
            labels: Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`),
            datasets: [
              {
                label: "RSI",
                data: Array.from({ length: 14 }, () => Math.floor(Math.random() * 100)), // Mock Data
                borderColor: "#FF5733",
                backgroundColor: "rgba(255, 87, 51, 0.2)",
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: "RSI Trend" },
            },
          }}
        />
      </div>

      {/* 📈 MACD Line Chart */}
      <div className="mt-6 bg-gray-900 p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold flex items-center">
          <AiOutlineRise className="mr-2 text-green-400" /> MACD & Signal Line
        </h2>
        <Line
          data={{
            labels: Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`),
            datasets: [
              {
                label: "MACD",
                data: Array.from({ length: 14 }, () => Math.random() * 2 - 1), // Mock Data
                borderColor: "#00FF7F",
                backgroundColor: "rgba(0, 255, 127, 0.2)",
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: "MACD Trend" },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Technical;