"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";  // ✅ Ensure client-side only

const TradingPageContent = () => {
  const [ticker, setTicker] = useState("MSFT"); // Default ticker
  const [tradeHistory, setTradeHistory] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const paramTicker = searchParams.get("ticker") || "MSFT";
      setTicker(paramTicker);
    }
  }, []);

  useEffect(() => {
    if (!ticker) return;

    const fetchTradeHistory = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/trade_history/");
        const data = await response.json();
        setTradeHistory(data.trades || []);
        setPortfolio(data.portfolio);
      } catch (error) {
        console.error("Error fetching trade history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTradeHistory();
  }, [ticker]);

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-2xl font-bold">Trade Summary for {ticker}</h1>

      {loading ? (
        <p>Loading trades...</p>
      ) : (
        <>
          <div className="mt-4 p-4 bg-gray-900 rounded-lg">
            <h2 className="text-lg font-semibold">Portfolio</h2>
            <p>Buying Power: ${portfolio?.buyingPower?.toLocaleString() || "0"}</p>
            <p>Total P&L: ${portfolio?.profitLoss?.toFixed(2) || "0.00"}</p>
          </div>

          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <h2 className="text-lg font-semibold">Trade History</h2>
            <ul>
              {tradeHistory.map((trade, index) => (
                <li key={index} className="py-2">
                  {trade.tradeType.toUpperCase()} {trade.quantity} shares of {trade.ticker} @ $
                  {trade.price.toFixed(2)} ({trade.orderType})
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

// ✅ Force client-side rendering
const TradingPage = dynamic(() => Promise.resolve(TradingPageContent), { ssr: false });

export default TradingPage;
