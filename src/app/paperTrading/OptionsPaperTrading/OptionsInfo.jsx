// "use client";

// import React, { useEffect, useState } from "react";

// const OptionsInfo = ({ ticker, strike }) => {
//   const [optionData, setOptionData] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchOptionData = async () => {
//       try {
//         const response = await fetch(`/api/options?ticker=${ticker}`);
//         const data = await response.json();
        
//         if (data.error) throw new Error(data.error);
        
//         const option = [...data.callOptions, ...data.putOptions].find(
//           (opt) => opt.strike.toString() === strike
//         );

//         if (!option) throw new Error("Option data not found.");
//         setOptionData(option);
//       } catch (err) {
//         setError(err.message);
//       }
//     };

//     fetchOptionData();
//   }, [ticker, strike]);

//   if (error) return <div className="text-red-500">{error}</div>;
//   if (!optionData) return <div>Loading...</div>;

//   return (
//     <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
//       <h2 className="text-lg font-semibold">{ticker} - Strike ₹{strike}</h2>
//       <p className="text-gray-400">{optionData.type === "CE" ? "Call Option" : "Put Option"}</p>
//       <p className="text-gray-500 text-sm">Expiry: {optionData.expiry}</p>

//       <div className="mt-2">
//         <span className="text-3xl font-bold text-green-400">
//           ₹{optionData.price}
//         </span>
//         <span className={`ml-2 text-sm ${optionData.change >= 0 ? "text-green-300" : "text-red-300"}`}>
//           {optionData.change}%
//         </span>
//       </div>

//       <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
//         <p>📊 OI: <span className="text-gray-300">{optionData.oi}</span></p>
//         <p>📈 Delta: <span className="text-gray-300">{optionData.delta || "N/A"}</span></p>
//         <p>📉 Gamma: <span className="text-gray-300">{optionData.gamma || "N/A"}</span></p>
//         <p>⚡ Vega: <span className="text-gray-300">{optionData.vega || "N/A"}</span></p>
//         <p>⏳ Theta: <span className="text-gray-300">{optionData.theta || "N/A"}</span></p>
//         <p>💡 IV: <span className="text-gray-300">{optionData.iv || "N/A"}%</span></p>
//       </div>
//     </div>
//   );
// };

// export default OptionsInfo;

"use client";

import React, { useEffect, useState } from "react";

const OptionsInfo = ({ ticker, strike }) => {
    const [optionData, setOptionData] = useState(null);
    const [marketData, setMarketData] = useState(null);
    const [lotSize, setLotSize] = useState(1);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOptionData = async () => {
            try {
                const response = await fetch(`/apii/OptionsPaperTrading?ticker=${ticker}`);
                const data = await response.json();
                if (data.error) throw new Error(data.error);

                const option = [...data.callOptions, ...data.putOptions].find(
                    (opt) => opt.strike.toString() === strike
                );

                if (!option) throw new Error("Option data not found.");
                
                setOptionData(option);
                setMarketData(data.marketData || {});
                setLotSize(data.lotSize || 1);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchOptionData();
    }, [ticker, strike]);

    if (error) return <div className="text-red-500">{error}</div>;
    if (!optionData) return <div>Loading...</div>;

    return (
        <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
            <h2 className="text-lg font-semibold">{ticker} - Strike ₹{strike}</h2>
            <p className="text-gray-400">{optionData.type === "CE" ? "Call Option" : "Put Option"}</p>
            <p className="text-gray-500 text-sm">Expiry: {optionData.expiry || "N/A"}</p>

            <div className="mt-2">
                <span className="text-3xl font-bold text-green-400">₹{optionData.price}</span>
                <span className={`ml-2 text-sm ${optionData.change >= 0 ? "text-green-300" : "text-red-300"}`}>
                    {optionData.change}%
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                <p>🔹 Open Price: ₹{marketData.open || "N/A"}</p>
                <p>📊 OI (Lots): {marketData.oi || "N/A"}</p>
                <p>📉 Prev Close: ₹{marketData.prevClose || "N/A"}</p>
                <p>📈 Volume: {marketData.volume ? marketData.volume.toLocaleString() : "N/A"}</p>
                <p>📦 Lot Size: {lotSize}</p>
            </div>

            <h3 className="mt-4 text-md font-semibold text-gray-400">Option Greeks</h3>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <p>📈 Delta: <span className="text-gray-300">{optionData.delta || "N/A"}</span></p>
                <p>📉 Gamma: <span className="text-gray-300">{optionData.gamma || "N/A"}</span></p>
                <p>⚡ Vega: <span className="text-gray-300">{optionData.vega || "N/A"}</span></p>
                <p>⏳ Theta: <span className="text-gray-300">{optionData.theta || "N/A"}</span></p>
                <p>💡 IV: <span className="text-gray-300">{optionData.iv ? `${optionData.iv}%` : "N/A"}</span></p>
            </div>
        </div>
    );
};

export default OptionsInfo;
