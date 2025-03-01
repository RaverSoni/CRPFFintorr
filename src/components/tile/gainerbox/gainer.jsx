// "use client";

// import React, { useState, useEffect } from 'react';
// import styles from './GainerBox.module.css';

// const StockBox = () => {
//   const [stocks, setStocks] = useState([]);

//   // We have to Fetch stock data from API endpoint here
//   useEffect(() => {
//     const fetchStockData = async () => {
//       const stockData = [
//         {
//           name: 'AAPL',
//           fullName: 'Apple Inc.',
//           price: '150.25',
//           change: '+1.25',
//           changePercent: '+0.84%',
//           peRatio: '28.34',
//           dayChart: 'path_to_chart_image_1'
//         },
//         {
//           name: 'GOOGL',
//           fullName: 'Alphabet Inc.',
//           price: '2734.79',
//           change: '-12.56',
//           changePercent: '-0.45%',
//           peRatio: '35.12',
//           dayChart: 'path_to_chart_image_2'
//         },
//         {
//           name: 'TSLA',
//           fullName: 'Tesla Inc.',
//           price: '680.99',
//           change: '-5.34',
//           changePercent: '-0.78%',
//           peRatio: '54.67',
//           dayChart: 'path_to_chart_image_3'
//         },
//         {
//           name: 'AMZN',
//           fullName: 'Amazon.com Inc.',
//           price: '3321.12',
//           change: '+20.12',
//           changePercent: '+0.61%',
//           peRatio: '61.78',
//           dayChart: 'path_to_chart_image_4'
//         }
//       ];
//       setStocks(stockData);
//     };

//     fetchStockData();
//   }, []);

//   return (
//     <div className={styles.container}>
//       <h1 className="text-3xl m-5 font-bold">Top Gainers</h1>
//       <div className={styles.box}>
//         <table className={styles.stockTable}>
//           <thead>
//             <tr>
//               <th>Stock Name</th>
//               <th>Price</th>
//               <th>Change</th>
//               <th>Change %</th>
//               <th>P/E Ratio</th>
//               <th>Day Chart</th>
//             </tr>
//           </thead>
//           <tbody>
//             {stocks.slice(0, 2).map((stock, index) => (
//               <tr key={index}>
//                 <td>{stock.name}<br/><span>{stock.fullName}</span></td>
//                 <td style={{ color: '#0FEDBE' }}>{stock.price}</td>
//                 <td style={{ color: stock.change.includes('-') ? '#F63C6B' : '#0FEDBE' }}>{stock.change}</td>
//                 <td>{stock.changePercent}</td>
//                 <td>{stock.peRatio}</td>
//                 <td>
//                   <img src={stock.dayChart} alt="Graph" className={styles.chart} />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <h1 className="text-3xl m-5 font-bold">Top Losers</h1>
//       <div className={styles.box}>
//         <table className={styles.stockTable}>
//           <thead>
//             <tr>
//               <th>Stock Name</th>
//               <th>Price</th>
//               <th>Change</th>
//               <th>Change %</th>
//               <th>P/E Ratio</th>
//               <th>Day Chart</th>
//             </tr>
//           </thead>
//           <tbody>
//             {stocks.slice(2, 4).map((stock, index) => (
//               <tr key={index}>
//                 <td>{stock.name}<br /><span>{stock.fullName}</span></td>
//                 <td style={{ color: '#F63C6B' }}>{stock.price}</td>
//                 <td style={{ color: stock.change.includes('-') ? '#F63C6B' : '#0FEDBE' }}>{stock.change}</td>
//                 <td>{stock.changePercent}</td>
//                 <td>{stock.peRatio}</td>
//                 <td>
//                   <img src={stock.dayChart} alt="Graph" className={styles.chart} />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default StockBox;

// "use client";

// import React, { useState, useEffect } from 'react';
// import styles from './GainerBox.module.css';

