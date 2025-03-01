// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const Financials = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [financials, setFinancials] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`/api/fundamentals/${ticker}/`)  // ✅ Added trailing slash
//       .then((res) => {
//         if (!res.ok) throw new Error(`API Request Failed: ${res.status}`);
//         return res.json();
//       })
//       .then((data) => {
//         setFinancials(data.financials);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("❌ Error fetching financials:", err);
//         setError("Failed to load financial data.");
//         setLoading(false);
//       });
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-2xl font-bold">Financials - {ticker}</h1>

//       {loading && <p>Loading financial data...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {financials && (
//         <div className="mt-4">
//           <h2 className="text-xl">Yearly Financials</h2>
//           <pre className="bg-gray-800 p-4 overflow-x-auto">
//             {JSON.stringify(financials.yearly, null, 2)}
//           </pre>
//           <h2 className="text-xl mt-4">Quarterly Financials</h2>
//           <pre className="bg-gray-800 p-4 overflow-x-auto">
//             {JSON.stringify(financials.quarterly, null, 2)}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Financials;

// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const Financials = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [financials, setFinancials] = useState({ yearly: {}, quarterly: {} });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let isMounted = true; // Prevents state updates on unmounted component

//     const fetchFundamentals = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:8000/api/fundamentals/${ticker}/`);
//         if (!response.ok) {
//           throw new Error(`Failed to fetch fundamentals: ${response.status} ${response.statusText}`);
//         }
//         const data = await response.json();

//         if (data.error) {
//           throw new Error(`API Error: ${data.error}`);
//         }

//         if (isMounted) {
//           setFinancials(data.financials || { yearly: {}, quarterly: {} });
//           setLoading(false);
//         }
//       } catch (err) {
//         console.error("❌ Error fetching fundamentals:", err);
//         if (isMounted) {
//           setError(err.message);
//           setLoading(false);
//         }
//       }
//     };

//     fetchFundamentals();

//     return () => {
//       isMounted = false; // Cleanup function to prevent memory leaks
//     };
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-2xl font-bold">Financials - {ticker}</h1>

//       {loading && <p>Loading financial data...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {Object.keys(financials.yearly).length > 0 || Object.keys(financials.quarterly).length > 0 ? (
//         <div className="mt-4">
//           <h2 className="text-xl">Yearly Financials</h2>
//           <pre className="bg-gray-800 p-4 overflow-x-auto">
//             {JSON.stringify(financials.yearly, null, 2)}
//           </pre>
//           <h2 className="text-xl mt-4">Quarterly Financials</h2>
//           <pre className="bg-gray-800 p-4 overflow-x-auto">
//             {JSON.stringify(financials.quarterly, null, 2)}
//           </pre>
//         </div>
//       ) : (
//         !loading && <p>No financial data available.</p>
//       )}
//     </div>
//   );
// };

// export default Financials;

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/Loaders/loader"; // ✅ Loader Component
import { AiOutlineBarChart, AiOutlineStock, AiOutlineFund, AiOutlineRise, AiOutlineFall } from "react-icons/ai"; // ✅ Icons
import { Pie, Line } from "react-chartjs-2"; // ✅ Charts
import Chart from "chart.js/auto";

const Financials = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT";

  const [financials, setFinancials] = useState({ yearly: {}, quarterly: {} });
  const [overview, setOverview] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevents state updates on unmounted component

    const fetchFundamentals = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/fundamentals_fin/${ticker}/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch fundamentals: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (data.error) {
          throw new Error(`API Error: ${data.error}`);
        }

        if (isMounted) {
          setFinancials(data.financials || { yearly: {}, quarterly: {} });
          setOverview(data.overview || {});
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching fundamentals:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchFundamentals();

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
  }, [ticker]);

  // ✅ Extract financial values for charts
  const revenueData = financials?.yearly
    ? Object.entries(financials.yearly).map(([year, values]) => ({
        year,
        revenue: values?.["Total Revenue"] || 0,
      }))
    : [];

  const revenueChartData = {
    labels: revenueData.map((d) => d.year),
    datasets: [
      {
        label: "Total Revenue (₹)",
        data: revenueData.map((d) => d.revenue),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const marketData = {
    labels: ["Market Cap", "P/E Ratio", "P/B Ratio", "ROE", "Debt/Equity"],
    datasets: [
      {
        label: "Market Metrics",
        data: [
          overview?.market_cap || 0,
          overview?.pe_ratio || 0,
          overview?.pb_ratio || 0,
          overview?.roe || 0,
          overview?.debt_to_equity || 0,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF5733"],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-2xl font-bold flex items-center">
        <AiOutlineStock className="mr-2 text-yellow-400" />
        Financials - {ticker}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <Loader />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* 🔹 Stock Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 bg-gray-900 rounded-lg shadow-lg flex items-center">
              <AiOutlineFund className="text-3xl text-blue-400 mr-3" />
              <div>
                <h2 className="text-lg font-semibold">Company</h2>
                <p className="text-2xl font-bold text-gray-300">{overview?.name || "N/A"}</p>
                <p className="text-gray-500">{overview?.sector || "N/A"} | {overview?.industry || "N/A"}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg shadow-lg flex items-center">
              <AiOutlineRise className="text-3xl text-green-400 mr-3" />
              <div>
                <h2 className="text-lg font-semibold">52W High</h2>
                <p className="text-2xl font-bold text-green-400">
                  ₹{overview?.["52w_high"]?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg shadow-lg flex items-center">
              <AiOutlineFall className="text-3xl text-red-400 mr-3" />
              <div>
                <h2 className="text-lg font-semibold">52W Low</h2>
                <p className="text-2xl font-bold text-red-400">
                  ₹{overview?.["52w_low"]?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* 🔹 Financial Metrics & Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* ✅ Revenue Growth Chart */}
            <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-3">📈 Revenue Growth</h2>
              <Line data={revenueChartData} />
            </div>

            {/* ✅ Market Metrics Pie Chart */}
            <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-3">📊 Market Data</h2>
              <Pie data={marketData} />
            </div>
          </div>

          {/* 🔹 Yearly & Quarterly Financials */}
          <div className="mt-8 p-6 bg-gray-900 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-3">📅 Yearly & Quarterly Financials</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-left">
                    <th className="py-2">Metric</th>
                    <th>Yearly</th>
                    <th>Quarterly</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(financials.yearly).map((key) => (
                    <tr key={key} className="border-b border-gray-800">
                      <td className="py-2 font-bold">{key}</td>
                      <td>{financials.yearly[key]?.toLocaleString() || "N/A"}</td>
                      <td>{financials.quarterly[key]?.toLocaleString() || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Financials;