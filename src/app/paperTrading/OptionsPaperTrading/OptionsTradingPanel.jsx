// "use client";

// import React, { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// const OptionsTradingPanel = () => {
//     const searchParams = useSearchParams();
//     const router = useRouter();
//     const ticker = searchParams.get("ticker") || "CYIENT";
//     const strike = searchParams.get("strike");
//     const type = searchParams.get("type");
//     const [quantity, setQuantity] = useState(1);

//     const executeTrade = () => {
//         alert(`Paper trade executed for ${ticker} - ${type} at ${strike}`);
//         router.push(`/api/OptionsTradingPage?ticker=${ticker}`);
//     };

//     return (
//         <div className="bg-black p-6 rounded-lg shadow-md text-white">
//             <h2 className="text-xl font-semibold mb-4">Trade {ticker} Options</h2>

//             <div className="mb-4">
//                 <p>Option Type: <strong>{type}</strong></p>
//                 <p>Strike Price: <strong>{strike}</strong></p>
//                 <label className="block text-gray-400 mt-2">Quantity:</label>
//                 <input
//                     type="number"
//                     value={quantity}
//                     onChange={(e) => setQuantity(e.target.value)}
//                     className="w-full p-2 bg-gray-800 rounded"
//                     min="1"
//                 />
//             </div>

//             <button
//                 onClick={executeTrade}
//                 className="w-full py-3 mt-4 bg-blue-500 hover:bg-blue-600 text-lg font-semibold rounded-lg"
//             >
//                 Execute Paper Trade
//             </button>
//         </div>
//     );
// };

// export default OptionsTradingPanel;

// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// const OptionsTradingPanel = () => {
//     const searchParams = useSearchParams();
//     const router = useRouter();
//     const ticker = searchParams.get("ticker") || "CYIENT";
//     const strike = searchParams.get("strike");
//     const type = searchParams.get("type");

//     const [quantity, setQuantity] = useState(1);
//     const [lotSize, setLotSize] = useState(1);

//     useEffect(() => {
//         console.log("Rendering OptionsTradingPanel for", { ticker, strike, type });

//         // Fetch the lot size based on ticker (if needed)
//         const fetchLotSize = async () => {
//             try {
//                 const response = await fetch(`/api/lotsize?ticker=${ticker}`);
//                 const data = await response.json();
//                 if (data.lotSize) {
//                     setLotSize(data.lotSize);
//                     setQuantity(data.lotSize);
//                 }
//             } catch (error) {
//                 console.error("Error fetching lot size:", error);
//             }
//         };

//         fetchLotSize();
//     }, [ticker]);

//     const executeTrade = () => {
//         if (!ticker || !strike || !type) {
//             alert("Invalid trade parameters!");
//             return;
//         }

//         alert(`Paper trade executed for ${ticker} - ${type} at ${strike}`);
//         router.push(`/apii/OptionsTradingPage?ticker=${ticker}`);
//     };

//     return (
//         <div className="bg-gray-900 p-6 rounded-lg shadow-md text-white">
//             <h2 className="text-xl font-semibold mb-4">Trade {ticker} Options</h2>

//             <div className="mb-4">
//                 <p>Option Type: <strong>{type || "N/A"}</strong></p>
//                 <p>Strike Price: <strong>{strike || "N/A"}</strong></p>
//                 <label className="block text-gray-400 mt-2">Quantity (Lot Size: {lotSize})</label>
//                 <input
//                     type="number"
//                     value={quantity}
//                     onChange={(e) => setQuantity(e.target.value)}
//                     className="w-full p-2 bg-gray-800 rounded"
//                     min={lotSize}
//                     step={lotSize}
//                 />
//             </div>

//             <button
//                 onClick={executeTrade}
//                 className="w-full py-3 mt-4 bg-blue-500 hover:bg-blue-600 text-lg font-semibold rounded-lg"
//             >
//                 Execute Paper Trade
//             </button>
//         </div>
//     );
// };

// export default OptionsTradingPanel;








