// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const Overview = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT"; // Default to MSFT

//   const [overview, setOverview] = useState(null);

//   useEffect(() => {
//     fetch(`/api/fundamentals?ticker=${ticker}`)
//       .then((res) => res.json())
//       .then((data) => setOverview(data.overview));
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-2xl font-bold">Overview - {ticker}</h1>
//       {overview ? (
//         <div className="mt-4 space-y-2">
//           <p>Sector: {overview.sector}</p>
//           <p>Industry: {overview.industry}</p>
//           <p>Market Cap: ₹{overview.market_cap}</p>
//           <p>P/E Ratio: {overview.pe_ratio}</p>
//           <p>P/B Ratio: {overview.pb_ratio}</p>
//           <p>Dividend Yield: {overview.div_yield}%</p>
//           <p>ROE: {overview.roe}%</p>
//           <p>52W Range: ₹{overview["52w_low"]} - ₹{overview["52w_high"]}</p>
//         </div>
//       ) : (
//         <p>Loading data...</p>
//       )}
//     </div>
//   );
// };

// export default Overview;

// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const Overview = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [overview, setOverview] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`/api/fundamentals/${ticker}/`)  // ✅ Added trailing slash
//       .then((res) => {
//         if (!res.ok) throw new Error(`API Request Failed: ${res.status}`);
//         return res.json();
//       })
//       .then((data) => {
//         setOverview(data.overview);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("❌ Error fetching overview:", err);
//         setError("Failed to load overview data.");
//         setLoading(false);
//       });
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-2xl font-bold">Overview - {ticker}</h1>

//       {loading && <p>Loading overview data...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {overview && (
//         <div className="mt-4 space-y-2">
//           <p>Sector: {overview.sector || "N/A"}</p>
//           <p>Industry: {overview.industry || "N/A"}</p>
//           <p>Market Cap: ₹{overview.market_cap?.toLocaleString() || "N/A"}</p>
//           <p>P/E Ratio: {overview.pe_ratio || "N/A"}</p>
//           <p>Dividend Yield: {overview.div_yield ? `${overview.div_yield}%` : "N/A"}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Overview;

// working
// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const Overview = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [overview, setOverview] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchFundamentals = async () => {
//         try {
//             const response = await fetch(`http://127.0.0.1:8000/api/fundamentals/${ticker}/`);
//             if (!response.ok) {
//                 throw new Error(`Failed to fetch fundamentals: ${response.status} ${response.statusText}`);
//             }
//             const data = await response.json();

//             if (data.error) {
//                 throw new Error(`API Error: ${data.error}`);
//             }

//             setOverview(data.overview || {});
//             setLoading(false);
//         } catch (err) {
//             console.error("❌ Error fetching fundamentals:", err);
//             setError(err.message);
//             setLoading(false);
//         }
//     };

//     fetchFundamentals();
// }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-2xl font-bold">Overview - {ticker}</h1>

//       {loading && <p>Loading overview data...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {overview && (
//         <div className="mt-4 space-y-2">
//           <p>Sector: {overview.sector || "N/A"}</p>
//           <p>Industry: {overview.industry || "N/A"}</p>
//           <p>Market Cap: ₹{overview.market_cap?.toLocaleString() || "N/A"}</p>
//           <p>P/E Ratio: {overview.pe_ratio || "N/A"}</p>
//           <p>Dividend Yield: {overview.div_yield ? `${overview.div_yield}%` : "N/A"}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Overview;

// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const Overview = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   // ✅ Rename to avoid conflicts
//   const [overviewData, setOverviewData] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchFundamentals = async () => {
//         try {
//             const response = await fetch(`http://127.0.0.1:8000/api/fundamentals/${ticker}/`);
//             if (!response.ok) {
//                 throw new Error(`Failed to fetch fundamentals: ${response.status} ${response.statusText}`);
//             }
//             const data = await response.json();

//             setOverviewData(data.overview || {});
//             setLoading(false);
//         } catch (err) {
//             console.error("❌ Error fetching fundamentals:", err);
//             setError(err.message);
//             setLoading(false);
//         }
//     };

//     fetchFundamentals();
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-2xl font-bold">Overview - {ticker}</h1>

//       {loading && <p>Loading overview data...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {overviewData && (
//         <div className="mt-4 space-y-2">
//           <p>Sector: {overviewData.sector || "N/A"}</p>
//           <p>Industry: {overviewData.industry || "N/A"}</p>
//           <p>Market Cap: ₹{overviewData.market_cap?.toLocaleString() || "N/A"}</p>
//           <p>P/E Ratio: {overviewData.pe_ratio || "N/A"}</p>
//           <p>Dividend Yield: {overviewData.div_yield ? `${overviewData.div_yield}%` : "N/A"}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Overview;

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/Loaders/loader"; // ✅ Loader Component
import { Pie, Bar } from "react-chartjs-2"; // ✅ Chart.js for visualization
import { AiOutlineBank, AiOutlineStock, AiOutlineFund } from "react-icons/ai"; // ✅ Icons for better readability

const Overview = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT";

  const [overviewData, setOverviewData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFundamentals = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/fundamentals/${ticker}/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch fundamentals: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        setOverviewData(data.overview || {});
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching fundamentals:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFundamentals();
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">⚠️ {error}</p>;
  }

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-3xl font-bold flex items-center">
        <AiOutlineStock className="mr-2 text-blue-400" />
        {overviewData.name || ticker}
      </h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ✅ Company Details */}
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineBank className="mr-2 text-yellow-400" /> Sector & Industry
          </h2>
          <p className="text-gray-400">Sector: {overviewData.sector || "N/A"}</p>
          <p className="text-gray-400">Industry: {overviewData.industry || "N/A"}</p>
        </div>

        {/* ✅ Market Cap & P/E Ratio */}
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineFund className="mr-2 text-green-400" /> Market Data
          </h2>
          <p className="text-gray-400">Market Cap: ₹{overviewData.market_cap?.toLocaleString() || "N/A"}</p>
          <p className="text-gray-400">P/E Ratio: {overviewData.pe_ratio || "N/A"}</p>
        </div>

        {/* ✅ Dividend Yield & ROE */}
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            📈 Key Ratios
          </h2>
          <p className="text-gray-400">Dividend Yield: {overviewData.div_yield ? `${overviewData.div_yield}%` : "N/A"}</p>
          <p className="text-gray-400">Return on Equity (ROE): {overviewData.roe || "N/A"}</p>
          <p className="text-gray-400">Debt to Equity: {overviewData.debt_to_equity || "N/A"}</p>
        </div>
      </div>

      {/* 📊 Charts Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 📌 Pie Chart for Industry Breakdown */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-3">Sector Distribution</h2>
          <Pie
            data={{
              labels: ["Market Cap", "Debt", "Equity"],
              datasets: [
                {
                  data: [
                    overviewData.market_cap || 0,
                    overviewData.debt_to_equity || 0,
                    overviewData.roe || 0,
                  ],
                  backgroundColor: ["#00C49F", "#FFBB28", "#0088FE"],
                },
              ],
            }}
          />
        </div>

        {/* 📌 Bar Chart for Financials */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-3">Key Financials</h2>
          <Bar
            data={{
              labels: ["52W Low", "52W High", "EPS"],
              datasets: [
                {
                  label: "Value",
                  data: [
                    overviewData["52w_low"] || 0,
                    overviewData["52w_high"] || 0,
                    overviewData.eps || 0,
                  ],
                  backgroundColor: ["#FF5733", "#C70039", "#900C3F"],
                },
              ],
            }}
            options={{ responsive: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;