"use client";
import React, { useState, useEffect } from "react";
import styles from "./StockPage.module.css";

const StockPage = () => {
  const [stocksData, setStocksData] = useState([]);
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [view, setView] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const stocksPerPage = 20;
  const volumeThreshold = 1000000;

  const fetchStockData = async () => {
    const url = `/api/stock_data/?page=${currentPage}&per_page=${stocksPerPage}&volume_threshold=${volumeThreshold}`;
    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch stock data");
      const data = await response.json();

      setStocksData(data.stocks || []);
      setTrendingStocks(data.trending_stocks || []);
      setTotalPages(data.total_pages || 1);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [currentPage, view]);

  const displayedStocks = view === "all" ? stocksData : trendingStocks;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Stock Dashboard</h1>
      </div>

      <div className={styles.toggleButtons}>
        <button
          className={`${styles.button} ${view === "all" ? styles.activeButton : styles.inactiveButton}`}
          onClick={() => {
            setView("all");
            setCurrentPage(1);
          }}
        >
          All Stocks
        </button>
        <button
          className={`${styles.button} ${view === "trending" ? styles.activeButton : styles.inactiveButton}`}
          onClick={() => {
            setView("trending");
            setCurrentPage(1);
          }}
        >
          Trending Stocks
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className={styles.error}>Error: {error}</div>
      ) : (
        <div className={styles.stockTableContainer}>
          <table className={styles.stockTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Ticker</th>
                <th>Price</th>
                <th>Change (%)</th>
                <th>Volume (Lakhs)</th>
                <th>Avg Volume</th>
                <th>Market Cap (Crores)</th>
                <th>P/E Ratio</th>
                <th>52W High</th>
                <th>52W Low</th>
              </tr>
            </thead>
            <tbody>
              {displayedStocks.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.name}</td>
                  <td>{stock.ticker}</td>
                  <td>{stock.price ? stock.price.toFixed(2) : "N/A"}</td>
                  <td style={{ color: stock.change > 0 ? "#0FEDBE" : "#F63C6B" }}>
                    {stock.change ? stock.change.toFixed(2) : "N/A"}%
                  </td>
                  <td>{stock.volume ? stock.volume.toLocaleString() : "N/A"}</td>
                  <td>{stock.avg_volume ? stock.avg_volume.toLocaleString() : "N/A"}</td>
                  <td>{stock.market_cap ? stock.market_cap.toLocaleString() : "N/A"}</td>
                  <td>{stock.pe_ratio || "N/A"}</td>
                  <td>{stock.high_52wk || "N/A"}</td>
                  <td>{stock.low_52wk || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`${styles.pageButton} ${currentPage === index + 1 ? styles.activePageButton : ""}`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StockPage;



































// "use client";
// import React, { useState } from "react";
// import Link from "next/link";
// import styles from './StockPage.module.css';

// const StockPage = () => {
//   const [view, setView] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const stocksPerPage = 5; // Change this to display more or fewer stocks per page

//   const allStocks = [
//     { name: "Apple", symbol: "AAPL", price: 180.34, change: "+1.12%", volume: "75M", avgVolume: "70M", marketCap: "2.4T", peRatio: "30", high52wk: "182", low52wk: "120" },
//     { name: "Amazon", symbol: "AMZN", price: 130.11, change: "-0.24%", volume: "55M", avgVolume: "50M", marketCap: "1.3T", peRatio: "40", high52wk: "150", low52wk: "100" },
//     { name: "Tesla", symbol: "TSLA", price: 250.34, change: "+3.45%", volume: "90M", avgVolume: "80M", marketCap: "800B", peRatio: "75", high52wk: "300", low52wk: "200" },
//     { name: "Nvidia", symbol: "NVDA", price: 420.12, change: "+4.12%", volume: "100M", avgVolume: "95M", marketCap: "1.2T", peRatio: "60", high52wk: "500", low52wk: "350" },
//     // Add more stocks as needed
//   ];

//   const trendingStocks = [
//     { name: "Meta", symbol: "META", price: 300.12, change: "+2.45%", volume: "80M", avgVolume: "75M", marketCap: "900B", peRatio: "25", high52wk: "350", low52wk: "250" },
//     { name: "Microsoft", symbol: "MSFT", price: 320.44, change: "+1.12%", volume: "65M", avgVolume: "60M", marketCap: "2.2T", peRatio: "35", high52wk: "350", low52wk: "280" },
//     // Add more trending stocks
//   ];

//   const stocksToDisplay = view === "all" ? allStocks : trendingStocks;
//   const indexOfLastStock = currentPage * stocksPerPage;
//   const indexOfFirstStock = indexOfLastStock - stocksPerPage;
//   const currentStocks = stocksToDisplay.slice(indexOfFirstStock, indexOfLastStock);

//   const handleStockClick = (symbol) => {
//     // Redirect to a detailed stock page (dynamic route can be based on the stock symbol)
//     // Uncomment the below line when `router` is imported
//     // router.push(`/stocks/${symbol}`);
//   };

//   const totalPages = Math.ceil(stocksToDisplay.length / stocksPerPage);

//   return (
//     <div className={`${styles.container}`}>
//       <div className={`${styles.header}`}>
//         <h1 className={styles.title}>Stocks</h1>
//       </div>

//       {/* Toggle between All and Trending */}
//       <div className={styles.toggleButtons}>
//         <button
//           className={`${styles.button} ${
//             view === "all" ? styles.activeButton : styles.inactiveButton
//           }`}
//           onClick={() => {
//             setView("all");
//             setCurrentPage(1); // Reset to first page
//           }}
//         >
//           All Stocks
//         </button>
//         <button
//           className={`${styles.button} ${
//             view === "trending" ? styles.activeButton : styles.inactiveButton
//           }`}
//           onClick={() => {
//             setView("trending");
//             setCurrentPage(1); // Reset to first page
//           }}
//         >
//           Trending Stocks
//         </button>
//       </div>

//       {/* Stock Table */}
//       <div className={styles.stockTableContainer}>
//         <table className={styles.stockTable}>
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Symbol</th>
//               <th>Price</th>
//               <th>Change</th>
//               <th>Volume</th>
//               <th>Avg Volume</th>
//               <th>Market Cap</th>
//               <th>P/E Ratio</th>
//               <th>52-Week High</th>
//               <th>52-Week Low</th>
//               <th></th> {/* For the dropdown menu */}
//             </tr>
//           </thead>
//           <tbody>
//             {currentStocks.map((stock, index) => (
//               <tr
//                 key={index}
//                 onClick={() => handleStockClick(stock.symbol)}
//                 className={styles.stockRow} 
//               >
//                 <td>{stock.name}</td>
//                 <td>{stock.symbol}</td>
//                 <td>{stock.price}</td>
//                 <td
//                   style={{
//                     color: stock.change.startsWith("-") ? "#F63C6B" : "#0FEDBE",
//                   }}
//                 >
//                   {stock.change}
//                 </td>
//                 <td>{stock.volume}</td>
//                 <td>{stock.avgVolume}</td>
//                 <td>{stock.marketCap}</td>
//                 <td>{stock.peRatio}</td>
//                 <td>{stock.high52wk}</td>
//                 <td>{stock.low52wk}</td>
//                 <td className={styles.menuContainer}>
//                   <div className={styles.threeDots}>&#8226;&#8226;&#8226;</div>
//                   <div className={styles.dropdownMenu}>
//                     <button>Technical Analysis</button>
//                     <button>Fundamental Analysis</button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className={styles.pagination}>
//         {Array.from({ length: totalPages }, (_, index) => (
//           <button
//             key={index}
//             className={`${styles.pageButton} ${currentPage === index + 1 ? styles.activePageButton : ''}`}
//             onClick={() => setCurrentPage(index + 1)}
//           >
//             {index + 1}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default StockPage;

"use client";
import React, { useState, useEffect } from "react";
import styles from "./StockPage.module.css";

const StockPage = () => {
  const [stocksData, setStocksData] = useState([]); // All stocks data
  const [trendingStocks, setTrendingStocks] = useState([]); // Trending stocks
  const [view, setView] = useState("all"); // View: "all" or "trending"
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [totalPages, setTotalPages] = useState(1); // Total pages

  const stocksPerPage = 20; // Number of stocks per page
  const volumeThreshold = 1000000; // Threshold for trending stocks

  // Fetch stock data from API
  const fetchStockData = async () => {
    const url = `/api/stock_data/?page=${currentPage}&per_page=${stocksPerPage}&volume_threshold=${volumeThreshold}`;

    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch stock data");
      const data = await response.json();

      setStocksData(data.stocks || []);
      setTrendingStocks(data.trending_stocks || []);
      setTotalPages(data.total_pages || 1);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [currentPage, view]);

  // Get stocks based on selected view
  const displayedStocks = view === "all" ? stocksData : trendingStocks;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Stock Dashboard</h1>
      </div>

      {/* Toggle View: All vs. Trending */}
      <div className={styles.toggleButtons}>
        <button
          className={`${styles.button} ${view === "all" ? styles.activeButton : styles.inactiveButton}`}
          onClick={() => {
            setView("all");
            setCurrentPage(1);
          }}
        >
          All Stocks
        </button>
        <button
          className={`${styles.button} ${view === "trending" ? styles.activeButton : styles.inactiveButton}`}
          onClick={() => {
            setView("trending");
            setCurrentPage(1);
          }}
        >
          Trending Stocks
        </button>
      </div>

      {/* Loading & Error Handling */}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className={styles.error}>Error: {error}</div>
      ) : (
        <div className={styles.stockTableContainer}>
          <table className={styles.stockTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Ticker</th>
                <th>Price</th>
                <th>Change (%)</th>
                <th>Volume (Lakhs)</th>
                <th>Avg Volume</th>
                <th>Market Cap (Crores)</th>
                <th>P/E Ratio</th>
                <th>52W High</th>
                <th>52W Low</th>
              </tr>
            </thead>
            <tbody>
              {displayedStocks.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.name}</td>
                  <td>{stock.ticker}</td>
                  <td>{stock.price ? stock.price.toFixed(2) : "N/A"}</td>
                  <td style={{ color: stock.change > 0 ? "#0FEDBE" : "#F63C6B" }}>
                    {stock.change ? stock.change.toFixed(2) : "N/A"}%
                  </td>
                  <td>{stock.volume ? stock.volume.toLocaleString() : "N/A"}</td>
                  <td>{stock.avg_volume ? stock.avg_volume.toLocaleString() : "N/A"}</td>
                  <td>{stock.market_cap ? stock.market_cap.toLocaleString() : "N/A"}</td>
                  <td>{stock.pe_ratio || "N/A"}</td>
                  <td>{stock.high_52wk || "N/A"}</td>
                  <td>{stock.low_52wk || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`${styles.pageButton} ${currentPage === index + 1 ? styles.activePageButton : ""}`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StockPage;









"use client";
import React, { useState, useEffect } from "react";
import styles from "./StockPage.module.css";

const StockPage = () => {
  const [stocksData, setStocksData] = useState([]); // All stocks data
  const [trendingStocks, setTrendingStocks] = useState([]); // Trending stocks
  const [view, setView] = useState("all"); // View: "all" or "trending"
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [totalPages, setTotalPages] = useState(1); // Total pages

  const stocksPerPage = 10; // Stocks per page
  const volumeThreshold = 1000000; // Volume threshold for trending stocks

  // Fetch stock data from the API
  const fetchStockData = async () => {
    const url = `http://127.0.0.1:8000/api/stock_data/?page=${currentPage}&per_page=${stocksPerPage}&volume_threshold=${volumeThreshold}`;
    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch stock data");
      const data = await response.json();

      setStocksData(data.stocks || []);
      setTrendingStocks(data.trending_stocks || []);
      setTotalPages(data.total_pages || 1);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [currentPage, view]);

  // Get the current view's stocks
  const displayedStocks = view === "all" ? stocksData : trendingStocks;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Stock Dashboard</h1>
      </div>

      {/* Toggle View: All vs. Trending */}
      <div className={styles.toggleButtons}>
        <button
          className={`${styles.button} ${view === "all" ? styles.activeButton : styles.inactiveButton}`}
          onClick={() => setView("all")}
        >
          All Stocks
        </button>
        <button
          className={`${styles.button} ${view === "trending" ? styles.activeButton : styles.inactiveButton}`}
          onClick={() => setView("trending")}
        >
          Trending Stocks
        </button>
      </div>

      {/* Loading and Error Handling */}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : displayedStocks.length === 0 ? (
        <div>No stocks found for this selection.</div>
      ) : (
        <div className={styles.stockTableContainer}>
          <table className={styles.stockTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Ticker</th>
                <th>Price</th>
                <th>Change (%)</th>
                <th>Volume</th>
                <th>Avg Volume</th>
                <th>Market Cap</th>
                <th>P/E Ratio</th>
                <th>52W High</th>
                <th>52W Low</th>
              </tr>
            </thead>
            <tbody>
              {displayedStocks.map((stock, index) => (
                <tr key={index}>
                  <td>{stock.name}</td>
                  <td>{stock.ticker}</td>
                  <td>{stock.price ? stock.price.toFixed(2) : "N/A"}</td>
                  <td style={{ color: stock.change > 0 ? "#0FEDBE" : "#F63C6B" }}>
                    {stock.change ? stock.change.toFixed(2) : "N/A"}%
                  </td>
                  <td>{stock.volume ? stock.volume.toLocaleString() : "N/A"}</td>
                  <td>{stock.avg_volume ? stock.avg_volume.toLocaleString() : "N/A"}</td>
                  <td>{stock.market_cap ? stock.market_cap.toLocaleString() : "N/A"}</td>
                  <td>{stock.pe_ratio || "N/A"}</td>
                  <td>{stock.high_52wk || "N/A"}</td>
                  <td>{stock.low_52wk || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`${styles.pageButton} ${currentPage === index + 1 ? styles.activePageButton : ""}`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StockPage;
