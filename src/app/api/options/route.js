// export async function GET(req) {
//     try {
//         const { searchParams } = new URL(req.url);
//         let ticker = searchParams.get("ticker") || "CYIENT";
//         ticker = ticker.replace(".NS", "").trim(); // Normalize ticker

//         const expiryDate = "27-02-2025";
//         const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJtZXJjaGFudCIsImlzcyI6InBheXRtbW9uZXkiLCJpZCI6MTM4NDg3OCwiZXhwIjoxNzM5NzMwNTk5fQ.MIQ3XZibAnZNPil1-m6oWsiKa9sFHLwM38SbnyRsWbE";

//         const fetchOptions = async (type) => {
//             const response = await fetch(
//                 `https://developer.paytmmoney.com/fno/v1/option-chain?type=${type}&symbol=${ticker}&expiry=${expiryDate}`,
//                 {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "x-jwt-token": accessToken,
//                     },
//                 }
//             );

//             const responseBody = await response.json();

//             if (!response.ok || responseBody.meta?.code !== "PM_FNO_200") {
//                 console.error(`API Error ${response.status}:`, responseBody);
//                 return [];
//             }

//             return responseBody.data?.results.map((opt) => ({
//                 symbol: opt.symbol,
//                 strikePrice: opt.stk_price,
//                 price: parseFloat(opt.price),
//                 oi: parseInt(opt.oi.replace(",", "")) || 0,
//                 change: parseFloat(opt.net_chg),
//                 type: opt.option_type, // CE (Call) or PE (Put)
//                 expiry: opt.expiry_date.split("T")[0], // Clean date format
//             })) || [];
//         };

//         // Fetch both CALL and PUT options in parallel
//         let [callOptions, putOptions] = await Promise.all([
//             fetchOptions("CALL"),
//             fetchOptions("PUT"),
//         ]);

//         // Sorting options based on strike price in ascending order
//         callOptions = callOptions.sort((a, b) => a.strikePrice - b.strikePrice);
//         putOptions = putOptions.sort((a, b) => a.strikePrice - b.strikePrice);

//         // Limit number of displayed options to 5 (similar to your image)
//         callOptions = callOptions.slice(0, 5);
//         putOptions = putOptions.slice(0, 5);

//         // Transforming the data structure to match the image
//         const formattedOptions = {
//             openInterest: {
//                 totalPutOI: putOptions.reduce((sum, opt) => sum + opt.oi, 0),
//                 totalCallOI: callOptions.reduce((sum, opt) => sum + opt.oi, 0),
//                 putCallRatio: (putOptions.length / (callOptions.length || 1)).toFixed(2),
//             },
//             callOptions: callOptions.map(opt => ({
//                 strike: opt.strikePrice,
//                 price: `₹${opt.price.toFixed(2)}`,
//                 oi: opt.oi,
//                 change: `${opt.change.toFixed(2)}%`
//             })),
//             putOptions: putOptions.map(opt => ({
//                 strike: opt.strikePrice,
//                 price: `₹${opt.price.toFixed(2)}`,
//                 oi: opt.oi,
//                 change: `${opt.change.toFixed(2)}%`
//             })),
//         };

//         return new Response(
//             JSON.stringify(formattedOptions),
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


// export async function GET(req) {
//     try {
//         const { searchParams } = new URL(req.url);
//         let ticker = searchParams.get("ticker") || "CYIENT";
//         ticker = ticker.replace(".NS", "").trim(); // Normalize ticker

//         const expiryDate = "27-02-2025";
//         const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJtZXJjaGFudCIsImlzcyI6InBheXRtbW9uZXkiLCJpZCI6MTM4Mjc2NSwiZXhwIjoxNzM5NDcxMzk5fQ.HyEf4F_FLZ2FV8EEE95_-LEwNw7rc8WDlnrtLHPnEuU"; // Replace with actual token

//         const fetchOptions = async (type) => {
//             const response = await fetch(
//                 `https://developer.paytmmoney.com/fno/v1/option-chain?type=${type}&symbol=${ticker}&expiry=${expiryDate}`,
//                 {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "x-jwt-token": accessToken,
//                     },
//                 }
//             );

//             const responseBody = await response.json();
//             if (!response.ok) {
//                 console.error(`API Error ${response.status}:`, responseBody);
//                 return [];
//             }

