// "use client";

// import React, { useEffect, useState, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
// import dynamic from "next/dynamic";

// // Lazy load chart component
// const StockChart = dynamic(() => import("@/app/paperTrading/StockChart"), { ssr: false });

// const OptionsContent = () => {
//   const searchParams = useSearchParams();
//   let ticker = searchParams.get("ticker") || "COALINDIA";
//   ticker = ticker.replace(".NS", "");

//   const [callOptions, setCallOptions] = useState([]);
//   const [putOptions, setPutOptions] = useState([]);
//   const [marketData, setMarketData] = useState(null);
//   const [marketDepth, setMarketDepth] = useState(null);
//   const [basket, setBasket] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshInterval, setRefreshInterval] = useState(10); // Auto-refresh every 10 seconds

//   useEffect(() => {
//     const fetchOptionsData = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const response = await fetch(`/api/options?ticker=${ticker}`);
//         if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
//         const data = await response.json();
//         if (data.error) throw new Error(data.error);

//         setCallOptions(data.callOptions || []);
//         setPutOptions(data.putOptions || []);
//         setMarketData(data.marketData || null);
//         setMarketDepth(data.marketDepth || null);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOptionsData();
//     const interval = setInterval(fetchOptionsData, refreshInterval * 1000);
//     return () => clearInterval(interval);
//   }, [ticker, refreshInterval]);

//   const addToBasket = (option) => {
//     setBasket((prev) => [...prev, option]);
//   };

//   const removeFromBasket = (strike) => {
//     setBasket((prev) => prev.filter((opt) => opt.strike !== strike));
//   };

//   return (
//     <div className="bg-black text-white min-h-screen p-6">
//       <h1 className="text-2xl font-bold mb-4">Options Chain for {ticker}</h1>

//       {/* Refresh Interval Selection */}
//       <div className="mb-4">
//         <label className="text-gray-400 mr-2">Auto-Refresh:</label>
//         <select
//           className="bg-gray-800 text-white p-1 rounded"
//           onChange={(e) => setRefreshInterval(Number(e.target.value))}
//           value={refreshInterval}
//         >
//           <option value="5">5 sec</option>
//           <option value="10">10 sec</option>
//           <option value="30">30 sec</option>
//           <option value="60">1 min</option>
//         </select>
//       </div>

//       {/* Stock Chart Integration */}
//       {marketData && <StockChart ticker={ticker} marketData={marketData} />}

