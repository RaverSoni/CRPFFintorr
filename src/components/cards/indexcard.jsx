// "use client";
// import React, { useState, useEffect } from 'react';
// import styles from './indexcard.module.css'; // Import CSS module

// const Card = ({ symbol, title }) => {
//   const [data, setData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchData = () => {
//     fetch(`http://127.0.0.1:8000/index-data/${symbol}/`)
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.error) {
//           setError(data.error);
//         } else {
//           setData(data);
//           setError(null);
//         }
//         setLoading(false);
//       })
//       .catch((error) => {
//         setError(error.message);
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchData(); // Fetch data on initial load

//     // Set up polling to fetch data every 10 seconds
//     const interval = setInterval(fetchData, 10000);

//     // Clean up the interval on component unmount
//     return () => clearInterval(interval);
//   }, [symbol]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   // Destructure and provide fallback values for undefined data
//   const {
//     current_price = "N/A",
//     close_price = "N/A",
//     day_change = "N/A",
//     percentage_change = "N/A",
//     open = "N/A",
//     high = "N/A",
//     low = "N/A",
//     low_52wk = "N/A",
//     high_52wk = "N/A",
//     price = "N/A"
//   } = data;

//   const changeClass = day_change > 0 ? styles.changePositive : styles.changeNegative;
//   const hoverClass = day_change > 0 ? styles.cardHoverPositive : styles.cardHoverNegative;

//   return (
//     <div className={styles.cardContainer}>
//       <div className={styles.innerContainer}>
//         <div className={`${styles.card} ${hoverClass}`}>
//           <h1 className={styles.title}>{title}</h1>
//           <div className={styles.gridContainer}>
//             <div className={styles.colSpan2}>
//               <p className={`${styles.points} ${changeClass}`}>{current_price}</p>
//             </div>
//             <div className={styles.colSpan1}>
//               <p className={changeClass}>{day_change}</p>
//               <p className={changeClass}>
//                 {percentage_change !== "N/A" ? `${percentage_change}%` : "N/A"}
//               </p>
//             </div>
//           </div>
//           <div className="flex flex-col">
//             <div className="flex flex-row justify-between">
//               <p className={styles.contentText}>Open</p>
//               <p className={styles.contentVal}>{open}</p>
//             </div>
//             <div className="flex flex-row justify-between">
//               <p className={styles.contentText}>High</p>
//               <p className={styles.contentVal}>{high}</p>
//             </div>
//             <div className="flex flex-row justify-between">
//               <p className={styles.contentText}>Low</p>
//               <p className={styles.contentVal}>{low}</p>
//             </div>
//             <div className="flex flex-row justify-between">
//               <p className={styles.contentText}>52 wk low</p>
//               <p className={styles.contentVal}>{low_52wk}</p>
//             </div>
//             <div className="flex flex-row justify-between">
//               <p className={styles.contentText}>52 wk high</p>
//               <p className={styles.contentVal}>{high_52wk}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Card;

"use client";
import React, { useState, useEffect } from "react";
import Loader from "@/components/Loaders/loader2"; // ✅ Updated Loader Component
import styles from "./indexcard.module.css"; // ✅ Import CSS module
import { AiOutlineRise, AiOutlineFall, AiOutlineStock } from "react-icons/ai"; // ✅ Icons for better UX

const Card = ({ symbol, title }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchData(); // ✅ Fetch data on initial load

    // ✅ Set up polling to fetch data every 10 seconds
    const interval = setInterval(fetchData, 10000);

    // ✅ Cleanup polling on component unmount
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading)
    return (
      <div className={styles.loaderContainer}>
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className={styles.errorContainer}>
        ❌ Error: {error}
      </div>
    );

  // ✅ Destructure and provide fallback values for undefined data
  const {
    current_price = "N/A",
    close_price = "N/A",
    day_change = "N/A",
    percentage_change = "N/A",
    open = "N/A",
    high = "N/A",
    low = "N/A",
    low_52wk = "N/A",
    high_52wk = "N/A",
  } = data;

  const isPositive = day_change > 0;
  const changeClass = isPositive ? styles.changePositive : styles.changeNegative;
  const hoverClass = isPositive ? styles.cardHoverPositive : styles.cardHoverNegative;
  const ChangeIcon = isPositive ? AiOutlineRise : AiOutlineFall;

  return (
    <div className={styles.cardContainer}>
      <div className={styles.innerContainer}>
        <div className={`${styles.card} ${hoverClass}`}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.gridContainer}>
            <div className={styles.colSpan2}>
              <p className={`${styles.points} ${changeClass}`}>
                ₹{current_price}
              </p>
            </div>
            <div className= {`${styles.colSpan1} flex items-center`}>
              <ChangeIcon className={`${changeClass} text-lg`} /> {/* ✅ Icon */}
              <p className={changeClass}>{day_change}</p>
              <p className={changeClass}>
                {percentage_change !== "N/A" ? `${percentage_change}%` : "N/A"}
              </p>
            </div>
          </div>
          {/* ✅ Stock Data Section */}
          <div className={styles.dataSection}>
            <div className="flex flex-row justify-between">
              <p className={styles.contentText}>📈 Open</p>
              <p className={styles.contentVal}>₹{open}</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className={styles.contentText}>📊 High</p>
              <p className={styles.contentVal}>₹{high}</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className={styles.contentText}>📉 Low</p>
              <p className={styles.contentVal}>₹{low}</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className={styles.contentText}>🔻 52W Low</p>
              <p className={styles.contentVal}>₹{low_52wk}</p>
            </div>
            <div className="flex flex-row justify-between">
              <p className={styles.contentText}>🔺 52W High</p>
              <p className={styles.contentVal}>₹{high_52wk}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;