//             return responseBody.data?.results.map((opt) => ({
//                 symbol: opt.symbol,
//                 strikePrice: opt.stk_price,
//                 price: parseFloat(opt.price),
//                 oi: parseInt(opt.oi.replace(",", "")) || 0,
//                 change: parseFloat(opt.net_chg),
//                 type: opt.option_type, // CE (Call) or PE (Put)
//                 expiry: opt.expiry_date.split("T")[0],
//             })) || [];
//         };

//         // Fetch both CALL and PUT options in parallel
//         const [callOptions, putOptions] = await Promise.all([
//             fetchOptions("CALL"),
//             fetchOptions("PUT"),
//         ]);

//         return new Response(
//             JSON.stringify({ callOptions, putOptions }),
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

// export async function GET(req) {
//     try {
//         const { searchParams } = new URL(req.url);
//         let ticker = searchParams.get("ticker") || "CYIENT";
//         ticker = ticker.replace(".NS", "").trim(); // Normalize ticker

//         const expiryDate = "27-02-2025"; // Ensure expiry is updated dynamically if needed
//         const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJtZXJjaGFudCIsImlzcyI6InBheXRtbW9uZXkiLCJpZCI6MTM4NDg3OCwiZXhwIjoxNzM5ODE2OTk5fQ.0G-CIkuWlXCEYOOOLmk8qMOpdRgQmqa9kqdBy6RN27k";
//         /**
//          * Fetch Option Chain Data (Calls & Puts)
//          */
//         const fetchOptions = async (type) => {
//             const response = await fetch(
//                 `https://developer.paytmmoney.com/fno/v1/option-chain?type=${type}&symbol=${ticker}&expiry=${expiryDate}`,
//                 {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "x-jwt-token": accessToken,
//                     },
//                 }
//             );

//             const responseBody = await response.json();
//             if (!response.ok || responseBody.meta?.code !== "PM_FNO_200") {
//                 console.error(`API Error ${response.status}:`, responseBody);
//                 return [];
//             }

//             return responseBody.data?.results.map((opt) => ({
//                 symbol: opt.symbol,
//                 strikePrice: opt.stk_price,
//                 price: parseFloat(opt.price),
//                 oi: parseInt(opt.oi.replace(",", "")) || 0,
//                 change: parseFloat(opt.net_chg),
//                 type: opt.option_type, // CE (Call) or PE (Put)
//                 expiry: opt.expiry_date.split("T")[0],
//                 delta: opt.delta || null,
//                 gamma: opt.gamma || null,
//                 vega: opt.vega || null,
//                 theta: opt.theta || null,
//                 iv: opt.iv || null, // Implied Volatility
//             })) || [];
//         };

//         // Fetch both CALL and PUT options in parallel
//         let [callOptions, putOptions] = await Promise.all([
//             fetchOptions("CALL"),
//             fetchOptions("PUT"),
//         ]);

//         // Sorting options based on strike price in ascending order
//         callOptions = callOptions.sort((a, b) => a.strikePrice - b.strikePrice);
//         putOptions = putOptions.sort((a, b) => a.strikePrice - b.strikePrice);

//         /**
//          * Fetch Stock Market Data (OHLC, Volume, % Change)
//          */
//         const fetchMarketData = async () => {
//             const response = await fetch(
//                 `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}.NS`
//             );

//             const data = await response.json();
//             if (!response.ok || !data.quoteResponse?.result?.length) {
//                 console.error("Market Data Fetch Error:", data);
//                 return null;
//             }

//             const stock = data.quoteResponse.result[0];
//             return {
//                 name: stock.shortName || ticker,
//                 lastPrice: stock.regularMarketPrice,
//                 change: stock.regularMarketChange,
//                 changePercent: stock.regularMarketChangePercent,
//                 open: stock.regularMarketOpen,
//                 high: stock.regularMarketDayHigh,
//                 low: stock.regularMarketDayLow,
//                 prevClose: stock.regularMarketPreviousClose,
//                 volume: stock.regularMarketVolume,
//                 marketCap: stock.marketCap,
//             };
//         };

//         /**
//          * Fetch Market Depth (52W High/Low, Open, Close, Volume)
//          */
//         const fetchMarketDepth = async () => {
//             const response = await fetch(
//                 `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}.NS`
//             );

