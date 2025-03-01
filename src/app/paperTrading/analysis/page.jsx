"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AiOutlineDownload, AiOutlineStock } from "react-icons/ai";

const AnalysisContent = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT"; // ✅ Default to MSFT if ticker not found

  const [analysisData, setAnalysisData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/fundamentals/${ticker}/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setAnalysisData(data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching analysis data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [ticker]);

  // ✅ Convert JSON to CSV Format
  const convertToCSV = (data) => {
    if (!data || Object.keys(data).length === 0) return "";

    const rows = [];
    const headers = Object.keys(data);
    rows.push(headers.join(",")); // Convert headers to CSV row

    const values = headers.map((key) =>
      typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key]
    );
    rows.push(values.join(",")); // Convert values to CSV row

    return rows.join("\n");
  };

  // ✅ Download CSV File
  const downloadCSV = () => {
    const csvContent = convertToCSV(analysisData);
    if (!csvContent) {
      alert("No data available for download.");
      return;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${ticker}_analysis.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading analysis data...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">⚠️ {error}</p>;
  }

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-3xl font-bold flex items-center">
        <AiOutlineStock className="mr-2 text-blue-400" />
        Analysis - {ticker}
      </h1>

      {/* 📌 Download Button */}
      <button
        onClick={downloadCSV}
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
      >
        <AiOutlineDownload className="mr-2" /> Download CSV
      </button>

      {/* 📊 Display Data */}
      <div className="mt-6 bg-gray-900 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-400">🔹 Summary</h2>
        <p>Market Cap: ₹{analysisData.overview?.market_cap?.toLocaleString() || "N/A"}</p>
        <p>P/E Ratio: {analysisData.overview?.pe_ratio || "N/A"}</p>
        <p>Dividend Yield: {analysisData.overview?.div_yield ? `${analysisData.overview.div_yield}%` : "N/A"}</p>
      </div>
    </div>
  );
};

// ✅ Fix: Wrap in Suspense for useSearchParams()
const Analysis = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <AnalysisContent />
    </Suspense>
  );
};

export default Analysis;