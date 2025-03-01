// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const Strategies = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [strategies, setStrategies] = useState([]);
//   const [strategyResults, setStrategyResults] = useState([]);
//   const [backtestRange, setBacktestRange] = useState("");
//   const [chart, setChart] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let isMounted = true;
//     const fetchStrategies = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/api/strategies/${ticker}/`);
//         if (!response.ok) {
//           throw new Error(`Failed to fetch strategy data: ${response.status} ${response.statusText}`);
//         }
//         const data = await response.json();

//         if (isMounted) {
//           setStrategies(data.popular_strategies || []);
//           setStrategyResults(data.strategy_results || []);
//           setBacktestRange(data.backtest_range || "N/A");
//           setChart(data.chart || null);
//           setLoading(false);
//         }
//       } catch (err) {
//         console.error("❌ Error fetching strategy data:", err);
//         if (isMounted) {
//           setError(err.message);
//           setLoading(false);
//         }
//       }
//     };

//     fetchStrategies();
//     return () => {
//       isMounted = false;
//     };
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-3xl font-bold mb-4">📊 Trading Strategies</h1>
//       <p className="text-sm text-gray-400 mb-4">Backtest Range: {backtestRange}</p>

//       {loading && <p className="text-gray-300">🔄 Loading strategy data...</p>}
//       {error && <p className="text-red-500">⚠️ {error}</p>}

//       {/* Strategy Insights Section */}
//       {strategies.length > 0 ? (
//         <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-6">
//           <h2 className="text-lg font-semibold text-blue-400 mb-2">📌 Identified Strategies</h2>
//           <ul className="space-y-2">
//             {strategies.map((strategy, index) => (
//               <li key={index} className="p-2 bg-gray-800 rounded-md">
//                 <p className="text-white">{strategy.name} <span className="text-gray-400">({strategy.timeframe})</span></p>
//               </li>
//             ))}
//           </ul>
//         </div>
//       ) : (
//         !loading && <p className="text-gray-300">No trading strategies identified.</p>
//       )}

//       {/* Strategy Performance Section */}
//       {strategyResults.length > 0 ? (
//         <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-6">
//           <h2 className="text-lg font-semibold text-green-400 mb-2">📈 Strategy Performance</h2>
//           <ul className="space-y-3">
//             {strategyResults.map((result, index) => (
//               <li key={index} className="p-3 bg-gray-800 rounded-md flex justify-between items-center">
//                 <div>
//                   <p className="text-lg">{result.symbol}</p>
//                   <p className={`text-sm ${result.profit_loss >= 0 ? "text-green-400" : "text-red-400"}`}>
//                     Profit/Loss: {result.profit_loss} ({result.change_percent}%)
//                   </p>
//                   <p className="text-sm text-gray-400">Win/Loss Ratio: {result.win_loss}</p>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       ) : (
//         !loading && <p className="text-gray-300">No backtest results available.</p>
//       )}

//       {/* Strategy Visualization Chart */}
//       {chart && (
//         <div className="bg-gray-900 p-4 rounded-lg shadow-md">
//           <h2 className="text-lg font-semibold text-yellow-400 mb-2">📉 Strategy Analysis Chart</h2>
//           <img src={`data:image/png;base64,${chart}`} alt="Strategy Chart" className="w-full rounded-lg" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Strategies;

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  AiOutlineFundProjectionScreen,
  AiOutlineBarChart,
  AiOutlinePieChart,
  AiOutlineClockCircle,
  AiOutlineLineChart,
} from "react-icons/ai";

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Strategies = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT";

  const [strategies, setStrategies] = useState([]);
  const [strategyResults, setStrategyResults] = useState([]);
  const [backtestRange, setBacktestRange] = useState("");
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStrategies = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/strategies/${ticker}/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch strategy data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (isMounted) {
          setStrategies(data.popular_strategies || []);
          setStrategyResults(data.strategy_results || []);
          setBacktestRange(data.backtest_range || "N/A");
          setChart(data.chart || null);
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching strategy data:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchStrategies();
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
      <h1 className="text-3xl font-bold flex items-center">
        <AiOutlineFundProjectionScreen className="mr-2 text-yellow-400" />
        Trading Strategies
      </h1>
      <p className="text-sm text-gray-400 flex items-center mt-2">
        <AiOutlineClockCircle className="mr-1 text-blue-400" /> Backtest Range: {backtestRange}
      </p>

      {/* 🔹 Identified Strategies */}
      {strategies.length > 0 && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-blue-400 mb-2">📌 Identified Strategies</h2>
          <ul className="space-y-2">
            {strategies.map((strategy, index) => (
              <li key={index} className="p-2 bg-gray-800 rounded-md">
                <p className="text-white">{strategy.name} <span className="text-gray-400">({strategy.timeframe})</span></p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔹 Strategy Performance */}
      {strategyResults.length > 0 && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-green-400 mb-2">📈 Strategy Performance</h2>
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="py-2">📌 Symbol</th>
                <th className="py-2">💰 Profit/Loss (₹)</th>
                <th className="py-2">📊 % Change</th>
                <th className="py-2">⚖️ Win/Loss Ratio</th>
              </tr>
            </thead>
            <tbody>
              {strategyResults.map((result, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="py-2 font-bold">{result.symbol}</td>
                  <td className={`py-2 ${result.profit_loss >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ₹{result.profit_loss.toLocaleString()}
                  </td>
                  <td className={`py-2 ${result.change_percent > 0 ? "text-green-400" : "text-red-400"}`}>
                    {result.change_percent > 0 ? "▲" : "▼"} {result.change_percent}%
                  </td>
                  <td className="py-2">{result.win_loss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔹 Strategy Performance Bar Chart */}
      {strategyResults.length > 0 && (
        <div className="mt-6 bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineBarChart className="mr-2 text-green-400" /> Strategy Profitability
          </h2>
          <Bar
            data={{
              labels: strategyResults.map((result) => result.symbol),
              datasets: [
                {
                  label: "Profit/Loss (₹)",
                  data: strategyResults.map((result) => result.profit_loss),
                  backgroundColor: strategyResults.map((result) =>
                    result.profit_loss > 0 ? "rgba(0, 255, 127, 0.7)" : "rgba(255, 87, 51, 0.7)"
                  ),
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: "Strategy Profit/Loss" },
              },
            }}
          />
        </div>
      )}

      {/* 🔹 Win/Loss Ratio Pie Chart */}
      {strategyResults.length > 0 && (
        <div className="mt-6 bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlinePieChart className="mr-2 text-yellow-400" /> Win/Loss Distribution
          </h2>
          <Pie
            data={{
              labels: ["Wins", "Losses"],
              datasets: [
                {
                  label: "Win/Loss Ratio",
                  data: [
                    strategyResults.reduce((acc, result) => acc + (result.win_loss.split(":")[0] * 1), 0),
                    strategyResults.reduce((acc, result) => acc + (result.win_loss.split(":")[1] * 1), 0),
                  ],
                  backgroundColor: ["#00FF7F", "#FF5733"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true },
                title: { display: true, text: "Win/Loss Ratio Distribution" },
              },
            }}
          />
        </div>
      )}

      {/* 🔹 Strategy Visualization Chart */}
      {chart && (
        <div className="mt-6 bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineLineChart className="mr-2 text-blue-400" /> Strategy Analysis Chart
          </h2>
          <img src={`data:image/png;base64,${chart}`} alt="Strategy Chart" className="w-full rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default Strategies;