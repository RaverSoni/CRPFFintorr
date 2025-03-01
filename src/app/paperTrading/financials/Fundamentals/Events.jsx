// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const Events = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [events, setEvents] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const response = await fetch(`http://127.0.0.1:8000/api/stock_chart/${ticker}/`);
//     if (!response.ok) throw new Error("Failed to fetch stock chart data");
//       const data = await response.json();
//       .then((res) => {
//         if (!res.ok) throw new Error(`API Request Failed: ${res.status}`);
//         return res.json();
//       })
//       .then((data) => {
//         setEvents(data.events);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("❌ Error fetching events:", err);
//         setError("Failed to load events.");
//         setLoading(false);
//       });
//   }, [ticker]);

//   return (
//     <div className="bg-black text-white p-6">
//       <h1 className="text-2xl font-bold">Events - {ticker}</h1>

//       {loading && <p>Loading events...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {events && (
//         <div className="mt-4">
//           <h2 className="text-xl">Quarterly Results</h2>
//           <pre className="bg-gray-800 p-4 overflow-x-auto">
//             {JSON.stringify(events.quarterly_results, null, 2)}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Events;

// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const Events = () => {
//   const searchParams = useSearchParams();
//   const ticker = searchParams.get("ticker") || "MSFT";

//   const [events, setEvents] = useState(null);
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

//             // ✅ FIX: Use setEvents instead of setOverview
//             setEvents(data.events || {});
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
//       <h1 className="text-2xl font-bold">Events - {ticker}</h1>

//       {loading && <p>Loading events...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {events && (
//         <div className="mt-4">
//           <h2 className="text-xl">Quarterly Results</h2>
//           <pre className="bg-gray-800 p-4 overflow-x-auto">
//             {JSON.stringify(events.quarterly_results, null, 2)}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Events;

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
  AiOutlineCalendar,
  AiOutlineFileText,
  AiOutlineStock,
} from "react-icons/ai"; // ✅ Icons for readability

// ✅ Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Events = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT";

  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/fundamentals/${ticker}/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (data.error) {
          throw new Error(`API Error: ${data.error}`);
        }

        // ✅ Ensure events are properly formatted
        setEvents({
          quarterly_results: data.events?.quarterly_results || {},
          meetings: data.events?.meetings || {},
        });

        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching events:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvents();
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

  const quarterlyResults = events?.quarterly_results || {};
  const meetingEvents = events?.meetings || {};

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-3xl font-bold flex items-center">
        <AiOutlineCalendar className="mr-2 text-yellow-400" />
        Events Overview - {ticker}
      </h1>

      {/* 📊 Events Charts Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 🔹 Bar Chart for Quarterly Earnings */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineStock className="mr-2 text-green-400" /> Quarterly Earnings Trend
          </h2>
          {Object.keys(quarterlyResults).length > 0 ? (
            <Bar
              data={{
                labels: Object.keys(quarterlyResults),
                datasets: [
                  {
                    label: "Quarterly Earnings",
                    data: Object.values(quarterlyResults).map((q) => q?.NetIncome || 0),
                    backgroundColor: "rgba(75, 192, 192, 0.7)",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  title: { display: true, text: "Quarterly Earnings" },
                },
              }}
            />
          ) : (
            <p className="text-gray-400 mt-4">No earnings data available.</p>
          )}
        </div>

        {/* 🔹 Upcoming Meetings */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold flex items-center">
            <AiOutlineFileText className="mr-2 text-blue-400" /> Important Meetings & Events
          </h2>
          {Object.keys(meetingEvents).length > 0 ? (
            <ul className="list-disc mt-3 pl-5">
              {Object.entries(meetingEvents).map(([date, details]) => (
                <li key={date} className="text-white">
                  📆 <span className="text-yellow-300">{date}</span> -{" "}
                  <span className="text-green-400">
                    {typeof details === "object" ? JSON.stringify(details) : details}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mt-4">No upcoming meetings.</p>
          )}
        </div>
      </div>

      {/* 📌 Earnings Table */}
      <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">📅 Earnings Announcements</h2>
        {Object.keys(quarterlyResults).length === 0 ? (
          <p className="text-gray-400">No earnings data available.</p>
        ) : (
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="py-2">📆 Quarter</th>
                <th className="py-2">💰 Revenue (₹)</th>
                <th className="py-2">📈 Net Income (₹)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(quarterlyResults).map((quarter, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="py-2 font-bold">{quarter}</td>
                  <td className="py-2">
                    {quarterlyResults[quarter]?.Revenue
                      ? `₹${quarterlyResults[quarter].Revenue.toLocaleString()}`
                      : "N/A"}
                  </td>
                  <td className="py-2">
                    {quarterlyResults[quarter]?.NetIncome
                      ? `₹${quarterlyResults[quarter].NetIncome.toLocaleString()}`
                      : "N/A"}
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

export default Events;