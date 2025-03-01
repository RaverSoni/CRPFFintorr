// 'use client';
// import React, { useEffect, useState } from 'react';

// const News = () => {
//   const [newsTitle, setNewsTitle] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       // Simulated network request
//       const title = [
//         {
//           id: 1,
//           ticker:'AAPL',
//           title: "Trucking group leader calls for political intervention amid ongoing port strike"
//         },
//         {
//           id: 2,
//           ticker:'TSLA',
//           title: "US offers EVgo conditional $1.05 billion loan for EV chargers"
//         },
//         {
//           id: 3,
//           ticker:'RELA',
//           title: "US announces new EVgo loan for EV chargers"
//         },
//         {
//           id: 4,
//           ticker:'GOOGL',
//           title: "Why Kamala Harris says we need a national reserve for critical minerals"
//         }
//       ];

//       setNewsTitle(title);
//     };

//     fetchData();
//   }, []);


//   return (
//     <div className="flex flex-row justify-start hover:scale-105 duration-300 ease-in">
//       <div className="flex flex-col ml-10 mr-10 mt-5 bg-[#16181B] h-80 w-full rounded-lg p-3 shadow-lg overflow-hidden">
//         {newsTitle.slice(0,3).map((newsItem) => (
//           <>
//           <div key={newsItem.id} className='text-white font-semibold text-xl p-3 border-b border-[#2b2b32]'>
//             {newsItem.title}
//             <div className='text-white text-[1rem] font-normal border border-[#2b2b32] rounded-xl'>
//               {newsItem.ticker}
//             </div>
//           </div>
//           </>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default News;

"use client";
import React, { useEffect, useState, useCallback } from "react";
import { AiOutlineGlobal, AiOutlineStock } from "react-icons/ai"; // ✅ Icons

const News = () => {
  const [newsTitle, setNewsTitle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch News Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://127.0.0.1:8000/api/stock-news/");

      if (!response.ok) {
        throw new Error("Failed to fetch stock news.");
      }

      const data = await response.json();
      if (!data.news || data.news.length === 0) {
        setError("⚠️ No stock news available.");
      }

      setNewsTitle(data.news || []);
    } catch (error) {
      console.error("❌ Error fetching news:", error);
      setError("⚠️ Failed to load news. Try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // ✅ Initial Fetch
    const interval = setInterval(fetchData, 300000); // ✅ Refresh every 5 minutes
    return () => clearInterval(interval); // ✅ Cleanup interval on unmount
  }, [fetchData]);

  return (
    <div className="flex flex-row justify-start hover:scale-105 duration-300 ease-in">
      <div className="flex flex-col ml-10 mr-10 mt-5 bg-[#16181B] h-80 w-full rounded-lg p-4 shadow-lg overflow-hidden">
        {/* ✅ Header */}
        <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <AiOutlineGlobal className="mr-2 text-blue-300" /> Market News
          </h2>
        </div>

        {/* ✅ News Content */}
        {loading ? (
          <p className="text-gray-400 text-center mt-5">Loading latest news...</p>
        ) : error ? (
          <p className="text-red-400 text-center mt-5">{error}</p>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar">
            {newsTitle.map((newsItem, index) => (
              <div
                key={index}
                className="text-white font-semibold text-lg p-3 border-b border-[#2b2b32] hover:bg-gray-800 transition-all duration-200 rounded-lg"
              >
                <a
                  href={newsItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-blue-400 transition-all duration-200"
                >
                  {newsItem.title}
                </a>
                <div className="flex items-center mt-2 px-2 py-1 bg-gray-800 text-white text-sm font-normal border border-[#2b2b32] rounded-xl">
                  <AiOutlineStock className="mr-2 text-yellow-400" />
                  {newsItem.ticker}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;