//       {/* Error Handling */}
//       {loading ? (
//         <p className="text-gray-400">Loading options data...</p>
//       ) : error ? (
//         <p className="text-red-400">Error: {error}</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* CALL OPTIONS TABLE */}
//           <div>
//             <h2 className="text-xl font-semibold mb-2 text-green-400 text-center">Call Options</h2>
//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse border border-gray-700">
//                 <thead>
//                   <tr className="bg-gray-800">
//                     <th className="p-2 border border-gray-700">✔</th>
//                     <th className="p-2 border border-gray-700">Strike</th>
//                     <th className="p-2 border border-gray-700">Price</th>
//                     <th className="p-2 border border-gray-700">Net Chg</th>
//                     <th className="p-2 border border-gray-700">OI</th>
//                     <th className="p-2 border border-gray-700">IV</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {callOptions.map((option, index) => (
//                     <tr key={index} className="border border-gray-700">
//                       <td>
//                         <input
//                           type="checkbox"
//                           onChange={(e) => e.target.checked ? addToBasket(option) : removeFromBasket(option.strike)}
//                         />
//                       </td>
//                       <td className="p-2">{option.strike}</td>
//                       <td className="p-2">₹{option.price}</td>
//                       <td className={`p-2 ${option.change > 0 ? "text-green-400" : "text-red-400"}`}>
//                         {option.change}
//                       </td>
//                       <td className="p-2">{option.oi}</td>
//                       <td className="p-2">{option.iv}%</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* PUT OPTIONS TABLE */}
//           <div>
//             <h2 className="text-xl font-semibold mb-2 text-red-400 text-center">Put Options</h2>
//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse border border-gray-700">
//                 <thead>
//                   <tr className="bg-gray-800">
//                     <th className="p-2 border border-gray-700">✔</th>
//                     <th className="p-2 border border-gray-700">Strike</th>
//                     <th className="p-2 border border-gray-700">Price</th>
//                     <th className="p-2 border border-gray-700">Net Chg</th>
//                     <th className="p-2 border border-gray-700">OI</th>
//                     <th className="p-2 border border-gray-700">IV</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {putOptions.map((option, index) => (
//                     <tr key={index} className="border border-gray-700">
//                       <td>
//                         <input
//                           type="checkbox"
//                           onChange={(e) => e.target.checked ? addToBasket(option) : removeFromBasket(option.strike)}
//                         />
//                       </td>
//                       <td className="p-2">{option.strike}</td>
//                       <td className="p-2">₹{option.price}</td>
//                       <td className={`p-2 ${option.change > 0 ? "text-green-400" : "text-red-400"}`}>
//                         {option.change}
//                       </td>
//                       <td className="p-2">{option.oi}</td>
//                       <td className="p-2">{option.iv}%</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Basket Trading Feature */}
//       <div className="mt-6 p-4 bg-gray-900 rounded">
//         <h2 className="text-xl font-bold mb-2">Basket (Paper Trading)</h2>
//         {basket.length > 0 ? (
//           <ul>
//             {basket.map((option, index) => (
//               <li key={index} className="p-2 border-b border-gray-700">
//                 {option.strike} - ₹{option.price} ({option.type})
//                 <button className="ml-4 text-red-500" onClick={() => removeFromBasket(option.strike)}>
//                   ❌ Remove
//                 </button>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-gray-400">No options added yet.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OptionsContent;







// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import dynamic from "next/dynamic";
// import Link from "next/link";

// const StockChart = dynamic(() => import("@/app/paperTrading/StockChart"), { ssr: false });

// const OptionsContent = () => {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   let ticker = searchParams.get("ticker") || "COALINDIA";
//   ticker = ticker.replace(".NS", "");

//   const [callOptions, setCallOptions] = useState([]);
//   const [putOptions, setPutOptions] = useState([]);
//   const [marketData, setMarketData] = useState(null);
//   const [marketDepth, setMarketDepth] = useState(null);
//   const [basket, setBasket] = useState([]);
//   const [basketEnabled, setBasketEnabled] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshInterval, setRefreshInterval] = useState(10);

//   useEffect(() => {
//     const fetchOptionsData = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const response = await fetch(`/api/options?ticker=${ticker}`);
//         if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
//         const data = await response.json();
//         if (data.error) throw new Error(data.error);

//         setCallOptions(data.callOptions || []);
//         setPutOptions(data.putOptions || []);
//         setMarketData(data.marketData || null);
//         setMarketDepth(data.marketDepth || null);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOptionsData();
//     const interval = setInterval(fetchOptionsData, refreshInterval * 1000);
//     return () => clearInterval(interval);
//   }, [ticker, refreshInterval]);

//   const toggleBasket = () => {
//     setBasketEnabled(!basketEnabled);
//   };

//   const addToBasket = (option) => {
//     if (!basketEnabled) return;
//     setBasket((prev) => [...prev, option]);
//   };

//   const removeFromBasket = (strike) => {
//     setBasket((prev) => prev.filter((opt) => opt.strike !== strike));
//   };