// const StockBox = () => {
//   const [gainers, setGainers] = useState([]); 
//   const [losers, setLosers] = useState([]); 
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchData = () => {
//     fetch('http://127.0.0.1:8000/api/update_gainers_losers/')
//       .then(response => response.json())
//       .then(data => {
//         console.log("Received Data: ", data); // Log the response for debugging
//         if (data.top_gainers && data.top_losers) {
//           setGainers(data.top_gainers);
//           setLosers(data.top_losers);
//         } else {
//           setError('Invalid data format received from the server');
//         }
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error("Fetch Error: ", error);  // Log any fetch errors
//         setError(error.message);
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchData(); 

//     // Set up polling to fetch data every 10 seconds
//     const interval = setInterval(fetchData, 10000);

//     return () => clearInterval(interval);  // Cleanup interval
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className={styles.container}>
//       {/* Error message */}
//       {error && <div className={styles.error}>{error}</div>}

//       {/* Top Gainers Section */}
//       <h1 className="text-3xl m-5 font-bold">Top Gainers</h1>
//       <div className={styles.box}>
//         <table className={styles.stockTable}>
//           <thead>
//             <tr>
//               <th>Stock Name</th>
//               <th>Price</th>
//               <th>Change</th>
//               <th>Change %</th>
//               <th>P/E Ratio</th>
//               <th>Day Chart</th>
//             </tr>
//           </thead>
//           <tbody>
//             {gainers.length > 0 ? (
//               gainers.map((stock, index) => (
//                 <tr key={index}>
//                   <td>{stock.symbol}</td>
//                   <td>{stock.price}</td>
//                   <td>{stock.change}</td>
//                   <td>{stock.percentage_change}</td>
//                   <td>{stock.pe_ratio}</td>
//                   <td>
//                   <img src={stock.dayChartImage} alt="Graph" className={styles.chart} />
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr><td colSpan="6">No gainers available</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Top Losers Section */}
//       <h1 className="text-3xl m-5 font-bold">Top Losers</h1>
//       <div className={styles.box}>
//         <table className={styles.stockTable}>
//           <thead>
//             <tr>
//               <th>Stock Name</th>
//               <th>Price</th>
//               <th>Change</th>
//               <th>Change %</th>
//               <th>P/E Ratio</th>
//               <th>Day Chart</th>
//             </tr>
//           </thead>
//           <tbody>
//             {losers.length > 0 ? (
//               losers.map((stock, index) => (
//                 <tr key={index}>
//                   <td>{stock.symbol}</td>
//                   <td>{stock.price}</td>
//                   <td>{stock.change}</td>
//                   <td>{stock.percentage_change}</td>
//                   <td>{stock.pe_ratio}</td>
//                   <td><img src={stock.dayChart} alt="Graph" /></td>
//                 </tr>
//               ))
//             ) : (
//               <tr><td colSpan="6">No losers available</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };
// export default StockBox;

// "use client";
// import React, { useState, useEffect } from "react";

// const Gainers = () => {
//   const [gainers, setGainers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchGainers = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/update_gainers_losers/");
//         const data = await response.json();
//         setGainers(data.gainers || []); // Ensure data structure
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchGainers();
//   }, []);

//   return (
//     <div className="bg-gray-900 p-4 rounded-lg shadow-md w-full">
//       <h2 className="text-lg font-semibold text-green-400">Top Gainers</h2>
//       {loading ? (
//         <p className="text-gray-400">Loading...</p>
//       ) : error ? (
//         <p className="text-red-400">{error}</p>
//       ) : (
//         <table className="w-full text-white">
//           <thead>
//             <tr className="border-b border-gray-700">
//               <th className="p-2 text-left">Stock</th>
//               <th className="p-2">Price</th>
//               <th className="p-2">Change (%)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {gainers.map((stock) => (
//               <tr key={stock.ticker} className="border-b border-gray-700">
//                 <td className="p-2">{stock.name} ({stock.ticker})</td>
//                 <td className="p-2">${stock.price.toFixed(2)}</td>
//                 <td className="p-2 text-green-400">{stock.change.toFixed(2)}%</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Gainers;

// "use client";
// import React, { useState, useEffect } from "react";

// const Gainers = () => {
//   const [gainers, setGainers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchGainers = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/update_gainers_losers/");
//         const data = await response.json();

//         if (data.top_gainers) {
//           setGainers(data.top_gainers);
//         } else {
//           setError("No gainers found.");
//         }
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchGainers();
//   }, []);