"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const OptionsTradingPanel = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ticker = searchParams.get("ticker") || "CYIENT";
    const strike = searchParams.get("strike");
    const type = searchParams.get("type");

    const [quantity, setQuantity] = useState(1);
    const [lotSize, setLotSize] = useState(1);
    const [tradeType, setTradeType] = useState("buy");
    const [orderType, setOrderType] = useState("Market Price");
    const [limitPrice, setLimitPrice] = useState("");
    const [stopPrice, setStopPrice] = useState("");
    const [timeInForce, setTimeInForce] = useState("Day");

    useEffect(() => {
        // Fetch the lot size based on ticker
        const fetchLotSize = async () => {
            try {
                const response = await fetch(`/apii/OptionsPaperTrading?ticker=${ticker}`);
                const data = await response.json();
                if (data.lotSize) {
                    setLotSize(data.lotSize);
                    setQuantity(data.lotSize);
                }
            } catch (error) {
                console.error("Error fetching lot size:", error);
            }
        };

        fetchLotSize();
    }, [ticker]);

    const executeTrade = () => {
        if (!ticker || !strike || !type) {
            alert("Invalid trade parameters!");
            return;
        }

        alert(`Trade Executed: ${tradeType.toUpperCase()} ${quantity} contracts of ${ticker} ${type} at Strike ${strike}`);
        router.push(`/paperTrading/OptionsPaperTrading?ticker=${ticker}`);
    };

    return (
        <div className="bg-gray-900 p-6 rounded-lg shadow-md text-white">
            <h2 className="text-xl font-semibold mb-4">Trade {ticker} Options</h2>

            {/* Buy & Sell Toggle */}
            <div className="flex mb-4 border-b border-gray-700">
                <button
                    className={`flex-1 py-2 text-lg font-semibold rounded-t-lg ${
                        tradeType === "buy" ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400"
                    }`}
                    onClick={() => setTradeType("buy")}
                >
                    Buy
                </button>
                <button
                    className={`flex-1 py-2 text-lg font-semibold rounded-t-lg ${
                        tradeType === "sell" ? "bg-red-500 text-black" : "bg-gray-800 text-gray-400"
                    }`}
                    onClick={() => setTradeType("sell")}
                >
                    Sell
                </button>
            </div>

            {/* Order Type Selection */}
            <div className="mb-4">
                <label className="block text-gray-400">Order Type</label>
                <select
                    className="w-full p-2 bg-gray-800 rounded mt-1"
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                >
                    <option>Market Price</option>
                    <option>Limit Order</option>
                    <option>Stop Order</option>
                </select>
            </div>

            {/* Limit / Stop Price Inputs */}
            {orderType === "Limit Order" && (
                <div className="mb-4">
                    <label className="block text-gray-400">Limit Price</label>
                    <input
                        type="number"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded mt-2"
                    />
                </div>
            )}

            {orderType === "Stop Order" && (
                <div className="mb-4">
                    <label className="block text-gray-400">Stop Price</label>
                    <input
                        type="number"
                        value={stopPrice}
                        onChange={(e) => setStopPrice(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded mt-2"
                    />
                </div>
            )}

            {/* Quantity Selection */}
            <div className="mb-4">
                <label className="block text-gray-400">Quantity (Lot Size: {lotSize})</label>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-2 bg-gray-800 rounded"
                    min={lotSize}
                    step={lotSize}
                />
            </div>

            {/* Time in Force Selection */}
            <div className="mb-4">
                <label className="block text-gray-400">Time in Force</label>
                <select
                    className="w-full p-2 bg-gray-800 rounded"
                    value={timeInForce}
                    onChange={(e) => setTimeInForce(e.target.value)}
                >
                    <option>Day</option>
                    <option>GTC (Good Till Cancelled)</option>
                    <option>IOC (Immediate or Cancel)</option>
                </select>
            </div>

            {/* Execute Trade Button */}
            <button
                onClick={executeTrade}
                className="w-full py-3 mt-4 bg-blue-500 hover:bg-blue-600 text-lg font-semibold rounded-lg"
            >
                Execute Paper Trade
            </button>
        </div>
    );
};

export default OptionsTradingPanel;
