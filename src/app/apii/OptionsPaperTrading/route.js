//working
// export async function GET(req) {
//     try {
//         const { searchParams } = new URL(req.url);
//         let ticker = searchParams.get("ticker") || "CYIENT";
//         ticker = ticker.replace(".NS", "").trim();
//         const expiryDate = "27-02-2025";
//         const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJtZXJjaGFudCIsImlzcyI6InBheXRtbW9uZXkiLCJpZCI6MTM4NDg3OCwiZXhwIjoxNzM5ODE2OTk5fQ.0G-CIkuWlXCEYOOOLmk8qMOpdRgQmqa9kqdBy6RN27k";

//         // Fetch Options Data
//         const fetchOptionsData = async (type) => {
//             const response = await fetch(
//                 `https://developer.paytmmoney.com/fno/v1/option-chain?type=${type}&symbol=${ticker}&expiry=${expiryDate}`,
//                 {
//                     method: "GET",
//                     headers: { "Content-Type": "application/json", "x-jwt-token": accessToken },
//                 }
//             );

//             const data = await response.json();
//             if (!response.ok || data.meta?.code !== "PM_FNO_200") {
//                 console.error(`API Error ${response.status}:`, data);
//                 return [];
//             }

//             return data.data?.results.map((opt) => ({
//                 strike: opt.stk_price,
//                 price: parseFloat(opt.price),
//                 oi: parseInt(opt.oi.replace(",", "")) || 0,
//                 change: parseFloat(opt.net_chg),
//                 type: opt.option_type,
//                 delta: opt.delta || null,
//                 gamma: opt.gamma || null,
//                 vega: opt.vega || null,
//                 theta: opt.theta || null,
//                 iv: opt.iv || null,
//             })) || [];
//         };

//         let [callOptions, putOptions] = await Promise.all([
//             fetchOptionsData("CALL"),
//             fetchOptionsData("PUT"),
//         ]);

//         callOptions = callOptions.sort((a, b) => a.strike - b.strike);
//         putOptions = putOptions.sort((a, b) => a.strike - b.strike);

//         // Format data for Plotly
//         const chartData = {
//             callOI: {
//                 x: callOptions.map((d) => d.strike),
//                 y: callOptions.map((d) => d.oi),
//                 type: "bar",
//                 name: "Call OI",
//                 marker: { color: "green" },
//             },
//             putOI: {
//                 x: putOptions.map((d) => d.strike),
//                 y: putOptions.map((d) => d.oi),
//                 type: "bar",
//                 name: "Put OI",
//                 marker: { color: "red" },
//             },
//             delta: {
//                 x: callOptions.map((d) => d.strike),
//                 y: callOptions.map((d) => d.delta),
//                 type: "scatter",
//                 mode: "lines",
//                 name: "Delta",
//             },
//             gamma: {
//                 x: callOptions.map((d) => d.strike),
//                 y: callOptions.map((d) => d.gamma),
//                 type: "scatter",
//                 mode: "lines",
//                 name: "Gamma",
//             },
//             vega: {
//                 x: callOptions.map((d) => d.strike),
//                 y: callOptions.map((d) => d.vega),
//                 type: "scatter",
//                 mode: "lines",
//                 name: "Vega",
//             },
//             theta: {
//                 x: callOptions.map((d) => d.strike),
//                 y: callOptions.map((d) => d.theta),
//                 type: "scatter",
//                 mode: "lines",
//                 name: "Theta",
//             },
//             iv: {
//                 x: callOptions.map((d) => d.strike),
//                 y: callOptions.map((d) => d.iv),
//                 type: "scatter",
//                 mode: "lines",
//                 name: "IV (Implied Volatility)",
//             },
//         };

//         return new Response(
//             JSON.stringify({ callOptions, putOptions, chartData }),
//             { status: 200, headers: { "Content-Type": "application/json" } }
//         );