//             const data = await response.json();
//             if (!response.ok || !data.quoteResponse?.result?.length) {
//                 console.error("Market Depth Fetch Error:", data);
//                 return null;
//             }

//             const stock = data.quoteResponse.result[0];
//             return {
//                 todayHigh: stock.regularMarketDayHigh,
//                 todayLow: stock.regularMarketDayLow,
//                 fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
//                 fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
//                 open: stock.regularMarketOpen,
//                 prevClose: stock.regularMarketPreviousClose,
//                 volume: stock.regularMarketVolume,
//             };
//         };

//         // Fetch market data and depth in parallel
//         const [marketData, marketDepth] = await Promise.all([
//             fetchMarketData(),
//             fetchMarketDepth(),
//         ]);

//         /**
//          * Final Data Formatting
//          */
//         const formattedData = {
//             ticker: ticker,
//             expiryDate: expiryDate,
//             openInterest: {
//                 totalPutOI: putOptions.reduce((sum, opt) => sum + opt.oi, 0),
//                 totalCallOI: callOptions.reduce((sum, opt) => sum + opt.oi, 0),
//                 putCallRatio: (putOptions.length / (callOptions.length || 1)).toFixed(2),
//             },
//             callOptions: callOptions.map(opt => ({
//                 strike: opt.strikePrice,
//                 price: `₹${opt.price.toFixed(2)}`,
//                 oi: opt.oi,
//                 change: `${opt.change.toFixed(2)}%`,
//                 delta: opt.delta,
//                 gamma: opt.gamma,
//                 vega: opt.vega,
//                 theta: opt.theta,
//                 iv: opt.iv,
//             })),
//             putOptions: putOptions.map(opt => ({
//                 strike: opt.strikePrice,
//                 price: `₹${opt.price.toFixed(2)}`,
//                 oi: opt.oi,
//                 change: `${opt.change.toFixed(2)}%`,
//                 delta: opt.delta,
//                 gamma: opt.gamma,
//                 vega: opt.vega,
//                 theta: opt.theta,
//                 iv: opt.iv,
//             })),
//             marketData,
//             marketDepth,
//         };

