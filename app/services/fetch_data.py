# app/services/fetch_data.py
import yfinance as yf
import time
from datetime import datetime
from django.core.cache import cache

def fetch_data(symbol, retries=3):
    for attempt in range(retries):
        try:
            print(f"Fetching data for {symbol} (Attempt {attempt + 1})...")
            data = yf.download(symbol, period="1wk", interval="1d")
            if data.empty:
                raise ValueError(f"No data found for {symbol}")
            return data
        except Exception as e:
            print(f"Error fetching data: {e}")
            time.sleep(1)
    raise ValueError(f"Failed to fetch data for {symbol} after {retries} retries")

def fetch_recent_data(symbol):
    cache_key = f"stock_data_{symbol}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    df = fetch_data(symbol)
    open_price = round(df['Open'].iloc[-1], 2)
    high_price = round(df['High'].iloc[-1], 2)
    low_price = round(df['Low'].iloc[-1], 2)
    low_52wk = round(df['Low'].min(), 2)
    previous_close = df['Close'].iloc[-2]
    last_close = df['Close'].iloc[-1]
    day_change = round(last_close - previous_close, 2)
    day_change_percentage = round((day_change / previous_close) * 100, 2)

    data = {
        "symbol": symbol,
        "open": open_price,
        "high": high_price,
        "low": low_price,
        "low_52wk": low_52wk,
        "day_change": day_change,
        "day_change_percentage": day_change_percentage,
        "points": round(last_close, 2)
    }
    cache.set(cache_key, data, timeout=60)
    return data
