export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        let ticker = searchParams.get("ticker")?.replace("^", "").toUpperCase() || "NIFTY";
        const exchange = searchParams.get("exchange")?.toUpperCase() || "NSE";
        const PAYTM_ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJtZXJjaGFudCIsImlzcyI6InBheXRtbW9uZXkiLCJpZCI6MTM4NjA3NSwiZXhwIjoxNzM5OTAzMzk5fQ.XSdoitUFGoKiDYhZLMdVN8jOF5YPgtDWkOlBJbvZpVg";        /**;

        /**
         * 🔹 Convert Yahoo Finance Tickers to Actual NSE Symbols
         */
        const tickerMappings = {
            "NSEI": "NIFTY",
            "NIFTY50": "NIFTY",
            "BANKNIFTY": "BANKNIFTY",
            "NIFTYBANK": "BANKNIFTY",
            "FINNIFTY": "FINNIFTY",
            "MIDCPNIFTY": "MIDCPNIFTY",
        };

        if (tickerMappings[ticker]) ticker = tickerMappings[ticker];

        console.log(`Fetching Options Data for ${ticker} on ${exchange}`);

        /**
         * 🔹 Determine Expiry Date Based on Index Type
         */
        const getExpiryDate = () => {
            const today = new Date();
            let expiry = new Date();

            if (ticker === "NIFTY") {
                expiry.setDate(today.getDate() + ((4 - today.getDay() + 7) % 7)); // Thursday
            } else if (ticker === "BANKNIFTY") {
                expiry.setDate(today.getDate() + ((3 - today.getDay() + 7) % 7)); // Wednesday
            } else if (ticker === "FINNIFTY") {
                expiry.setDate(today.getDate() + ((2 - today.getDay() + 7) % 7)); // Tuesday
            } else if (ticker === "MIDCPNIFTY") {
                expiry.setDate(today.getDate() + ((1 - today.getDay() + 7) % 7)); // Monday
            } else {
                expiry.setDate(today.getDate() + ((4 - today.getDay() + 7) % 7)); // Default: Thursday
            }

            const formattedExpiry = expiry.toLocaleDateString("en-GB").replace(/\//g, "-"); // Format: DD-MM-YYYY
            console.log(`🗓 Expiry Date for ${ticker}: ${formattedExpiry}`);
            return formattedExpiry;
        };

        const expiryDate = getExpiryDate();

        /**
         * 🔹 Fetch Lot Size for the Index
         */
        const fetchLotSize = async () => {
            try {
                const response = await fetch(
                    `https://developer.paytmmoney.com/fno/v1/option-chain?type=CALL&symbol=${ticker}&expiry=${expiryDate}&exchange=${exchange}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-jwt-token": PAYTM_ACCESS_TOKEN,
                        },
                    }
                );

                const data = await response.json();
                return data.data?.results?.[0]?.lot_size || 1; // Default lot size: 1
            } catch (error) {
                console.error("⚠️ Lot Size Fetch Error:", error);
                return 1;
            }
        };

        /**
         * 🔹 Fetch Option Chain Data (Call & Put)
         */
        const fetchOptionsData = async (type) => {
            try {
                const response = await fetch(
                    `https://developer.paytmmoney.com/fno/v1/option-chain?type=${type}&symbol=${ticker}&expiry=${expiryDate}&exchange=${exchange}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-jwt-token": PAYTM_ACCESS_TOKEN,
                        },
                    }
                );

                const data = await response.json();
                if (!data.data?.results) return [];

                return data.data.results.map((opt) => ({
                    exchange: opt.exchange || exchange,
                    instrument: opt.instrument || "OPTIDX",
                    strike: parseFloat(opt.stk_price) || null,
                    price: parseFloat(opt.price) || null,
                    oi: parseInt(opt.oi.replace(",", "")) || 0,
                    oiChange: parseFloat(opt.oi_net_chg) || 0,
                    volume: parseInt(opt.traded_vol.replace(",", "")) || 0,
                    change: parseFloat(opt.net_chg) || null,
                    changePercent: parseFloat(opt.per_chg) || null,
                    type: opt.option_type, // CE (Call) or PE (Put)
                    expiry: opt.expiry_date || expiryDate,
                    delta: parseFloat(opt.delta) || null,
                    gamma: parseFloat(opt.gamma) || null,
                    vega: parseFloat(opt.vega) || null,
                    theta: parseFloat(opt.theta) || null,
                    iv: parseFloat(opt.iv) || null,
                    lotSize: parseInt(opt.lot_size) || 1,
                    spotPrice: parseFloat(opt.spot_price) || null,
                }));
            } catch (error) {
                console.error(`🚨 Fetch Options Data (${type}) Error:`, error);
                return [];
            }
        };

        /**
         * 🔹 Fetch Market Data (OHLC, Volume, OI, Spot Price)
         */
        const fetchMarketData = async () => {
            try {
                const response = await fetch(
                    `https://developer.paytmmoney.com/fno/v1/option-chain?type=CALL&symbol=${ticker}&exchange=${exchange}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-jwt-token": PAYTM_ACCESS_TOKEN,
                        },
                    }
                );

                const data = await response.json();
                if (!data.data?.results?.length) return {};

                const stock = data.data.results[0];

                return {
                    open: stock.spot_price || "N/A",
                    prevClose: stock.price || "N/A",
                    volume: stock.traded_vol || "N/A",
                    oi: stock.oi || "N/A",
                    oiChange: stock.oi_net_chg || "N/A",
                    spotPrice: stock.spot_price || "N/A",
                };
            } catch (error) {
                console.error("⚠️ Market Data Fetch Error:", error);
                return {};
            }
        };

        // Fetch all data in parallel
        const [callOptions, putOptions, lotSize, marketData] = await Promise.all([
            fetchOptionsData("CALL"),
            fetchOptionsData("PUT"),
            fetchLotSize(),
            fetchMarketData(),
        ]);

        // Sort Options by Strike Price
        callOptions.sort((a, b) => a.strike - b.strike);
        putOptions.sort((a, b) => a.strike - b.strike);

        // Final JSON Response
        return new Response(
            JSON.stringify({
                ticker,
                expiryDate,
                exchange,
                instrument: "OPTIDX",
                lotSize,
                marketData,
                callOptions,
                putOptions,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (err) {
        console.error("❌ API Fetch Error:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
