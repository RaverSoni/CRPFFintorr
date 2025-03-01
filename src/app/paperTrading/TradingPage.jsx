"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Card from "@/components/cards/indexcard";
import GainerBox from "@/components/tile/gainerbox/gainer";
import LoserBox from "@/components/tile/loserbox/loser";
import InvestBox from "@/components/tile/investments/investmentbox";
import NewsCard from "@/components/tile/newsbox";

// List of Indices
const indices = [
  { symbol: "^NSEI", title: "Nifty 50" },
  { symbol: "^NSEBANK", title: "BankNifty" },
  { symbol: "^BSESN", title: "Sensex" },
  { symbol: "^CNXFMCG", title: "FinNifty" },
  { symbol: "^CNXMCAP", title: "Midcap" },
  { symbol: "^NSEMDCP50", title: "Nifty Next 50" },
  { symbol: "^NSE100", title: "Nifty Next 100" }
];

// Fetch & Display Index Data
const IndexCard = ({ symbol, title }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch(`http://127.0.0.1:8000/index-data/${symbol}/`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setData(data);
            setError(null);
          }
          setLoading(false);
        })
        .catch((error) => {
          setError(error.message);
          setLoading(false);
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading) return <div className="text-xs text-gray-400">Loading...</div>;
  if (error) return <div className="text-xs text-red-500">Error</div>;

  return (
    <button
      className="text-xs px-2 py-1 bg-gray-800 rounded-md hover:bg-blue-500"
    >
      <span className="font-bold">{title}</span>
      <br />
      <span className={data.day_change > 0 ? "text-green-400" : "text-red-400"}>
        {data.current_price || "N/A"}
      </span>{" "}
      <span className={data.day_change > 0 ? "text-green-400" : "text-red-400"}>
        {data.day_change} ({data.percentage_change}%)
      </span>
    </button>
  );
};

// Trading Page Component
const TradingPageContent = () => {
  const router = useRouter();
  const [ticker, setTicker] = useState("MSFT");
  const [tradeHistory, setTradeHistory] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const paramTicker = searchParams.get("ticker");
      if (paramTicker) setTicker(paramTicker);
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
      
      {/* Indices Section */}
      <div className="flex flex-row">
        <div className="flex flex-col">
          <h1 className="text-3xl ml-5 mb-4 font-bold text-white">Indices</h1>
          <div className="flex flex-row justify-between ml-5 mr-5">
            <Card symbol="^BSESN" title="Sensex" />
            <Card symbol="^NSEI" title="Nifty 50" />
            <Card symbol="^NSEBANK" title="BankNifty" />
          </div>

          {/* Gainers & Losers - Stacked Vertically */}
          <div className="flex flex-col gap-6 mt-6">
            <GainerBox />
            <LoserBox />
          </div>
        </div>

        {/* Right Side Content */}
        <div className="flex flex-col w-full">
          {/* Stock News */}
          <h1 className="text-3xl ml-10 font-bold text-white">Stock News</h1>
          <NewsCard title="Market Updates" content="Today's biggest movers in the stock market." />

          {/* Investments Section */}
          <h1 className="text-3xl ml-10 mt-5 font-bold text-white">Investments</h1>
          <InvestBox />
        </div>
      </div>

      {/* Indices Navigation Bar */}
      <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md mb-4">
        <div className="flex space-x-2 overflow-x-auto">
          {indices.map((index) => (
            <IndexCard key={index.symbol} symbol={index.symbol} title={index.title} />
          ))}
        </div>

        {/* ➡️ Button to open Indices page */}
        <button
          className="text-sm px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600"
          onClick={() => router.push("/indices")}
        >
          ➡️
        </button>
      </div>

      {/* Trade Summary */}
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
                  {trade.price !== "N/A" ? trade.price.toFixed(2) : "N/A"} ({trade.orderType})
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
