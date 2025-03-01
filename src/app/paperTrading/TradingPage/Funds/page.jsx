// "use client";

// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";

// const FundsContent = () => {
//   const [funds, setFunds] = useState({});
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch funds and transaction history dynamically
//     const fetchFundsData = async () => {
//       try {
//         const [fundsRes, transactionsRes] = await Promise.all([
//           fetch("http://127.0.0.1:8000/api/funds/"),
//           fetch("http://127.0.0.1:8000/api/fund-transactions/")
//         ]);

//         const [fundsData, transactionsData] = await Promise.all([
//           fundsRes.json(),
//           transactionsRes.json()
//         ]);

//         setFunds(fundsData);
//         setTransactions(transactionsData.transactions);
//       } catch (error) {
//         console.error("Error fetching funds data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFundsData();
//     const interval = setInterval(fetchFundsData, 5000); // Refresh every 5s
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Funds & Margin Overview</h1>

//       {/* Funds Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Available Margin */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Available Margin</h2>
//           <p className="text-2xl font-bold text-green-400">
//             ₹{funds?.available_margin?.toLocaleString() || "0"}
//           </p>
//         </div>

//         {/* Used Margin */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Used Margin</h2>
//           <p className="text-2xl font-bold text-red-400">
//             ₹{funds?.used_margin?.toLocaleString() || "0"}
//           </p>
//         </div>

//         {/* Opening Balance */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Opening Balance</h2>
//           <p className="text-2xl font-bold text-blue-400">
//             ₹{funds?.opening_balance?.toLocaleString() || "0"}
//           </p>
//         </div>
//       </div>

//       {/* Margin Allocation Breakdown */}
//       <div className="mt-6 p-4 bg-gray-900 rounded-lg">
//         <h2 className="text-lg font-semibold">Margin Allocation</h2>
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b border-gray-700 text-left">
//               <th className="py-2">Category</th>
//               <th>Amount (₹)</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr className="border-b border-gray-800">
//               <td className="py-2">SPAN Margin</td>
//               <td className="text-red-400">₹{funds?.span_margin?.toLocaleString() || "0"}</td>
//             </tr>
//             <tr className="border-b border-gray-800">
//               <td className="py-2">Exposure Margin</td>
//               <td className="text-red-400">₹{funds?.exposure_margin?.toLocaleString() || "0"}</td>
//             </tr>
//             <tr className="border-b border-gray-800">
//               <td className="py-2">Delivery Margin</td>
//               <td className="text-red-400">₹{funds?.delivery_margin?.toLocaleString() || "0"}</td>
//             </tr>
//             <tr className="border-b border-gray-800">
//               <td className="py-2">Options Premium</td>
//               <td className="text-red-400">₹{funds?.options_premium?.toLocaleString() || "0"}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* Transaction History */}
//       <div className="mt-6 p-4 bg-gray-900 rounded-lg">
//         <h2 className="text-lg font-semibold">Transaction History</h2>
//         {loading ? (
//           <p>Loading transactions...</p>
//         ) : transactions.length === 0 ? (
//           <p>No transactions recorded.</p>
//         ) : (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-gray-700 text-left">
//                 <th className="py-2">Date</th>
//                 <th>Type</th>
//                 <th>Amount (₹)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactions.map((txn, index) => (
//                 <tr key={index} className="border-b border-gray-800">
//                   <td className="py-2">{txn.date}</td>
//                   <td className={txn.type === "credit" ? "text-green-400" : "text-red-400"}>
//                     {txn.type.toUpperCase()}
//                   </td>
//                   <td>₹{txn.amount.toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// // ✅ Force client-side rendering
// const Funds = dynamic(() => Promise.resolve(FundsContent), { ssr: false });

// export default Funds;

// "use client";

// import React, { useEffect, useState } from "react";
// import dynamic from "next/dynamic";

// const FundsContent = () => {
//   const [funds, setFunds] = useState({});
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // ✅ Fetch funds and transaction history dynamically
//     const fetchFundsData = async () => {
//       try {
//         const [fundsRes, transactionsRes] = await Promise.all([
//           fetch("http://127.0.0.1:8000/api/funds/"),
//           fetch("http://127.0.0.1:8000/api/fund-transactions/")
//         ]);

//         if (!fundsRes.ok || !transactionsRes.ok) {
//           throw new Error("Error fetching funds data");
//         }

//         const [fundsData, transactionsData] = await Promise.all([
//           fundsRes.json(),
//           transactionsRes.json()
//         ]);

//         setFunds(fundsData);
//         setTransactions(transactionsData.transactions || []);
//         setError(null);
//       } catch (error) {
//         setError("Failed to fetch funds data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFundsData();
//     const interval = setInterval(fetchFundsData, 5000); // Refresh every 5 seconds
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="bg-black text-white p-6 min-h-screen">
//       <h1 className="text-2xl font-bold mb-4">Funds & Margin Overview</h1>

//       {error && <p className="text-red-500">{error}</p>}

//       {/* 🔹 Funds Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* ✅ Available Margin */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Available Margin</h2>
//           <p className="text-2xl font-bold text-green-400">
//             ₹{funds?.available_margin?.toLocaleString() || "0"}
//           </p>
//         </div>

//         {/* ✅ Used Margin */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Used Margin</h2>
//           <p className="text-2xl font-bold text-red-400">
//             ₹{funds?.used_margin?.toLocaleString() || "0"}
//           </p>
//         </div>