//     } catch (err) {
//         console.error("API Fetch Error:", err.message);
//         return new Response(
//             JSON.stringify({ error: err.message }),
//             { status: 500, headers: { "Content-Type": "application/json" } }
//         );
//     }
// }


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        let ticker = searchParams.get("ticker") || "CYIENT";
        ticker = ticker.replace(".NS", "").trim();
        const expiryDate = "27-02-2025"; // This should be dynamically fetched if needed
        const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJtZXJjaGFudCIsImlzcyI6InBheXRtbW9uZXkiLCJpZCI6MTM4NjA3NSwiZXhwIjoxNzM5OTAzMzk5fQ.XSdoitUFGoKiDYhZLMdVN8jOF5YPgtDWkOlBJbvZpVg";        /**
         * Fetch Lot Size
         */
        const fetchLotSize = async () => {
            try {
                const response = await fetch(
                    `https://developer.paytmmoney.com/fno/v1/option-chain?type=CALL&symbol=${ticker}&expiry=${expiryDate}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "x-jwt-token": accessToken,
                        },
                    }
                );

                const data = await response.json();
                if (!response.ok || data.meta?.code !== "PM_FNO_200") {
                    console.error("Lot Size Fetch Error:", data);
                    return 1; // Default to 1 if not available
                }

                return data.data?.results?.[0]?.lot_size || 1;
            } catch (error) {
                console.error("Lot Size Fetch Error:", error);
                return 1;
            }
        };

        /**
         * Fetch Option Chain Data (Calls & Puts)
         */
        const fetchOptionsData = async (type) => {
            try {
                const response = await fetch(
                    `https://developer.paytmmoney.com/fno/v1/option-chain?type=${type}&symbol=${ticker}&expiry=${expiryDate}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "x-jwt-token": accessToken,
                        },
                    }
                );

                const data = await response.json();
                if (!response.ok || data.meta?.code !== "PM_FNO_200") {
                    console.error(`API Error ${response.status}:`, data);
                    return [];
                }

                return data.data?.results.map((opt) => ({
                    exchange: opt.exchange || "NSE",
                    instrument: opt.instrument || "OPTSTK",
                    strike: opt.stk_price,
                    price: parseFloat(opt.price),
                    oi: parseInt(opt.oi.replace(",", "")) || 0,
                    oiChange: parseFloat(opt.oi_net_chg) || 0,
                    volume: parseInt(opt.traded_vol.replace(",", "")) || 0,
                    change: parseFloat(opt.net_chg),
                    changePercent: parseFloat(opt.per_chg),
                    type: opt.option_type, // CE (Call) or PE (Put)
                    expiry: opt.expiry_date || "N/A",
                    delta: opt.delta || null,
                    gamma: opt.gamma || null,
                    vega: opt.vega || null,
                    theta: opt.theta || null,
                    iv: opt.iv || null,
                    lotSize: opt.lot_size || 1,
                    spotPrice: parseFloat(opt.spot_price) || null,
                })) || [];
            } catch (error) {
                console.error(`Fetch Options Data (${type}) Error:`, error);
                return [];
            }
        };

        /**
         * Fetch Market Data (OHLC, Volume, OI, Spot Price)
         */
        const fetchMarketData = async () => {
            try {
                const response = await fetch(
                    `https://developer.paytmmoney.com/fno/v1/option-chain?type=CALL&symbol=${ticker}&expiry=${expiryDate}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "x-jwt-token": accessToken,
                        },
                    }
                );

                const data = await response.json();
                if (!response.ok || data.meta?.code !== "PM_FNO_200") {
                    console.error("Market Data Fetch Error:", data);
                    return {};
                }

                const stock = data.data?.results?.[0]; // Taking first entry

                return {
                    open: stock.spot_price || "N/A",
                    prevClose: stock.price || "N/A",
                    volume: stock.traded_vol || "N/A",
                    oi: stock.oi || "N/A",
                    oiChange: stock.oi_net_chg || "N/A",
                    spotPrice: stock.spot_price || "N/A",
                };
            } catch (error) {
                console.error("Market Data Fetch Error:", error);
                return {};
            }
        };

        /**
         * Fetch all data in parallel
         */
        const [callOptions, putOptions, lotSize, marketData] = await Promise.all([
            fetchOptionsData("CALL"),
            fetchOptionsData("PUT"),
            fetchLotSize(),
            fetchMarketData(),
        ]);

        // Sort Options by Strike Price
        callOptions.sort((a, b) => a.strike - b.strike);
        putOptions.sort((a, b) => a.strike - b.strike);

        /**
         * Enhanced Chart Data
         */
        const chartData = {
            callOI: {
                x: callOptions.map((d) => d.strike),
                y: callOptions.map((d) => d.oi),
                type: "bar",
                name: "Call OI",
                marker: { color: "green" },
            },
            putOI: {
                x: putOptions.map((d) => d.strike),
                y: putOptions.map((d) => d.oi),
                type: "bar",
                name: "Put OI",
                marker: { color: "red" },
            },
            oiChange: {
                x: callOptions.map((d) => d.strike),
                y: callOptions.map((d) => d.oiChange),
                type: "bar",
                name: "OI Change",
                marker: { color: "orange" },
            },
            openPrice: {
                x: callOptions.map((d) => d.strike),
                y: Array(callOptions.length).fill(marketData.open),
                type: "scatter",
                mode: "lines",
                name: "Open Price",
            },
            prevClose: {
                x: callOptions.map((d) => d.strike),
                y: Array(callOptions.length).fill(marketData.prevClose),
                type: "scatter",
                mode: "lines",
                name: "Previous Close",
            },
            volume: {
                x: callOptions.map((d) => d.strike),
                y: Array(callOptions.length).fill(marketData.volume),
                type: "bar",
                name: "Volume",
                marker: { color: "blue" },
            },
            iv: {
                x: callOptions.map((d) => d.strike),
                y: callOptions.map((d) => d.iv),
                type: "scatter",
                mode: "lines",
                name: "Implied Volatility (IV)",
            },
        };

        /**
         * Final Response
         */
        return new Response(
            JSON.stringify({
                ticker,
                expiryDate,
                exchange: "NSE",
                instrument: "OPTSTK",
                lotSize,
                marketData,
                callOptions,
                putOptions,
                chartData,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (err) {
        console.error("API Fetch Error:", err.message);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
