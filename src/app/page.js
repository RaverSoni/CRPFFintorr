// "use client";
// import Card from "@/components/cards/indexcard";
// import GainerBox from "@/components/tile/gainerbox/gainer";
// import InvestBox from "@/components/tile/investments/investmentbox";
// import NewsCard from "@/components/tile/newsbox";

// import Image from "next/image";
// import StockPage from "./stockpage/stockpage";

// export default function Home() {
//   return (
//     <>
//       <div className="flex flex-row">
//         <div className="flex flex-col">
//           <h1 className="text-3xl ml-5 mb-4 font-bold ">Indices</h1>    
//           <div className="flex flex-row justify-between ml-5 mr-5">
            
//             {/* <Card title="Sensex" points='+522.60' dayChange="+100" dayChangePerc="+0.25" open="52700.40" high="52900.40" low="52300.40" low52wk="52300.40"/>
//             <Card title="Nifty 50" points='+522.60' dayChange="+100" dayChangePerc="+0.25" open="52700.40" high="52900.40" low="52300.40" low52wk="52300.40"/>
//             <Card title="Nasdaq" points='+522.60' dayChange="+100" dayChangePerc="+0.25" open="52700.40" high="52900.40" low="52300.40" low52wk="52300.40"/> */}
//             <Card symbol="^BSESN" title="Sensex" />
//             <Card symbol="^NSEI" title="Nifty 50" />
//             <Card symbol="^NSEBANK" title="BankNifty" />

//           </div>
//           <GainerBox />
//         </div>
//         <div className="flex flex-col w-full">
//             <h1 className="text-3xl ml-10 font-bold">Stock News</h1>
//             <NewsCard title="News 1" content="Content 4" />
//             <h1 className="text-3xl ml-10 mt-5 font-bold ">Investments</h1>
//             <InvestBox />
//           </div>
         
//       </div>
//     </>
//   );
// }
// "use client"; // Add this line at the top

// import { useState, useEffect } from "react";
// import GainerBox from "@/components/tile/gainerbox/gainer";
// import InvestBox from "@/components/tile/investments/investmentbox";
// import NewsCard from "@/components/tile/newsbox";
// import Image from "next/image";
// import StockPage from "./stockpage/stockpage";

// export default function Home() {
//   const [gainersData, setGainersData] = useState([]);
//   const [losersData, setLosersData] = useState([]);

//   useEffect(() => {
//     const fetchStockData = async () => {
//       const response = await fetch("/api/getGainersAndLosers");
//       const data = await response.json();
//       setGainersData(data.gainers);
//       setLosersData(data.losers);
//     };

//     fetchStockData();
//   }, []);

//   return (
//     <>
//       <div className="flex flex-row">
//         <div className="flex flex-col">
//           <h1 className="text-3xl ml-5 mb-4 font-bold ">Indices</h1>    
//           <div className="flex flex-row justify-between ml-5 mr-5">
//             <Card symbol="^BSESN" title="Sensex" />
//             <Card symbol="^NSEI" title="Nifty 50" />
//             <Card symbol="^NSEBANK" title="BankNifty" />
//           </div>
//           <GainerBox gainers={gainersData} losers={losersData} />
//         </div>
//         <div className="flex flex-col w-full">
//             <h1 className="text-3xl ml-10 font-bold">Stock News</h1>
//             <NewsCard title="News 1" content="Content 4" />
//             <h1 className="text-3xl ml-10 mt-5 font-bold ">Investments</h1>
//             <InvestBox />
//           </div>
//       </div>
//     </>
//   );
// }



// "use client";
// import React from "react";
// import Card from "@/components/cards/indexcard";
// import GainerBox from "@/components/tile/gainerbox/gainer";
// import LoserBox from "@/components/tile/loserbox/loser"; // FIXED - Ensure correct import
// import InvestBox from "@/components/tile/investments/investmentbox";
// import NewsCard from "@/components/tile/newsbox";

// export default function Home() {
//   return (
//     <div className="flex flex-row">
//       <div className="flex flex-col">
//         <h1 className="text-3xl ml-5 mb-4 font-bold text-white">Indices</h1>
//         <div className="flex flex-row justify-between ml-5 mr-5">
//           <Card symbol="^BSESN" title="Sensex" />
//           <Card symbol="^NSEI" title="Nifty 50" />
//           <Card symbol="^NSEBANK" title="BankNifty" />
//         </div>

//         {/* Ensure Gainers & Losers are displayed correctly */}
//         <div className="flex flex-row gap-6 mt-6">
//           <GainerBox />
//           <LoserBox /> {/* FIXED - Correct Component Name */}
//         </div>
//       </div>

//       <div className="flex flex-col w-full">
//         <h1 className="text-3xl ml-10 font-bold text-white">Stock News</h1>
//         <NewsCard title="Market Updates" content="Today's biggest movers in the stock market." />
        
//         <h1 className="text-3xl ml-10 mt-5 font-bold text-white">Investments</h1>
//         <InvestBox />
//       </div>
//     </div>
//   );
// }

"use client";
import React from "react";
import Card from "@/components/cards/indexcard";
import GainerBox from "@/components/tile/gainerbox/gainer";
import LoserBox from "@/components/tile/loserbox/loser"; // Ensure correct import
import InvestBox from "@/components/tile/investments/investmentbox";
import NewsCard from "@/components/tile/newsbox";

export default function Home() {
  return (
    <div className="flex flex-row">
      <div className="flex flex-col">
        {/* Indices Section */}
        <h1 className="text-3xl ml-5 mb-4 font-bold text-white">Indices</h1>
        <div className="flex flex-row justify-between ml-5 mr-5">
          <Card symbol="^BSESN" title="Sensex" />
          <Card symbol="^NSEI" title="Nifty 50" />
          <Card symbol="^NSEBANK" title="BankNifty" />
        </div>

        {/* Gainers & Losers - Stacked Vertically */}
        <div className="flex flex-col gap-6 mt-6">
          <GainerBox />
          <LoserBox />
        </div>
      </div>

      {/* Right Side Content */}
      <div className="flex flex-col w-full">
        {/* Stock News */}
        <h1 className="text-3xl ml-10 font-bold text-white">Stock News</h1>
        <NewsCard title="Market Updates" content="Today's biggest movers in the stock market." />
        
        {/* Investments Section */}
        <h1 className="text-3xl ml-10 mt-5 font-bold text-white">Investments</h1>
        <InvestBox />
      </div>
    </div>
  );
}
