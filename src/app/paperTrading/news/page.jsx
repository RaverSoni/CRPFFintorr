"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AiOutlineGlobal, AiOutlineStock, AiOutlineLink } from "react-icons/ai";

const NewsContent = () => {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker") || "MSFT"; // ✅ Default to MSFT if no ticker is found

  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/news?ticker=${ticker}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (data.error) {
          throw new Error(`API Error: ${data.error}`);
        }

        setNewsData(data.news || []);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching news:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNews();
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
    
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">⚠️ {error}</p>;
  }

  return (
    <div className="bg-black text-white p-6 min-h-screen">
      <h1 className="text-3xl font-bold flex items-center">
        <AiOutlineGlobal className="mr-2 text-yellow-400" />
        Latest Stock News
      </h1>
      <p className="text-sm text-gray-400 mt-2">
        <AiOutlineStock className="mr-1 inline text-blue-400" /> Showing news for:{" "}
        <span className="font-semibold">{ticker}</span>
      </p>

      {/* 📌 News List */}
      {newsData.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsData.map((newsItem) => (
            <div key={newsItem.id} className="bg-gray-900 p-4 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold">{newsItem.title}</h2>
              <p className="text-sm text-gray-400">📰 {newsItem.ticker}</p>
              <a
                href={newsItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 flex items-center mt-2"
              >
                <AiOutlineLink className="mr-1" /> Read More
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 mt-4">No news available for {ticker}.</p>
      )}
    </div>
  );
};

const News = () => {
  return (
    <Suspense >
      <NewsContent />
    </Suspense>
  );
};

export default News;