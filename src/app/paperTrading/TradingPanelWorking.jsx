"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const TradingPanel = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ticker, setTicker] = useState("MSFT"); // Default ticker
  const [stockData, setStockData] = useState(null);
  const [buyingPower, setBuyingPower] = useState(1000000); // Default buying power
  const [tradeType, setTradeType] = useState("buy");
  const [orderType, setOrderType] = useState("Market Price");
  const [quantity, setQuantity] = useState(100);
  const [stopPrice, setStopPrice] = useState(400);
  const [timeInForce, setTimeInForce] = useState("Day");
  const [useStopPrice, setUseStopPrice] = useState(true);
  const [loading, setLoading] = useState(false);

  // Ensure `ticker` is updated properly
  useEffect(() => {
    const paramTicker = searchParams.get("ticker");
    if (paramTicker) {
      setTicker(paramTicker);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchStockInfo = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/stock_info/${ticker}/`);
        if (!response.ok) throw new Error("Stock data not found");
        const data = await response.json();
        setStockData(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    const fetchBuyingPower = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/portfolio/");
        if (!response.ok) throw new Error("Portfolio data not found");
        const data = await response.json();
        setBuyingPower(data.buyingPower || 1000000);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    };

    if (ticker) {
      fetchStockInfo();
      fetchBuyingPower();
    }
  }, [ticker]);

  const marketPrice = stockData?.price || 0;
  const transactionFee = 4;
  const estimatedTotal = (quantity * marketPrice).toFixed(2);
  const estimatedLoss = useStopPrice ? ((marketPrice - stopPrice) * quantity).toFixed(2) : "0.00";

  const executeTrade = async (e) => {
    e.preventDefault();
    setLoading(true);

    const tradeData = {
      ticker,
      tradeType,
      orderType,
      quantity,
      stopPrice: useStopPrice ? stopPrice : null,
      timeInForce,
      price: marketPrice,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/execute_trade/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeData),
      });

      const result = await response.json();
      if (result.success) {
        router.push(`/paperTrading/TradingPage?ticker=${ticker}`);
      } else {
        alert(`Trade Failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Trade Execution Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black p-6 rounded-lg shadow-md text-white w-full">
      <h2 className="text-xl font-semibold mb-4">Trade {ticker}</h2>

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

      <form onSubmit={executeTrade} className="space-y-4">
        {/* Order Type */}
        <div>
          <label className="block text-gray-400">Order Type</label>
          <select
            className="w-full p-2 bg-gray-800 rounded mt-1"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            <option>Market Price</option>
            <option>Limit Order</option>
            <option>Stop Order</option>
            <option>Stop-Limit Order</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-gray-400">Quantity (Shares)</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full p-2 bg-gray-800 rounded mt-2"
            min="1"
            required
          />
        </div>

        {/* Stop Price Toggle */}
        <div className="flex items-center space-x-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useStopPrice}
              onChange={() => setUseStopPrice(!useStopPrice)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-600 peer-checked:bg-blue-500 rounded-full p-1 transition-all"></div>
          </label>
          <span className="text-gray-400">Stop Price</span>
        </div>

        {/* Stop Price Input */}
        {useStopPrice && (
          <div>
            <input
              type="number"
              value={stopPrice}
              onChange={(e) => setStopPrice(parseFloat(e.target.value))}
              className="w-full p-2 bg-gray-800 rounded mt-1"
              min="1"
              required
            />
          </div>
        )}

        {/* Estimated Loss */}
        <div className={`text-lg font-semibold ${tradeType === "buy" ? "text-red-400" : "text-green-400"}`}>
          Est. Loss: ${estimatedLoss}
        </div>

        {/* Trading Details */}
        <div className="bg-gray-800 p-4 rounded-lg text-sm">
          <p className="flex justify-between">
            <span className="text-gray-400">Buying Power</span>
            <span className="font-semibold">${buyingPower.toLocaleString()}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-400">Transaction Fees</span>
            <span className="font-semibold">${transactionFee}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-gray-400">Estimated Total</span>
            <span className="font-semibold">${estimatedTotal}</span>
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-lg transition duration-200 text-lg font-semibold ${
            tradeType === "buy" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : tradeType === "buy" ? `Buy ${ticker}` : `Sell ${ticker}`}
        </button>
      </form>
    </div>
  );
};

export default TradingPanel;