//   return (
//     <div className="bg-black text-white min-h-screen p-6 flex">
//       {/* Option List Section */}
//       <div className="w-3/4">
//         <h1 className="text-2xl font-bold mb-4">Options Chain for {ticker}</h1>
//         <div className="flex gap-4 mb-4">
//           <button
//             className={`p-2 rounded ${basketEnabled ? "bg-green-500" : "bg-gray-700"}`}
//             onClick={toggleBasket}
//           >
//             {basketEnabled ? "Basket Enabled" : "Enable Basket"}
//           </button>
//           <Link href={`/chart?ticker=${ticker}`} className="p-2 bg-blue-500 rounded">Chart</Link>
//         </div>

//         {loading ? (
//           <p className="text-gray-400">Loading options data...</p>
//         ) : error ? (
//           <p className="text-red-400">Error: {error}</p>
//         ) : (
//           <div className="grid grid-cols-2 gap-6">
//             {/* CALL OPTIONS TABLE */}
//             <div>
//               <h2 className="text-xl font-semibold mb-2 text-green-400 text-center">Call Options</h2>
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse border border-gray-700">
//                   <thead>
//                     <tr className="bg-gray-800">
//                       <th className="p-2">✔</th>
//                       <th className="p-2">Strike</th>
//                       <th className="p-2">Price</th>
//                       <th className="p-2">Net Chg</th>
//                       <th className="p-2">OI</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {callOptions.map((option, index) => (
//                       <tr key={index} className="border border-gray-700">
//                         <td>
//                           <input
//                             type="checkbox"
//                             disabled={!basketEnabled}
//                             onChange={(e) =>
//                               e.target.checked ? addToBasket(option) : removeFromBasket(option.strike)
//                             }
//                           />
//                         </td>
//                         <td>{option.strike}</td>
//                         <td>₹{option.price}</td>
//                         <td className={option.change > 0 ? "text-green-400" : "text-red-400"}>{option.change}</td>
//                         <td>{option.oi}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* PUT OPTIONS TABLE */}
//             <div>
//               <h2 className="text-xl font-semibold mb-2 text-red-400 text-center">Put Options</h2>
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse border border-gray-700">
//                   <thead>
//                     <tr className="bg-gray-800">
//                       <th className="p-2">✔</th>
//                       <th className="p-2">Strike</th>
//                       <th className="p-2">Price</th>
//                       <th className="p-2">Net Chg</th>
//                       <th className="p-2">OI</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {putOptions.map((option, index) => (
//                       <tr key={index} className="border border-gray-700">
//                         <td>
//                           <input
//                             type="checkbox"
//                             disabled={!basketEnabled}
//                             onChange={(e) =>
//                               e.target.checked ? addToBasket(option) : removeFromBasket(option.strike)
//                             }
//                           />
//                         </td>
//                         <td>{option.strike}</td>
//                         <td>₹{option.price}</td>
//                         <td className={option.change > 0 ? "text-green-400" : "text-red-400"}>{option.change}</td>
//                         <td>{option.oi}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Basket Section */}
//       <div className="w-1/4 p-4 bg-gray-900 rounded ml-6">
//         <h2 className="text-xl font-bold mb-2">Basket</h2>
//         {basket.length > 0 ? (
//           <ul>
//             {basket.map((option, index) => (
//               <li key={index} className="p-2 border-b border-gray-700">
//                 {option.strike} - ₹{option.price} ({option.type})
//                 <button className="ml-4 text-red-500" onClick={() => removeFromBasket(option.strike)}>
//                   ❌
//                 </button>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-gray-400">No options added yet.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OptionsContent;










"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Lazy load chart component
const StockChart = dynamic(() => import("@/app/paperTrading/StockChart"), { ssr: false });

const OptionsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  let ticker = searchParams.get("ticker") || "COALINDIA";
  ticker = ticker.replace(".NS", "");

  const [callOptions, setCallOptions] = useState([]);
  const [putOptions, setPutOptions] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [marketDepth, setMarketDepth] = useState(null);
  const [basket, setBasket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(10); // Auto-refresh every 10 sec
  const [isBasketActive, setIsBasketActive] = useState(false);

  useEffect(() => {
    const fetchOptionsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/options?ticker=${ticker}`);
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        setCallOptions(data.callOptions || []);
        setPutOptions(data.putOptions || []);
        setMarketData(data.marketData || null);
        setMarketDepth(data.marketDepth || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOptionsData();
    const interval = setInterval(fetchOptionsData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [ticker, refreshInterval]);

  const addToBasket = (option) => {
    setBasket((prev) => [...prev, option]);
  };

  const removeFromBasket = (strike) => {
    setBasket((prev) => prev.filter((opt) => opt.strike !== strike));
  };

  return (
    <div className="bg-black text-white min-h-screen p-6 flex">
      {/* Options Chain Section */}
      <div className="flex-grow">
        <h1 className="text-2xl font-bold mb-4">Options Chain for {ticker}</h1>

        {/* Toggle Basket Mode */}
        <div className="mb-4 flex gap-4">
          <button
            className={`p-2 rounded ${isBasketActive ? "bg-green-500" : "bg-gray-700"}`}
            onClick={() => setIsBasketActive(!isBasketActive)}
          >
            {isBasketActive ? "Basket Active ✅" : "Enable Basket"}
          </button>
          <button
            className="p-2 bg-blue-500 rounded"
            onClick={() => router.push(`/paperTrading/options/chart?ticker=${ticker}`)}
          >
            Chart 📊
          </button>
        </div>

        {/* Refresh Interval Selection */}
        <div className="mb-4">
          <label className="text-gray-400 mr-2">Auto-Refresh:</label>
          <select
            className="bg-gray-800 text-white p-1 rounded"
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            value={refreshInterval}
          >
            <option value="5">5 sec</option>
            <option value="10">10 sec</option>
            <option value="30">30 sec</option>
            <option value="60">1 min</option>
          </select>
        </div>

        {/* Stock Chart */}
        {marketData && <StockChart ticker={ticker} marketData={marketData} />}

        {/* Error Handling */}
        {loading ? (
          <p className="text-gray-400">Loading options data...</p>
        ) : error ? (
          <p className="text-red-400">Error: {error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CALL OPTIONS */}
            <div>
              <h2 className="text-xl font-semibold mb-2 text-green-400 text-center">Call Options</h2>
              <div className="overflow-x-auto">
                {callOptions.map((option, index) => (
                  <button
                    key={index}
                    className="w-full p-2 border border-gray-700 bg-gray-800 hover:bg-gray-700 flex justify-between"
                    onClick={() => router.push(`/paperTrading/OptionsPaperTrading?ticker=${ticker}&strike=${option.strike}`)}
                  >
                    <span>Strike: {option.strike}</span>
                    <span>₹{option.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* PUT OPTIONS */}
            <div>
              <h2 className="text-xl font-semibold mb-2 text-red-400 text-center">Put Options</h2>
              <div className="overflow-x-auto">
                {putOptions.map((option, index) => (
                  <button
                    key={index}
                    className="w-full p-2 border border-gray-700 bg-gray-800 hover:bg-gray-700 flex justify-between"
                    onClick={() => router.push(`/paperTrading/OptionsPaperTrading?ticker=${ticker}&strike=${option.strike}`)}
                  >
                    <span>Strike: {option.strike}</span>
                    <span>₹{option.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Basket Section - Positioned Aside */}
      {isBasketActive && (
        <div className="ml-6 p-4 bg-gray-900 rounded w-1/4">
          <h2 className="text-xl font-bold mb-2">Basket (Paper Trading)</h2>
          {basket.length > 0 ? (
            <ul>
              {basket.map((option, index) => (
                <li key={index} className="p-2 border-b border-gray-700 flex justify-between">
                  <span>{option.strike} - ₹{option.price}</span>
                  <button className="text-red-500" onClick={() => removeFromBasket(option.strike)}>❌</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No options added yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OptionsContent;