//         return new Response(
//             JSON.stringify(formattedData),
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
        ticker = ticker.replace(".NS", "").trim(); // Normalize ticker

        const expiryDate = "27-02-2025"; // Ensure expiry is updated dynamically if needed
        const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJtZXJjaGFudCIsImlzcyI6InBheXRtbW9uZXkiLCJpZCI6MTM4NjA3NSwiZXhwIjoxNzM5OTAzMzk5fQ.XSdoitUFGoKiDYhZLMdVN8jOF5YPgtDWkOlBJbvZpVg";
        /**
         * Fetch Option Chain Data (Calls & Puts)
         */
        const fetchOptions = async (type) => {
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

                const responseBody = await response.json();
                if (!response.ok || responseBody.meta?.code !== "PM_FNO_200") {
                    console.error(`API Error ${response.status}:`, responseBody);
                    return [];
                }

                return responseBody.data?.results.map((opt) => ({
                    symbol: opt.symbol,
                    strikePrice: Number(opt.stk_price) || 0, // Ensure valid strike price
                    price: Number(opt.price) || 0, // Ensure valid price
                    oi: Number(opt.oi.replace(",", "")) || 0, // Open Interest
                    change: Number(opt.net_chg) || 0, // Price Change
                    type: opt.option_type, // CE (Call) or PE (Put)
                    expiry: opt.expiry_date.split("T")[0],
                    delta: Number(opt.delta) || null,
                    gamma: Number(opt.gamma) || null,
                    vega: Number(opt.vega) || null,
                    theta: Number(opt.theta) || null,
                    iv: Number(opt.iv) || null, // Implied Volatility
                })) || [];
            } catch (error) {
                console.error("Error fetching options data:", error);
                return [];
            }
        };

        // Fetch both CALL and PUT options in parallel
        let [callOptions, putOptions] = await Promise.all([
            fetchOptions("CALL"),
            fetchOptions("PUT"),
        ]);

        // Sorting options based on strike price in ascending order
        callOptions = callOptions.sort((a, b) => a.strikePrice - b.strikePrice);
        putOptions = putOptions.sort((a, b) => a.strikePrice - b.strikePrice);

        /**
         * Fetch Stock Market Data (OHLC, Volume, % Change)
         */
        const fetchMarketData = async () => {
            try {
                const response = await fetch(
                    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}.NS`
                );

                const data = await response.json();
                if (!response.ok || !data.quoteResponse?.result?.length) {
                    console.error("Market Data Fetch Error:", data);
                    return null;
                }

                const stock = data.quoteResponse.result[0];
                return {
                    name: stock.shortName || ticker,
                    lastPrice: stock.regularMarketPrice || 0,
                    change: stock.regularMarketChange || 0,
                    changePercent: stock.regularMarketChangePercent || 0,
                    open: stock.regularMarketOpen || 0,
                    high: stock.regularMarketDayHigh || 0,
                    low: stock.regularMarketDayLow || 0,
                    prevClose: stock.regularMarketPreviousClose || 0,
                    volume: stock.regularMarketVolume || 0,
                    marketCap: stock.marketCap || 0,
                };
            } catch (error) {
                console.error("Error fetching market data:", error);
                return null;
            }
        };

        /**
         * Fetch Market Depth (52W High/Low, Open, Close, Volume)
         */
        const fetchMarketDepth = async () => {
            try {
                const response = await fetch(
                    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}.NS`
                );

                const data = await response.json();
                if (!response.ok || !data.quoteResponse?.result?.length) {
                    console.error("Market Depth Fetch Error:", data);
                    return null;
                }

                const stock = data.quoteResponse.result[0];
                return {
                    todayHigh: stock.regularMarketDayHigh || 0,
                    todayLow: stock.regularMarketDayLow || 0,
                    fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh || 0,
                    fiftyTwoWeekLow: stock.fiftyTwoWeekLow || 0,
                    open: stock.regularMarketOpen || 0,
                    prevClose: stock.regularMarketPreviousClose || 0,
                    volume: stock.regularMarketVolume || 0,
                };
            } catch (error) {
                console.error("Error fetching market depth:", error);
                return null;
            }
        };

        // Fetch market data and depth in parallel
        const [marketData, marketDepth] = await Promise.all([
            fetchMarketData(),
            fetchMarketDepth(),
        ]);

        /**
         * Final Data Formatting
         */
        const formattedData = {
            ticker: ticker,
            expiryDate: expiryDate,
            openInterest: {
                totalPutOI: putOptions.reduce((sum, opt) => sum + opt.oi, 0),
                totalCallOI: callOptions.reduce((sum, opt) => sum + opt.oi, 0),
                putCallRatio: putOptions.length > 0 && callOptions.length > 0
                    ? (putOptions.length / callOptions.length).toFixed(2)
                    : "N/A",
            },
            callOptions: callOptions.map(opt => ({
                strike: opt.strikePrice,
                price: `₹${opt.price.toFixed(2)}`,
                oi: opt.oi,
                change: `${opt.change.toFixed(2)}%`,
                delta: opt.delta !== null ? opt.delta.toFixed(4) : "N/A",
                gamma: opt.gamma !== null ? opt.gamma.toFixed(4) : "N/A",
                vega: opt.vega !== null ? opt.vega.toFixed(4) : "N/A",
                theta: opt.theta !== null ? opt.theta.toFixed(4) : "N/A",
                iv: opt.iv !== null ? `${opt.iv.toFixed(2)}%` : "N/A",
            })),
            putOptions: putOptions.map(opt => ({
                strike: opt.strikePrice,
                price: `₹${opt.price.toFixed(2)}`,
                oi: opt.oi,
                change: `${opt.change.toFixed(2)}%`,
                delta: opt.delta !== null ? opt.delta.toFixed(4) : "N/A",
                gamma: opt.gamma !== null ? opt.gamma.toFixed(4) : "N/A",
                vega: opt.vega !== null ? opt.vega.toFixed(4) : "N/A",
                theta: opt.theta !== null ? opt.theta.toFixed(4) : "N/A",
                iv: opt.iv !== null ? `${opt.iv.toFixed(2)}%` : "N/A",
            })),
            marketData,
            marketDepth,
        };

        return new Response(
            JSON.stringify(formattedData),
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