//   return (
//     <div className="bg-gray-900 p-4 rounded-lg shadow-md w-full">
//       <h2 className="text-lg font-semibold text-green-400">Top Gainers</h2>
//       {loading ? (
//         <p className="text-gray-400">Loading...</p>
//       ) : error ? (
//         <p className="text-red-400">{error}</p>
//       ) : (
//         <table className="w-full text-white">
//           <thead>
//             <tr className="border-b border-gray-700">
//               <th className="p-2 text-left">Stock</th>
//               <th className="p-2">Price</th>
//               <th className="p-2">Change (%)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {gainers.map((stock) => (
//               <tr key={stock.symbol} className="border-b border-gray-700">
//                 <td className="p-2">{stock.name} ({stock.symbol})</td>
//                 <td className="p-2">${stock.price ? stock.price.toFixed(2) : "N/A"}</td>
//                 <td className="p-2 text-green-400">{stock.percentage_change ? stock.percentage_change.toFixed(2) : "N/A"}%</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Gainers;



// "use client";
// import React, { useState, useEffect } from "react";

// const Gainers = () => {
//   const [gainers, setGainers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchGainers = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/update_gainers_losers/");
//         const data = await response.json();

//         if (data.top_gainers && data.top_gainers.length > 0) {
//           setGainers([...data.top_gainers].sort((a, b) => b.percentage_change - a.percentage_change)); // Sort Gainers Correctly
//         } else {
//           setError("No gainers found.");
//         }
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchGainers();
//   }, []);

//   return (
//     <div className="bg-gray-900 p-4 rounded-lg shadow-md w-full">
//       <h2 className="text-lg font-semibold text-green-400">Top Gainers</h2>
//       {loading ? (
//         <p className="text-gray-400">Loading...</p>
//       ) : error ? (
//         <p className="text-red-400">{error}</p>
//       ) : (
//         <table className="w-full text-white">
//           <thead>
//             <tr className="border-b border-gray-700">
//               <th className="p-2 text-left">Stock</th>
//               <th className="p-2">Price</th>
//               <th className="p-2">Change</th>
//               <th className="p-2">Change (%)</th>
//               <th className="p-2">PE Ratio</th>
//               <th className="p-2">Day Chart</th>
//             </tr>
//           </thead>
//           <tbody>
//             {gainers.map((stock) => (
//               <tr key={stock.symbol} className="border-b border-gray-700">
//                 <td className="p-2">{stock.name} ({stock.symbol})</td>
//                 <td className="p-2">${stock.price ? stock.price.toFixed(2) : "N/A"}</td>
//                 <td className="p-2 text-green-400">{stock.change ? stock.change.toFixed(2) : "N/A"}</td>
//                 <td className="p-2 text-green-400">{stock.percentage_change ? stock.percentage_change.toFixed(2) : "N/A"}%</td>
//                 <td className="p-2">{typeof stock.pe_ratio === "number" ? stock.pe_ratio.toFixed(2) : "N/A"}</td>
//                 <td><img src={stock.dayChart} alt="Graph" className="w-16 h-10" /></td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Gainers;

// "use client";

// import React, { useState, useEffect } from 'react';
// import styles from './GainerBox.module.css';

// const StockBox = () => {
//   const [stocks, setStocks] = useState([]);

//   // We have to Fetch stock data from API endpoint here
//   useEffect(() => {
//     const fetchStockData = async () => {
//       const stockData = [
//         {
//           name: 'AAPL',
//           fullName: 'Apple Inc.',
//           price: '150.25',
//           change: '+1.25',
//           changePercent: '+0.84%',
//           peRatio: '28.34',
//           dayChart: 'path_to_chart_image_1'
//         },
//         {
//           name: 'GOOGL',
//           fullName: 'Alphabet Inc.',
//           price: '2734.79',
//           change: '-12.56',
//           changePercent: '-0.45%',
//           peRatio: '35.12',
//           dayChart: 'path_to_chart_image_2'
//         },
//         {
//           name: 'TSLA',
//           fullName: 'Tesla Inc.',
//           price: '680.99',
//           change: '-5.34',
//           changePercent: '-0.78%',
//           peRatio: '54.67',
//           dayChart: 'path_to_chart_image_3'
//         },
//         {
//           name: 'AMZN',
//           fullName: 'Amazon.com Inc.',
//           price: '3321.12',
//           change: '+20.12',
//           changePercent: '+0.61%',
//           peRatio: '61.78',
//           dayChart: 'path_to_chart_image_4'
//         }
//       ];
//       setStocks(stockData);
//     };

