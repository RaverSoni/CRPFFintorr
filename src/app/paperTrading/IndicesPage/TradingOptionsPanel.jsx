"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const TradingOptionsPanel = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "^NSEI"; // Default Nifty 50
  const exchange = searchParams.get("exchange") || "NSE"; // Default NSE
  const [optionsData, setOptionsData] = useState({ callOptions: [], putOptions: [] });
  const [marketData, setMarketData] = useState(null);
  const [expiryDates, setExpiryDates] = useState([]);
  const [selectedExpiry, setSelectedExpiry] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * 🔹 Fetch Available Expiry Dates
   */
  useEffect(() => {
    const fetchExpiryDates = async () => {
      try {
        const response = await fetch(`/apiii/OptionsIndices?ticker=${ticker}&exchange=${exchange}`);
        const data = await response.json();
        if (data.expiryDate) {
          setExpiryDates([data.expiryDate]);
          setSelectedExpiry(data.expiryDate);
        }
      } catch (err) {
        console.error("❌ Error fetching expiry dates:", err);
      }
    };

    fetchExpiryDates();
  }, [ticker, exchange]);

  /**
   * 🔹 Fetch Options Data for Selected Expiry Date
   */
  useEffect(() => {
    const fetchOptionsData = async () => {
      if (!selectedExpiry) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/apiii/OptionsIndices?ticker=${ticker}&exchange=${exchange}`);
        if (!response.ok) throw new Error("Failed to fetch options data");

        const data = await response.json();
        if (!data.callOptions.length && !data.putOptions.length) {
          setError("No options data available for this index.");
        } else {
          setOptionsData({ callOptions: data.callOptions, putOptions: data.putOptions });
          setMarketData(data.marketData);
        }
      } catch (err) {
        setError("Error fetching options data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOptionsData();
  }, [ticker, selectedExpiry, exchange]);

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{ticker} Options Chain</h2>
        <select
          className="bg-gray-800 text-white p-2 rounded"
          value={selectedExpiry}
          onChange={(e) => setSelectedExpiry(e.target.value)}
        >
          <option value="">Select Expiry</option>
          {expiryDates.map((date, index) => (
            <option key={index} value={date}>{date}</option>
          ))}
        </select>
      </div>

      {/* Market Data */}
      {marketData && (
        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <p>📈 Open: <span className="text-white">{marketData.open}</span></p>
          <p>📉 Previous Close: <span className="text-white">{marketData.prevClose}</span></p>
          <p>📊 Spot Price: <span className="text-white">{marketData.spotPrice}</span></p>
        </div>
      )}

      {/* Option Chain */}
      {loading ? (
        <p className="text-gray-500">Loading options data...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="col-span-1 text-gray-400">Call Price</div>
          <div className="col-span-1 text-gray-400 text-center">Strike Price</div>
          <div className="col-span-1 text-gray-400 text-right">Put Price</div>

          {optionsData.callOptions.map((callOption, index) => {
            const putOption = optionsData.putOptions[index] || {};
            return (
              <React.Fragment key={index}>
                <div className="col-span-1 text-left">
                  <span className="text-green-400">₹{callOption.price}</span>
                </div>
                <div className="col-span-1 flex justify-center">
                  <button className="bg-gray-800 px-3 py-1 rounded text-white hover:bg-blue-500 transition">
                    {callOption.strike}
                  </button>
                </div>
                <div className="col-span-1 text-right">
                  <span className="text-red-400">₹{putOption.price || "--"}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TradingOptionsPanel;
