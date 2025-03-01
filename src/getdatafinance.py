import yfinance as yf

# yf.pdr_override()
# session = yf.shared._session
# session.cookies.clear()

ticker = yf.Ticker("AAPL")
data = ticker.history(period="1y")
print(data)
