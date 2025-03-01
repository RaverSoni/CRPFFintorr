"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const IndicesInfo = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "^NSEI"; // Default to Nifty 50
  const [index, setIndex] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIndexInfo = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/indices_info/${ticker}/`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setIndex(data);
        }
      } catch (err) {
        setError("Error fetching index info.");
      }
    };

    fetchIndexInfo();
    const interval = setInterval(fetchIndexInfo, 30000);
    return () => clearInterval(interval);
  }, [ticker]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!index) return <div>Loading...</div>;

  const formatNumber = (value, decimals = 2) =>
    typeof value === "number" ? value.toFixed(decimals) : value;

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{index.symbol}</h2>
        <span className="text-sm bg-gray-700 px-2 py-1 rounded">Index</span>
      </div>

      <div className="mt-2">
        <span className="text-3xl font-bold text-green-400">
          {formatNumber(index.price)}
        </span>
        <span
          className={`ml-2 text-sm ${
            index.change >= 0 ? "text-green-300" : "text-red-300"
          }`}
        >
          {formatNumber(index.change)} ({formatNumber(index.percentage_change)}%)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
        <p>📈 Open: <span className="text-gray-300">{formatNumber(index.open)}</span></p>
        <p>📊 High: <span className="text-gray-300">{formatNumber(index.high)}</span></p>
        <p>📉 Low: <span className="text-gray-300">{formatNumber(index.low)}</span></p>
        <p>📊 Volume: <span className="text-gray-300">{index.volume?.toLocaleString() || "N/A"}</span></p>
        <p>📈 Change: <span className="text-gray-300">{formatNumber(index.change) || "N/A"}</span></p>
        <p>📊 Percentage Change: <span className="text-gray-300">{formatNumber(index.percentage_change) || "N/A"}</span></p>
        <p>💰 52WeekHigh: <span className="text-gray-300">{formatNumber(index.high_52wk) || "N/A"}</span></p>
        <p>📈 52WeekLow: <span className="text-gray-300">{formatNumber(index.low_52wk) || "N/A"}</span></p>
      </div>

      <p className="text-gray-500 text-xs mt-4">⏳ Last Updated: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default IndicesInfo;
