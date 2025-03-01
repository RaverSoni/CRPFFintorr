// import React from 'react';
// import styles from './LoserBox.module.css';

// const LoserBox = ({ title, content, icon }) => {
//   return (
//     <div className={styles.container}>
//       <div className={styles.box}>
//         <h1 className={styles.title}>{title}</h1>
//         <p className={styles.content}>{content}</p>
//       </div>
//     </div>
//   );
// };

// export default LoserBox;

// "use client";
// import React, { useState, useEffect } from "react";

// const Losers = () => {
//   const [losers, setLosers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchLosers = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/update_gainers_losers/");
//         const data = await response.json();

//         if (data.top_losers && data.top_losers.length > 0) {
//           setLosers([...data.top_losers].sort((a, b) => a.percentage_change - b.percentage_change)); // Sort Losers Correctly
//         } else {
//           setError("No losers found.");
//         }
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchLosers();
//   }, []);

//   return (
//     <div className="bg-gray-900 p-4 rounded-lg shadow-md w-full mt-6">
//       <h2 className="text-lg font-semibold text-red-400">Top Losers</h2>
//       {loading ? (
//         <p className="text-gray-400">Loading...</p>
//       ) : error ? (
//         <p className="text-red-400">{error}</p>
//       ) : (
//         <table className="w-full text-white">
//           <thead>
//             <tr className="border-b border-gray-700">
//               <th className="p-2 text-left">Stock</th>
//               <th className="p-2">Price</th>
//               <th className="p-2">Change</th>
//               <th className="p-2">Change (%)</th>
//               <th className="p-2">PE Ratio</th>
//               <th className="p-2">Day Chart</th>
//             </tr>
//           </thead>
//           <tbody>
//             {losers.map((stock) => (
//               <tr key={stock.symbol} className="border-b border-gray-700">
//                 <td className="p-2">{stock.name} ({stock.symbol})</td>
//                 <td className="p-2">${stock.price ? stock.price.toFixed(2) : "N/A"}</td>
//                 <td className="p-2 text-red-400">{stock.change ? stock.change.toFixed(2) : "N/A"}</td>
//                 <td className="p-2 text-red-400">{stock.percentage_change ? stock.percentage_change.toFixed(2) : "N/A"}%</td>
//                 <td className="p-2">{typeof stock.pe_ratio === "number" ? stock.pe_ratio.toFixed(2) : "N/A"}</td>
//                 <td><img src={stock.dayChart} alt="Graph" className="w-16 h-10" /></td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Losers;

"use client";
import React, { useState, useEffect } from "react";
import Loader from "@/components/Loaders/loader"; // ✅ Import Loader
import { AiOutlineArrowDown, AiOutlineStock } from "react-icons/ai"; // ✅ Icons

const Losers = () => {
  const [losers, setLosers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLosers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/update_gainers_losers/");
        const data = await response.json();

        if (data.top_losers && data.top_losers.length > 0) {
          setLosers([...data.top_losers].sort((a, b) => a.percentage_change - b.percentage_change));
        } else {
          setError("⚠️ No losers found.");
        }
      } catch (err) {
        setError("❌ Failed to fetch data. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLosers();
  }, []);

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full mt-6">
      <h2 className="text-xl font-semibold text-red-400 flex items-center">
        <AiOutlineArrowDown className="mr-2 text-red-300" /> Top Losers
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader /> {/* ✅ Show loader while fetching */}
        </div>
      ) : error ? (
        <p className="text-red-400 text-center mt-3">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-white mt-3">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800">
                <th className="p-2 text-left">📉 Stock</th>
                <th className="p-2">💰 Price</th>
                <th className="p-2">🔻 Change</th>
                <th className="p-2">📊 Change (%)</th>
                <th className="p-2">📉 PE Ratio</th>
                <th className="p-2">📈 Day Chart</th>
              </tr>
            </thead>
            <tbody>
              {losers.map((stock, index) => (
                <tr key={stock.symbol} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-2 font-semibold text-white">
                    <AiOutlineStock className="inline-block text-red-400 mr-2" />
                    {stock.name} ({stock.symbol})
                  </td>
                  <td className="p-2 font-semibold">₹{stock.price ? stock.price.toFixed(2) : "N/A"}</td>
                  <td className="p-2 font-semibold text-red-400">-₹{stock.change ? stock.change.toFixed(2) : "N/A"}</td>
                  <td className="p-2 font-semibold text-red-400">
                    {stock.percentage_change ? `-${stock.percentage_change.toFixed(2)}%` : "N/A"}
                  </td>
                  <td className="p-2">{typeof stock.pe_ratio === "number" ? stock.pe_ratio.toFixed(2) : "N/A"}</td>
                  <td className="p-2">
                    <img src={stock.dayChart} alt="Graph" className="w-16 h-10 rounded-md shadow-md" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Losers;