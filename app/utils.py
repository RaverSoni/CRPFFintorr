from functools import lru_cache
import time
import yfinance as yf

# ✅ Cache results for 60 seconds (reduce API calls)
@lru_cache(maxsize=50)
def fetch_stock_info(ticker):
    try:
        stock = yf.Ticker(ticker)
        stock_data = stock.history(period="1d")

        if stock_data.empty:
            print(f"⚠️ No stock data found for {ticker}")
            return None

        latest_price = stock_data["Close"].iloc[-1]
        return {
            'ticker': ticker,
            'price': latest_price,
            'change': stock.info.get('regularMarketChange', 0),
            'percentage': stock.info.get('regularMarketChangePercent', 0),
            'open': stock.info.get('open', 0),
            'high': stock.info.get('dayHigh', 0),
            'low': stock.info.get('dayLow', 0),
            'volume': stock.info.get('volume', 0),
            'marketCap': stock.info.get('marketCap', 0),
        }
    except Exception as e:
        print(f"❌ Error fetching stock data for {ticker}: {e}")
        return None

# ✅ Invalidate cache every 60 seconds to avoid stale prices
def invalidate_cache():
    fetch_stock_info.cache_clear()
    print("🔄 Stock cache cleared")

# Call invalidate_cache() every 60 seconds
import threading
threading.Timer(60, invalidate_cache).start()