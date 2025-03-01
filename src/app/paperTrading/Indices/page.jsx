// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// const BASE_URL = "http://127.0.0.1:8000"; // ✅ Ensure correct backend URL

// const Indices = () => {
//     const [indices, setIndices] = useState({ indian: [], global: [] });
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState("indian"); // Default: Indian Indices
//     const router = useRouter();

//     useEffect(() => {
//         fetchIndices();
//     }, []);

//     const fetchIndices = async () => {
//         setLoading(true);
//         try {
//             console.log("🔄 Fetching Indices...");
//             const response = await fetch(`${BASE_URL}/api/indices/`);
//             if (!response.ok) throw new Error("Failed to fetch indices data");

//             const data = await response.json();
//             console.log("✅ Data Received:", data);
//             setIndices({
//                 indian: data.indian_indices || [],
//                 global: data.global_indices || []
//             });
//             setError(null);
//         } catch (err) {
//             console.error("⚠️ API Fetch Error:", err);
//             setError("Failed to load indices data. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (error) return (
//         <div className="flex flex-col items-center justify-center text-red-500 h-screen bg-black">
//             <h2 className="text-xl font-semibold">⚠️ {error}</h2>
//             <button
//                 onClick={fetchIndices}
//                 className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
//             >
//                 Retry 🔄
//             </button>
//         </div>
//     );

//     if (loading) return (
//         <div className="flex items-center justify-center text-white h-screen bg-black">
//             <h2 className="text-xl font-semibold">⏳ Loading Indices...</h2>
//         </div>
//     );

//     return (
//         <div className="bg-black text-white min-h-screen p-6">
//             <h2 className="text-3xl font-bold mb-6 text-center">📊 Market Indices</h2>

//             {/* Tabs */}
//             <div className="flex justify-center mb-6">
//                 {["indian", "global"].map((tab) => (
//                     <button
//                         key={tab}
//                         className={`mx-4 px-6 py-2 text-lg font-semibold rounded-lg ${
//                             activeTab === tab
//                                 ? "bg-blue-600 text-white"
//                                 : "bg-gray-800 text-gray-400 hover:bg-gray-700"
//                         }`}
//                         onClick={() => setActiveTab(tab)}
//                     >
//                         {tab === "indian" ? "🇮🇳 Indian Indices" : "🌍 Global Indices"}
//                     </button>
//                 ))}
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//                 <table className="w-full border border-gray-700 rounded-lg shadow-md">
//                     <thead className="bg-gray-900">
//                         <tr>
//                             <th className="px-4 py-3 text-left">Index Name</th>
//                             <th className="px-4 py-3 text-right">Last Traded</th>
//                             <th className="px-4 py-3 text-right">Day Change</th>
//                             <th className="px-4 py-3 text-right">High</th>
//                             <th className="px-4 py-3 text-right">Low</th>
//                             <th className="px-4 py-3 text-right">Open</th>
//                             <th className="px-4 py-3 text-right">Prev. Close</th>
//                             <th className="px-4 py-3 text-right">Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {indices[activeTab].map((index, idx) => (
//                             <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800">
//                                 <td className="px-4 py-3">{index.symbol}</td>
//                                 <td className="px-4 py-3 text-right font-semibold">
//                                     ₹{index.last_traded.toLocaleString()}
//                                 </td>
//                                 <td className={`px-4 py-3 text-right font-semibold ${
//                                     index.day_change >= 0 ? "text-green-400" : "text-red-400"
//                                 }`}>
//                                     {index.day_change >= 0 ? "🔼" : "🔽"} {index.day_change.toLocaleString()}
//                                 </td>
//                                 <td className="px-4 py-3 text-right">{index.high.toLocaleString()}</td>
//                                 <td className="px-4 py-3 text-right">{index.low.toLocaleString()}</td>
//                                 <td className="px-4 py-3 text-right">{index.open.toLocaleString()}</td>
//                                 <td className="px-4 py-3 text-right">{index.prev_close.toLocaleString()}</td>
//                                 <td className="px-4 py-3 text-right">
//                                     <button
//                                         onClick={() => router.push(`/app/paperTrading/TradingPage?ticker=${index.symbol}`)}
//                                         className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-md"
//                                     >
//                                         📊 Trade
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default Indices;

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = "http://127.0.0.1:8000"; // ✅ Ensure correct backend URL

const Indices = () => {
    const [indices, setIndices] = useState({ indian: [], global: [] });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("indian"); // Default: Indian Indices
    const router = useRouter();

    useEffect(() => {
        fetchIndices();
    }, []);

    const fetchIndices = async () => {
        setLoading(true);
        try {
            console.log("🔄 Fetching Indices...");
            const response = await fetch(`${BASE_URL}/api/indices/`);
            if (!response.ok) throw new Error("Failed to fetch indices data");

            const data = await response.json();
            console.log("✅ Data Received:", data);
            setIndices({
                indian: data.indian_indices || [],
                global: data.global_indices || []
            });
            setError(null);
        } catch (err) {
            console.error("⚠️ API Fetch Error:", err);
            setError("Failed to load indices data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (error) return (
        <div className="flex flex-col items-center justify-center text-red-500 h-screen bg-black">
            <h2 className="text-xl font-semibold">⚠️ {error}</h2>
            <button
                onClick={fetchIndices}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
            >
                Retry 🔄
            </button>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center text-white h-screen bg-black">
            <h2 className="text-xl font-semibold">⏳ Loading Indices...</h2>
        </div>
    );

    return (
        <div className="bg-black text-white min-h-screen p-6">
            <h2 className="text-3xl font-bold mb-6 text-center">📊 Market Indices</h2>

            {/* Tabs */}
            <div className="flex justify-center mb-6">
                {["indian", "global"].map((tab) => (
                    <button
                        key={tab}
                        className={`mx-4 px-6 py-2 text-lg font-semibold rounded-lg ${
                            activeTab === tab
                                ? "bg-blue-600 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === "indian" ? "🇮🇳 Indian Indices" : "🌍 Global Indices"}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-700 rounded-lg shadow-md">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left">Index Name</th>
                            <th className="px-4 py-3 text-right">Last Traded</th>
                            <th className="px-4 py-3 text-right">Day Change</th>
                            <th className="px-4 py-3 text-right">% Change</th>
                            <th className="px-4 py-3 text-right">High</th>
                            <th className="px-4 py-3 text-right">Low</th>
                            <th className="px-4 py-3 text-right">Open</th>
                            <th className="px-4 py-3 text-right">Prev. Close</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {indices[activeTab].map((index, idx) => {
                            // Calculate Percentage Change
                            const percentageChange =
                                index.open !== 0
                                    ? ((index.day_change / index.open) * 100).toFixed(2)
                                    : "N/A";

                            return (
                                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="px-4 py-3">{index.symbol}</td>
                                    <td className="px-4 py-3 text-right font-semibold">
                                        ₹{index.last_traded.toLocaleString()}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-semibold ${
                                        index.day_change >= 0 ? "text-green-400" : "text-red-400"
                                    }`}>
                                        {index.day_change >= 0 ? "🔼" : "🔽"} {index.day_change.toLocaleString()}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-semibold ${
                                        percentageChange !== "N/A" && percentageChange >= 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                    }`}>
                                        {percentageChange !== "N/A" ? `${percentageChange}%` : "N/A"}
                                    </td>
                                    <td className="px-4 py-3 text-right">{index.high.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">{index.low.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">{index.open.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">{index.prev_close.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => router.push(`/paperTrading/IndicesPage?ticker=${index.symbol}`)}
                                      className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-md transition duration-200"
                                    >
                                      Trade Index
                                    </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Indices;
