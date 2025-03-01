// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { Bar } from "react-chartjs-2";

// const Revenue = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [revenueData, setRevenueData] = useState({});
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`/api/fundamentals/${ticker}/`)  // ✅ Added trailing slash
//       .then((res) => {
//         if (!res.ok) throw new Error(`API Request Failed: ${res.status}`);
//         return res.json();
//       })
//       .then((data) => {
//         setRevenueData(data.revenue);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("❌ Error fetching revenue data:", err);
//         setError("Failed to load revenue data.");
//         setLoading(false);
//       });
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-2xl font-bold">Revenue - {ticker}</h1>

//       {loading && <p>Loading revenue data...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {Object.keys(revenueData).length > 0 && (
//         <Bar
//           data={{
//             labels: Object.keys(revenueData),
//             datasets: [
//               {
//                 label: "Revenue",
//                 data: Object.values(revenueData),
//                 backgroundColor: "rgba(0, 200, 0, 0.7)",
//               },
//             ],
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default Revenue;

// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
// import { Bar } from "react-chartjs-2";

// // ✅ Register required Chart.js modules
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const Revenue = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [revenueData, setRevenueData] = useState({});
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
//           setRevenueData(data.revenue ?? {});
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
//       <h1 className="text-2xl font-bold">Revenue - {ticker}</h1>

//       {loading && <p>Loading revenue data...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {Object.keys(revenueData).length > 0 ? (
//         <Bar
//           data={{
//             labels: Object.keys(revenueData),
//             datasets: [
//               {
//                 label: "Revenue",
//                 data: Object.values(revenueData),
//                 backgroundColor: "rgba(0, 200, 0, 0.7)",
//               },
//             ],
//           }}
//           options={{
//             responsive: true,
//             plugins: {
//               legend: {
//                 display: true,
//               },
//               title: {
//                 display: true,
//                 text: "Revenue Chart",
//               },
//             },
//           }}
//         />
//       ) : (
//         !loading && <p>No revenue data available.</p>
//       )}
//     </div>
//   );
// };

// export default Revenue;

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bar, Pie } from "react-chartjs-2"; // ✅ Chart.js for visualization
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
import { AiOutlineFund, AiOutlineRise } from "react-icons/ai"; // ✅ Icons for better readability

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Revenue = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT";

  const [revenueData, setRevenueData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRevenueData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/fundamentals/${ticker}/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch revenue data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (data.error) {
          throw new Error(`API Error: ${data.error}`);
        }

        if (isMounted) {
          setRevenueData(data.revenue ?? {});
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching revenue data:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchRevenueData();

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

  const revenueKeys = Object.keys(revenueData);
  const revenueValues = Object.values(revenueData);

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-3xl font-bold flex items-center">
        <AiOutlineFund className="mr-2 text-blue-400" />
        Revenue Overview - {ticker}
      </h1>

      {/* 📊 Charts Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 📌 Bar Chart for Revenue Trends */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineRise className="mr-2 text-green-400" /> Revenue Trends
          </h2>
          <Bar
            data={{
              labels: revenueKeys,
              datasets: [
                {
                  label: "Revenue (in ₹)",
                  data: revenueValues,
                  backgroundColor: "rgba(0, 200, 0, 0.7)",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true },
                title: { display: true, text: "Revenue Growth Over Time" },
              },
            }}
          />
        </div>

        {/* 📌 Pie Chart for Revenue Distribution */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            💰 Revenue Distribution
          </h2>
          <Pie
            data={{
              labels: revenueKeys.slice(0, 5), // Show top 5 revenue periods
              datasets: [
                {
                  label: "Revenue Share",
                  data: revenueValues.slice(0, 5),
                  backgroundColor: ["#FF5733", "#C70039", "#900C3F", "#00C49F", "#FFBB28"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true },
                title: { display: true, text: "Top Revenue Periods" },
              },
            }}
          />
        </div>
      </div>

      {/* 📌 Revenue Data Table */}
      <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">📅 Revenue Breakdown</h2>
        {revenueKeys.length === 0 ? (
          <p className="text-gray-400">No revenue data available.</p>
        ) : (
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="py-2">📆 Year</th>
                <th className="py-2">💵 Revenue (₹)</th>
              </tr>
            </thead>
            <tbody>
              {revenueKeys.map((year, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="py-2 font-bold">{year}</td>
                  <td className="py-2">{revenueValues[index]?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Revenue;