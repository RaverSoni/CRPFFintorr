"use client";
import React, { useState, useEffect } from "react";
import styles from "./StockPage.module.css";

const Page = () => {
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
        <h1 className={styles.title}>Stock List</h1>
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

export default Page;

































"use client";
import React, { useState, useEffect } from "react";
import styles from './StockPage.module.css';

const StockPage = () => {
  const [stocksData, setStocksData] = useState([]); // All stocks data
  const [trendingStocks, setTrendingStocks] = useState([]); // Trending stocks
  const [view, setView] = useState("all"); // View: "all" or "trending"
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state

  const stocksPerPage = 10; // Stocks per page
  const volumeThreshold = 1000000; // Volume threshold for trending stocks

  // Fetch stock data from the API
  const fetchData = async () => {
    const url = `http://127.0.0.1:8000/api/stock_data/?page=${currentPage}&per_page=${stocksPerPage}&volume_threshold=${volumeThreshold}`;

    try {
      setLoading(true);
      const response = await fetch(url);
      const data = await response.json();

      console.log("Received Data: ", data); // Debugging data
      if (data.stocks && data.trending_stocks) {
        setStocksData(data.stocks);
        setTrendingStocks(data.trending_stocks);
        setError(null);
      } else {
        setError("Invalid data format received from the server");
      }
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error: ", err); // Log fetch errors
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Optionally, set up polling to fetch data every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval); // Cleanup
  }, [currentPage]);

  const displayedStocks = view === "all" ? stocksData : trendingStocks;

  const totalPages = Math.ceil(
    (view === "all" ? stocksData.length : trendingStocks.length) / stocksPerPage
  );

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
      ) : (
        <div className={styles.stockTableContainer}>
          <table className={styles.stockTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Ticker</th>
                <th>Price</th>
                <th>Open Price</th>
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
              {displayedStocks.slice(0, stocksPerPage).map((stock, index) => (
                <tr key={index}>
                  <td>{stock.name}</td>
                  <td>{stock.ticker}</td>
                  <td>{stock.price ? stock.price.toFixed(2) : "N/A"}</td>
                  <td>{stock.open_price ? stock.open_price.toFixed(2) : "N/A"}</td>
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
            className={`${styles.pageButton} ${currentPage === index + 1 ? styles.activePageButton : ''}`}
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

const Page = () => {
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

  const displayedStocks = view === "all" ? stocksData : trendingStocks;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Stock List</h1>
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

export default Page;
