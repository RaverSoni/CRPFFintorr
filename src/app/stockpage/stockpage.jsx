"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation
import styles from "./StockPage.module.css";

const StockPage = () => {
  const router = useRouter(); // Router for navigation
  const [stocksData, setStocksData] = useState([]); // All stocks data
  const [trendingStocks, setTrendingStocks] = useState([]); // Trending stocks
  const [view, setView] = useState("all"); // View: "all" or "trending"
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [totalPages, setTotalPages] = useState(1); // Total pages
  const [visiblePages, setVisiblePages] = useState(20); // Number of pages to show at a time

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

  // Function to navigate to PaperTrading with the selected ticker
  const handleStockClick = (ticker) => {
    router.push(`/paperTrading?ticker=${ticker}`);
  };

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
                  <td>
                    <button className={styles.stockButton} onClick={() => handleStockClick(stock.ticker)}>
                      {stock.name}
                    </button>
                  </td>
                  <td>
                    <button className={styles.stockButton} onClick={() => handleStockClick(stock.ticker)}>
                      {stock.ticker}
                    </button>
                  </td>
                  <td>{stock.price ? Number(stock.price).toFixed(2) : "N/A"}</td>
                  <td style={{ color: stock.change > 0 ? "#0FEDBE" : "#F63C6B" }}>
                    {stock.change ? Number(stock.change).toFixed(2) : "N/A"}%
                  </td>
                  <td>{stock.volume ? Number(stock.volume).toLocaleString() : "N/A"}</td>
                  <td>{stock.avg_volume ? Number(stock.avg_volume).toLocaleString() : "N/A"}</td>
                  <td>{stock.market_cap ? Number(stock.market_cap).toLocaleString() : "N/A"}</td>
                  <td>{stock.pe_ratio ? Number(stock.pe_ratio).toFixed(2) : "N/A"}</td>
                  <td>{stock.high_52wk ? Number(stock.high_52wk).toFixed(2) : "N/A"}</td>
                  <td>{stock.low_52wk ? Number(stock.low_52wk).toFixed(2) : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Section */}
      <div className={styles.paginationContainer}>
        <div className={styles.paginationGrid}>
          {Array.from({ length: Math.min(visiblePages, totalPages) }, (_, index) => (
            <button
              key={index + 1}
              className={`${styles.pageButton} ${currentPage === index + 1 ? styles.activePageButton : ""}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {visiblePages < totalPages && (
          <button
            className={styles.moreButton}
            onClick={() => setVisiblePages((prev) => Math.min(prev + 20, totalPages))}
          >
            More
          </button>
        )}
      </div>
    </div>
  );
};

export default StockPage;