//         {/* ✅ Opening Balance */}
//         <div className="p-4 bg-gray-900 rounded-lg">
//           <h2 className="text-lg font-semibold">Opening Balance</h2>
//           <p className="text-2xl font-bold text-blue-400">
//             ₹{funds?.opening_balance?.toLocaleString() || "0"}
//           </p>
//         </div>
//       </div>

//       {/* 🔹 Margin Allocation Breakdown */}
//       <div className="mt-6 p-4 bg-gray-900 rounded-lg">
//         <h2 className="text-lg font-semibold">Margin Allocation</h2>
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b border-gray-700 text-left">
//               <th className="py-2">Category</th>
//               <th>Amount (₹)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {[
//               { label: "SPAN Margin", key: "span_margin" },
//               { label: "Exposure Margin", key: "exposure_margin" },
//               { label: "Delivery Margin", key: "delivery_margin" },
//               { label: "Options Premium", key: "options_premium" },
//               { label: "Leverage Used", key: "leverage_used" },
//               { label: "Net Exposure", key: "net_exposure" }
//             ].map((item, index) => (
//               <tr key={index} className="border-b border-gray-800">
//                 <td className="py-2">{item.label}</td>
//                 <td className="text-red-400">₹{funds?.[item.key]?.toLocaleString() || "0"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* 🔹 Transaction History */}
//       <div className="mt-6 p-4 bg-gray-900 rounded-lg">
//         <h2 className="text-lg font-semibold">Transaction History</h2>
//         {loading ? (
//           <p>Loading transactions...</p>
//         ) : transactions.length === 0 ? (
//           <p>No transactions recorded.</p>
//         ) : (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-gray-700 text-left">
//                 <th className="py-2">Date</th>
//                 <th>Type</th>
//                 <th>Amount (₹)</th>
//                 <th>Description</th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactions.map((txn, index) => (
//                 <tr key={index} className="border-b border-gray-800">
//                   <td className="py-2">{new Date(txn.date).toLocaleString()}</td>
//                   <td className={txn.type === "credit" ? "text-green-400" : "text-red-400"}>
//                     {txn.type.toUpperCase()}
//                   </td>
//                   <td>₹{txn.amount.toLocaleString()}</td>
//                   <td className="text-gray-400">{txn.description || "N/A"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// // ✅ Force client-side rendering
// const Funds = dynamic(() => Promise.resolve(FundsContent), { ssr: false });

// export default Funds;

"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Loader from "@/components/Loaders/loader2"; // ✅ Updated Loader Component

const FundsContent = () => {
  const [funds, setFunds] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ Fetch funds and transaction history dynamically
    const fetchFundsData = async () => {
      try {
        const [fundsRes, transactionsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/funds/"),
          fetch("http://127.0.0.1:8000/api/fund-transactions/")
        ]);

        if (!fundsRes.ok || !transactionsRes.ok) {
          throw new Error("Error fetching funds data");
        }

        const [fundsData, transactionsData] = await Promise.all([
          fundsRes.json(),
          transactionsRes.json()
        ]);

        setFunds(fundsData);
        setTransactions(transactionsData.transactions || []);
        setError(null);
      } catch (error) {
        setError("⚠️ Failed to fetch funds data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFundsData();
    const interval = setInterval(fetchFundsData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">💰 Funds & Margin Overview</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* 🔹 Funds Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ✅ Available Margin */}
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">💲 Available Margin</h2>
          <p className="text-2xl font-bold text-green-400">
            ₹{funds?.available_margin?.toLocaleString() || "0"}
          </p>
        </div>

        {/* ✅ Used Margin */}
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">🔴 Used Margin</h2>
          <p className="text-2xl font-bold text-red-400">
            ₹{funds?.used_margin?.toLocaleString() || "0"}
          </p>
        </div>

        {/* ✅ Opening Balance */}
        <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold">🏦 Opening Balance</h2>
          <p className="text-2xl font-bold text-blue-400">
            ₹{funds?.opening_balance?.toLocaleString() || "0"}
          </p>
        </div>
      </div>

      {/* 🔹 Margin Allocation Breakdown */}
      <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">📊 Margin Allocation</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-left">
              <th className="py-2">📌 Category</th>
              <th>💰 Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "📉 SPAN Margin", key: "span_margin" },
              { label: "📊 Exposure Margin", key: "exposure_margin" },
              { label: "🚚 Delivery Margin", key: "delivery_margin" },
              { label: "📝 Options Premium", key: "options_premium" },
              { label: "📈 Leverage Used", key: "leverage_used" },
              { label: "🔄 Net Exposure", key: "net_exposure" }
            ].map((item, index) => (
              <tr key={index} className="border-b border-gray-800">
                <td className="py-2">{item.label}</td>
                <td className="text-red-400">₹{funds?.[item.key]?.toLocaleString() || "0"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Transaction History */}
      <div className="mt-6 p-4 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">📜 Transaction History</h2>
        {loading ? (
          <Loader />
        ) : transactions.length === 0 ? (
          <p>No transactions recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="py-2">📅 Date</th>
                <th>🔄 Type</th>
                <th>💲 Amount (₹)</th>
                <th>📝 Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="py-2">{new Date(txn.date).toLocaleString()}</td>
                  <td className={txn.type === "credit" ? "text-green-400" : "text-red-400"}>
                    {txn.type.toUpperCase()}
                  </td>
                  <td>₹{txn.amount.toLocaleString()}</td>
                  <td className="text-gray-400">{txn.description || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ✅ Force client-side rendering
const Funds = dynamic(() => Promise.resolve(FundsContent), { ssr: false });

export default Funds;