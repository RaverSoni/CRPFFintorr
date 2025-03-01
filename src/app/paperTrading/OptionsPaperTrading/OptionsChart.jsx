// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import dynamic from "next/dynamic";

// const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// const OptionsChart = () => {
//     const searchParams = useSearchParams();
//     const ticker = searchParams.get("ticker") || "CYIENT";
//     const [chartData, setChartData] = useState(null);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchChartData = async () => {
//             try {
//                 const response = await fetch(`/apii/OptionsPaperTrading?ticker=${ticker}`);
//                 if (!response.ok) throw new Error("Failed to fetch options chart data");

//                 const data = await response.json();
//                 setChartData(data.chartData || null);
//             } catch (err) {
//                 setError(err.message);
//             }
//         };

//         fetchChartData();
//     }, [ticker]);

//     if (error) return <div className="text-red-500">{error}</div>;
//     if (!chartData) return <div>Loading...</div>;

//     return (
//         <div className="bg-gray-900 p-4 rounded-lg text-white">
//             <h2 className="text-xl font-semibold mb-4">Options Open Interest & Greeks</h2>
            
//             <Plot
//                 data={[
//                     chartData.callOI,
//                     chartData.putOI,
//                     chartData.delta,
//                     chartData.gamma,
//                     chartData.vega,
//                     chartData.theta,
//                     chartData.iv,
//                 ]}
//                 layout={{
//                     title: `Options Greeks & Open Interest for ${ticker}`,
//                     xaxis: { title: "Strike Price" },
//                     yaxis: { title: "Values" },
//                     barmode: "group",
//                     height: 600,
//                     width: 1200,
//                     paper_bgcolor: "black",
//                     plot_bgcolor: "black",
//                     font: { color: "white" },
//                 }}
//             />
//         </div>
//     );
// };

// export default OptionsChart;





"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const OptionsChart = () => {
    const searchParams = useSearchParams();
    const ticker = searchParams.get("ticker") || "CYIENT";
    const [chartData, setChartData] = useState(null);
    const [marketData, setMarketData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/apii/OptionsPaperTrading?ticker=${ticker}`);
                if (!response.ok) throw new Error("Failed to fetch options chart data");

                const data = await response.json();
                setChartData(data.chartData || null);
                setMarketData(data.marketData || null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [ticker]);

    if (error) return <div className="text-red-500">{error}</div>;
    if (loading || !chartData || !marketData) return <div>Loading options chart...</div>;

    return (
        <div className="bg-gray-900 p-6 rounded-lg text-white">
            <h2 className="text-xl font-semibold mb-4">Options Open Interest & Greeks</h2>

            {/* Options Chart */}
            <Plot
                data={[
                    chartData.callOI,
                    chartData.putOI,
                    chartData.oiChange,
                    chartData.openPrice,
                    chartData.prevClose,
                    chartData.volume,
                    chartData.iv
                ]}
                layout={{
                    title: `Options Greeks & Open Interest for ${ticker}`,
                    xaxis: { title: "Strike Price", tickangle: -45 },
                    yaxis: { title: "Values" },
                    barmode: "group",
                    height: 600,
                    width: "100%",
                    paper_bgcolor: "black",
                    plot_bgcolor: "black",
                    font: { color: "white" },
                    margin: { l: 50, r: 20, t: 50, b: 80 }
                }}
                config={{ responsive: true }}
            />
        </div>
    );
};

export default OptionsChart;
