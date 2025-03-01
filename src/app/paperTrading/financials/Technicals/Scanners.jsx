// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const Scanners = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [scannerResults, setScannerResults] = useState([]);
//   const [popularScanners, setPopularScanners] = useState([]);
//   const [lastRun, setLastRun] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let isMounted = true;
//     const fetchScanners = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/api/scanners/${ticker}/`);
//         if (!response.ok) {
//           throw new Error(`Failed to fetch scanner data: ${response.status} ${response.statusText}`);
//         }
//         const data = await response.json();

//         if (isMounted) {
//           setPopularScanners(data.popular_scanners || []);
//           setScannerResults(data.scan_results || []);
//           setLastRun(data.last_run || "N/A");
//           setLoading(false);
//         }
//       } catch (err) {
//         console.error("❌ Error fetching scanner data:", err);
//         if (isMounted) {
//           setError(err.message);
//           setLoading(false);
//         }
//       }
//     };

//     fetchScanners();
//     return () => {
//       isMounted = false;
//     };
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-3xl font-bold mb-4">Stock Scanners</h1>
//       <p className="text-sm text-gray-400 mb-4">Last scan: {lastRun}</p>

//       {loading && <p>Loading scanner data...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {popularScanners.length > 0 && (
//         <div className="mb-6">
//           <h2 className="text-xl font-semibold">Popular Scanners</h2>
//           <ul className="grid grid-cols-2 gap-4 mt-2">
//             {popularScanners.map((scanner, index) => (
//               <li key={index} className="p-3 bg-gray-800 rounded-md">
//                 <p className="text-lg">{scanner.name}</p>
//                 <p className="text-sm text-gray-400">{scanner.timeframe}</p>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {scannerResults.length > 0 ? (
//         <ul className="mt-4 space-y-3">
//           {scannerResults.map((result, index) => (
//             <li key={index} className="p-3 bg-gray-900 rounded-md">
//               <p className="text-lg">{result.symbol}</p>
//               <p className={`text-sm ${result.change_percent > 0 ? "text-green-400" : "text-red-400"}`}>
//                 {result.change_percent}%
//               </p>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         !loading && <p>No scanner data available.</p>
//       )}
//     </div>
//   );
// };

// export default Scanners;

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  AiOutlineStock,
  AiOutlineClockCircle,
  AiOutlineRise,
  AiOutlineFall,
} from "react-icons/ai";

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Scanners = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT";

  const [scannerResults, setScannerResults] = useState([]);
  const [popularScanners, setPopularScanners] = useState([]);
  const [lastRun, setLastRun] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchScanners = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/scanners/${ticker}/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch scanner data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (isMounted) {
          setPopularScanners(data.popular_scanners || []);
          setScannerResults(data.scan_results || []);
          setLastRun(data.last_run || "N/A");
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching scanner data:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchScanners();
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
        <AiOutlineStock className="mr-2 text-yellow-400" />
        Stock Scanners
      </h1>
      <p className="text-sm text-gray-400 flex items-center mt-2">
        <AiOutlineClockCircle className="mr-1 text-blue-400" /> Last scan: {lastRun}
      </p>

      {/* 🔹 Popular Scanners */}
      {popularScanners.length > 0 && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">🚀 Popular Scanners</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {popularScanners.map((scanner, index) => (
              <li key={index} className="p-3 bg-gray-800 rounded-md">
                <p className="text-lg">{scanner.name}</p>
                <p className="text-sm text-gray-400">{scanner.timeframe}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔹 Scanner Results Table */}
      {scannerResults.length > 0 ? (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">📈 Scanner Results</h2>
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="py-2">📌 Symbol</th>
                <th className="py-2">💰 Price (₹)</th>
                <th className="py-2">📊 Change (%)</th>
              </tr>
            </thead>
            <tbody>
              {scannerResults.map((result, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="py-2 font-bold">{result.symbol}</td>
                  <td className="py-2">{result.ltp.toLocaleString()}</td>
                  <td className={`py-2 ${result.change_percent > 0 ? "text-green-400" : "text-red-400"}`}>
                    {result.change_percent > 0 ? "▲" : "▼"} {result.change_percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p className="text-gray-400 mt-4">No scanner data available.</p>
      )}

      {/* 📊 Scanner Data Bar Chart */}
      {scannerResults.length > 0 && (
        <div className="mt-6 bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineRise className="mr-2 text-green-400" /> Stock Performance
          </h2>
          <Bar
            data={{
              labels: scannerResults.map((result) => result.symbol),
              datasets: [
                {
                  label: "Price Change (%)",
                  data: scannerResults.map((result) => result.change_percent),
                  backgroundColor: scannerResults.map((result) =>
                    result.change_percent > 0 ? "rgba(0, 255, 127, 0.7)" : "rgba(255, 87, 51, 0.7)"
                  ),
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: "Stock Movement by Scanner" },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Scanners;