//     fetchStockData();
//   }, []);

//   return (
//     <div className={styles.container}>
//       <h1 className="text-3xl m-5 font-bold">Top Gainers</h1>
//       <div className={styles.box}>
//         <table className={styles.stockTable}>
//           <thead>
//             <tr>
//               <th>Stock Name</th>
//               <th>Price</th>
//               <th>Change</th>
//               <th>Change %</th>
//               <th>P/E Ratio</th>
//               <th>Day Chart</th>
//             </tr>
//           </thead>
//           <tbody>
//             {stocks.slice(0, 2).map((stock, index) => (
//               <tr key={index}>
//                 <td>{stock.name}<br/><span>{stock.fullName}</span></td>
//                 <td style={{ color: '#0FEDBE' }}>{stock.price}</td>
//                 <td style={{ color: stock.change.includes('-') ? '#F63C6B' : '#0FEDBE' }}>{stock.change}</td>
//                 <td>{stock.changePercent}</td>
//                 <td>{stock.peRatio}</td>
//                 <td>
//                   <img src={stock.dayChart} alt="Graph" className={styles.chart} />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <h1 className="text-3xl m-5 font-bold">Top Losers</h1>
//       <div className={styles.box}>
//         <table className={styles.stockTable}>
//           <thead>
//             <tr>
//               <th>Stock Name</th>
//               <th>Price</th>
//               <th>Change</th>
//               <th>Change %</th>
//               <th>P/E Ratio</th>
//               <th>Day Chart</th>
//             </tr>
//           </thead>
//           <tbody>
//             {stocks.slice(2, 4).map((stock, index) => (
//               <tr key={index}>
//                 <td>{stock.name}<br /><span>{stock.fullName}</span></td>
//                 <td style={{ color: '#F63C6B' }}>{stock.price}</td>
//                 <td style={{ color: stock.change.includes('-') ? '#F63C6B' : '#0FEDBE' }}>{stock.change}</td>
//                 <td>{stock.changePercent}</td>
//                 <td>{stock.peRatio}</td>
//                 <td>
//                   <img src={stock.dayChart} alt="Graph" className={styles.chart} />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default StockBox;

// "use client";

// import React, { useState, useEffect } from 'react';
// import styles from './GainerBox.module.css';

// const StockBox = () => {
//   const [gainers, setGainers] = useState([]); 
//   const [losers, setLosers] = useState([]); 
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchData = () => {
//     fetch('http://127.0.0.1:8000/api/update_gainers_losers/')
//       .then(response => response.json())
//       .then(data => {
//         console.log("Received Data: ", data); // Log the response for debugging
//         if (data.top_gainers && data.top_losers) {
//           setGainers(data.top_gainers);
//           setLosers(data.top_losers);
//         } else {
//           setError('Invalid data format received from the server');
//         }
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error("Fetch Error: ", error);  // Log any fetch errors
//         setError(error.message);
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchData(); 

//     // Set up polling to fetch data every 10 seconds
//     const interval = setInterval(fetchData, 10000);

//     return () => clearInterval(interval);  // Cleanup interval
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className={styles.container}>
//       {/* Error message */}
//       {error && <div className={styles.error}>{error}</div>}

//       {/* Top Gainers Section */}
//       <h1 className="text-3xl m-5 font-bold">Top Gainers</h1>
//       <div className={styles.box}>
//         <table className={styles.stockTable}>
//           <thead>
//             <tr>
//               <th>Stock Name</th>
//               <th>Price</th>
//               <th>Change</th>
//               <th>Change %</th>
//               <th>P/E Ratio</th>
//               <th>Day Chart</th>
//             </tr>
//           </thead>
//           <tbody>
//             {gainers.length > 0 ? (
//               gainers.map((stock, index) => (
//                 <tr key={index}>
//                   <td>{stock.symbol}</td>
//                   <td>{stock.price}</td>
//                   <td>{stock.change}</td>
//                   <td>{stock.percentage_change}</td>
//                   <td>{stock.pe_ratio}</td>
//                   <td>
//                   <img src={stock.dayChartImage} alt="Graph" className={styles.chart} />
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr><td colSpan="6">No gainers available</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Top Losers Section */}
//       <h1 className="text-3xl m-5 font-bold">Top Losers</h1>
//       <div className={styles.box}>
//         <table className={styles.stockTable}>
//           <thead>
//             <tr>
//               <th>Stock Name</th>
//               <th>Price</th>
//               <th>Change</th>
//               <th>Change %</th>
//               <th>P/E Ratio</th>
//               <th>Day Chart</th>
//             </tr>
//           </thead>
//           <tbody>
//             {losers.length > 0 ? (
//               losers.map((stock, index) => (
//                 <tr key={index}>
//                   <td>{stock.symbol}</td>
//                   <td>{stock.price}</td>
//                   <td>{stock.change}</td>
//                   <td>{stock.percentage_change}</td>
//                   <td>{stock.pe_ratio}</td>
//                   <td><img src={stock.dayChart} alt="Graph" /></td>
//                 </tr>
//               ))
//             ) : (
//               <tr><td colSpan="6">No losers available</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };
// export default StockBox;

// "use client";
// import React, { useState, useEffect } from "react";

// const Gainers = () => {
//   const [gainers, setGainers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchGainers = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/update_gainers_losers/");
//         const data = await response.json();
//         setGainers(data.gainers || []); // Ensure data structure
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchGainers();
//   }, []);

//   return (
//     <div className="bg-gray-900 p-4 rounded-lg shadow-md w-full">
//       <h2 className="text-lg font-semibold text-green-400">Top Gainers</h2>
//       {loading ? (
//         <p className="text-gray-400">Loading...</p>
//       ) : error ? (
//         <p className="text-red-400">{error}</p>
//       ) : (
//         <table className="w-full text-white">
//           <thead>
//             <tr className="border-b border-gray-700">
//               <th className="p-2 text-left">Stock</th>
//               <th className="p-2">Price</th>
//               <th className="p-2">Change (%)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {gainers.map((stock) => (
//               <tr key={stock.ticker} className="border-b border-gray-700">
//                 <td className="p-2">{stock.name} ({stock.ticker})</td>
//                 <td className="p-2">${stock.price.toFixed(2)}</td>
//                 <td className="p-2 text-green-400">{stock.change.toFixed(2)}%</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Gainers;

// "use client";
// import React, { useState, useEffect } from "react";

// const Gainers = () => {
//   const [gainers, setGainers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchGainers = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/update_gainers_losers/");
//         const data = await response.json();

//         if (data.top_gainers) {
//           setGainers(data.top_gainers);
//         } else {
//           setError("No gainers found.");
//         }
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchGainers();
//   }, []);

//   return (
//     <div className="bg-gray-900 p-4 rounded-lg shadow-md w-full">
//       <h2 className="text-lg font-semibold text-green-400">Top Gainers</h2>
//       {loading ? (
//         <p className="text-gray-400">Loading...</p>
//       ) : error ? (
//         <p className="text-red-400">{error}</p>
//       ) : (
//         <table className="w-full text-white">
//           <thead>
//             <tr className="border-b border-gray-700">
//               <th className="p-2 text-left">Stock</th>
//               <th className="p-2">Price</th>
//               <th className="p-2">Change (%)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {gainers.map((stock) => (
//               <tr key={stock.symbol} className="border-b border-gray-700">
//                 <td className="p-2">{stock.name} ({stock.symbol})</td>
//                 <td className="p-2">${stock.price ? stock.price.toFixed(2) : "N/A"}</td>
//                 <td className="p-2 text-green-400">{stock.percentage_change ? stock.percentage_change.toFixed(2) : "N/A"}%</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Gainers;



// "use client";
// import React, { useState, useEffect } from "react";

// const Gainers = () => {
//   const [gainers, setGainers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchGainers = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/update_gainers_losers/");
//         const data = await response.json();

//         if (data.top_gainers && data.top_gainers.length > 0) {
//           setGainers([...data.top_gainers].sort((a, b) => b.percentage_change - a.percentage_change)); // Sort Gainers Correctly
//         } else {
//           setError("No gainers found.");
//         }
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchGainers();
//   }, []);

//   return (
//     <div className="bg-gray-900 p-4 rounded-lg shadow-md w-full">
//       <h2 className="text-lg font-semibold text-green-400">Top Gainers</h2>
//       {loading ? (
//         <p className="text-gray-400">Loading...</p>
//       ) : error ? (
//         <p className="text-red-400">{error}</p>
//       ) : (
//         <table className="w-full text-white">
//           <thead>
//             <tr className="border-b border-gray-700">
//               <th className="p-2 text-left">Stock</th>
//               <th className="p-2">Price</th>
//               <th className="p-2">Change</th>
//               <th className="p-2">Change (%)</th>
//               <th className="p-2">PE Ratio</th>
//               <th className="p-2">Day Chart</th>
//             </tr>
//           </thead>
//           <tbody>
//             {gainers.map((stock) => (
//               <tr key={stock.symbol} className="border-b border-gray-700">
//                 <td className="p-2">{stock.name} ({stock.symbol})</td>
//                 <td className="p-2">${stock.price ? stock.price.toFixed(2) : "N/A"}</td>
//                 <td className="p-2 text-green-400">{stock.change ? stock.change.toFixed(2) : "N/A"}</td>
//                 <td className="p-2 text-green-400">{stock.percentage_change ? stock.percentage_change.toFixed(2) : "N/A"}%</td>
//                 <td className="p-2">{typeof stock.pe_ratio === "number" ? stock.pe_ratio.toFixed(2) : "N/A"}</td>
//                 <td><img src={stock.dayChart} alt="Graph" className="w-16 h-10" /></td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Gainers;

"use client";
import React, { useState, useEffect } from "react";
import Loader from "@/components/Loaders/loader"; // ✅ Import Loader
import { AiOutlineArrowUp, AiOutlineStock } from "react-icons/ai"; // ✅ Icons

const Gainers = () => {
  const [gainers, setGainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGainers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/update_gainers_losers/");
        const data = await response.json();

        if (data.top_gainers && data.top_gainers.length > 0) {
          setGainers([...data.top_gainers].sort((a, b) => b.percentage_change - a.percentage_change));
        } else {
          setError("⚠️ No gainers found.");
        }
      } catch (err) {
        setError("❌ Failed to fetch data. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGainers();
  }, []);

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full">
      <h2 className="text-xl font-semibold text-green-400 flex items-center">
        <AiOutlineArrowUp className="mr-2 text-green-300" /> Top Gainers
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader /> {/* ✅ Show loader while fetching */}
        </div>
      ) : error ? (
        <p className="text-red-400 text-center mt-3">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-white mt-3">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800">
                <th className="p-2 text-left">📈 Stock</th>
                <th className="p-2">💰 Price</th>
                <th className="p-2">🔺 Change</th>
                <th className="p-2">📊 Change (%)</th>
                <th className="p-2">📉 PE Ratio</th>
                <th className="p-2">📈 Day Chart</th>
              </tr>
            </thead>
            <tbody>
              {gainers.map((stock, index) => (
                <tr key={stock.symbol} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-2 font-semibold text-white">
                    <AiOutlineStock className="inline-block text-blue-400 mr-2" />
                    {stock.name} ({stock.symbol})
                  </td>
                  <td className="p-2 font-semibold">₹{stock.price ? stock.price.toFixed(2) : "N/A"}</td>
                  <td className="p-2 font-semibold text-green-400">+₹{stock.change ? stock.change.toFixed(2) : "N/A"}</td>
                  <td className="p-2 font-semibold text-green-400">
                    {stock.percentage_change ? `+${stock.percentage_change.toFixed(2)}%` : "N/A"}
                  </td>
                  <td className="p-2">{typeof stock.pe_ratio === "number" ? stock.pe_ratio.toFixed(2) : "N/A"}</td>
                  <td className="p-2">
                    <img src={stock.dayChart} alt="Graph" className="w-16 h-10 rounded-md shadow-md" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Gainers;