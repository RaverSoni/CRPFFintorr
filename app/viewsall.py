# app/views.py


from django.http import JsonResponse
import yfinance as yf
import time
from datetime import datetime, timedelta
from django.core.cache import cache
from cachetools import TTLCache
import logging


from django.http import HttpResponse

from django.shortcuts import render

import plotly.graph_objects as go


# Set up logging
logger = logging.getLogger(__name__)
def home(request):
    return HttpResponse("Hello, Django!")

# def fetch_data(symbol, retries=3):
#     attempt = 0
#     while attempt < retries:
#         try:
#             print(f"Fetching data for {symbol} (Attempt {attempt + 1})...")
#             data = yf.download(symbol, period="1y", interval="1d")  # Adjust interval as needed
#             if data.empty:
#                 raise ValueError(f"No data found for {symbol}")
#             return data
#         except Exception as e:
#             print(f"Error fetching data: {e}")
#             attempt += 1
#             time.sleep(1)  # Pause between retries
#     raise ValueError(f"Failed to fetch data for {symbol} after {retries} retries")

# def fetch_recent_data(symbol):
#     cache_key = f"stock_data_{symbol}"
#     cached_data = cache.get(cache_key)

#     if cached_data:
#         return cached_data

#     try:
#         df = fetch_data(symbol)

#         if df.empty or len(df) < 2:
#             raise ValueError("Insufficient data to calculate metrics.")

#         open_price = round(df['Open'].iloc[-1], 2)
#         price = round(df['Price'].iloc[-1], 2)
#         high_price = round(df['High'].iloc[-1], 2)
#         low_price = round(df['Low'].iloc[-1], 2)
#         low_52wk = round(df['Low'].min(), 2)

#         previous_close = df['Close'].iloc[-2]
#         last_close = df['Close'].iloc[-1]
#         day_change = round(last_close - previous_close, 2)
#         day_change_percentage = round((day_change / previous_close) * 100, 2)

#         data = {
#             "symbol": symbol,
#             "open": open_price,
#             "high": high_price,
#             "low": low_price,
#             "low_52wk": low_52wk,
#             "day_change": day_change,
#             "day_change_percentage": day_change_percentage,
#             "points": round(last_close, 2)
#         }

#         cache.set(cache_key, data, timeout=60)  # Cache for 60 seconds
#         return data

#     except Exception as e:
#         logger.error(f"Error fetching recent data for {symbol}: {e}")
#         return {"error": str(e)}

    
# def get_index_data(request, ticker_symbol):
#     try:
#         ticker = yf.Ticker(ticker_symbol)
#         index_data = ticker.history(period="1d")
        
#         if index_data.empty:
#             return JsonResponse({"error": "No data available for the ticker."}, status=404)

#         data = {
#             "index": ticker_symbol,
#             "date": index_data.index.strftime("%Y-%m-%d").tolist(),
#             "close": index_data["Close"].tolist(),
#             "high": index_data["High"].tolist(),
#             "low": index_data["Low"].tolist(),
#             "open": index_data["Open"].tolist(),
#         }

#         return JsonResponse(data)
#     except Exception as e:
#         logger.error(f"Error fetching index data for {ticker_symbol}: {e}")
#         return JsonResponse({"error": str(e)}, status=500)
    
def fetch_data(symbol, retries=3):
    """
    Fetch historical data for the given symbol using yfinance.
    Retries up to `retries` times if there's a failure.
    """
    attempt = 0
    while attempt < retries:
        try:
            print(f"Fetching data for {symbol} (Attempt {attempt + 1})...")
            df = yf.download(symbol, period="1y", interval="1d")  # Fetch 1 year of daily data
            if df.empty:
                raise ValueError(f"No data found for {symbol}")
            return df
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            attempt += 1
            time.sleep(1)  # Pause between retries
    raise ValueError(f"Failed to fetch data for {symbol} after {retries} retries")


def fetch_recent_data(symbol):
    """
    Fetch recent data including current price, day change, and metrics.
    """
    cache_key = f"stock_data_{symbol}"
    cached_data = cache.get(cache_key)

    if cached_data:
        return cached_data

    try:
        # Fetch historical data
        df = fetch_data(symbol)

        if df.empty or len(df) < 2:
            raise ValueError("Insufficient data to calculate metrics.")

        # Extract data
        open_price = round(df['Open'].iloc[-1], 2)
        close_price = round(df['Close'].iloc[-1], 2)
        high_price = round(df['High'].iloc[-1], 2)
        low_price = round(df['Low'].iloc[-1], 2)
        low_52wk = round(df['Low'].min(), 2)
        high_52wk = round(df['High'].max(), 2)
        previous_close = round(df['Close'].iloc[-2], 2)

        # Fetch current price
        ticker = yf.Ticker(symbol)
        current_price = ticker.info.get('regularMarketPrice', close_price)

        # Calculate day change and percentage
        day_change = round(current_price - previous_close, 2)
        day_change_percentage = round((day_change / previous_close) * 100, 2)

        # Prepare response
        data = {
            "symbol": symbol,
            "open": open_price,
            "high": high_price,
            "low": low_price,
            "close": close_price,
            "previous_close": previous_close,
            "high_52wk": high_52wk,
            "low_52wk": low_52wk,
            "current_price": current_price,
            "day_change": day_change,
            "day_change_percentage": day_change_percentage,
        }

        cache.set(cache_key, data, timeout=60)
        return data

    except Exception as e:
        print(f"Error fetching recent data for {symbol}: {e}")
        return {"error": str(e)}
    

def get_index_data(request, ticker_symbol):
    try:
        ticker = yf.Ticker(ticker_symbol)
        index_data = ticker.history(period="1d")
        info = ticker.info

        # Ensure data exists
        if index_data.empty:
            return JsonResponse({"error": "No data available for the ticker."}, status=404)

        # Safely fetch 52-week data
        low_52wk = info.get('fiftyTwoWeekLow', None)
        high_52wk = info.get('fiftyTwoWeekHigh', None)

        # Fetch current price and previous close
        current_price = index_data["Close"].iloc[-1] if not index_data["Close"].isnull().all() else None
        previous_close = info.get('previousClose', None)

        # Calculate day change and percentage change
        day_change = None
        percentage_change = None
        if current_price is not None and previous_close is not None:
            day_change = round(current_price - previous_close, 2)
            percentage_change = round((day_change / previous_close) * 100, 2)

        # Build response data
        data = {
            "index": ticker_symbol,
            "date": index_data.index.strftime("%Y-%m-%d").tolist(),  # Convert datetime index to strings
            "low_52wk": round(low_52wk, 2) if low_52wk is not None else None,
            "high_52wk": round(high_52wk, 2) if high_52wk is not None else None,
            "current_price": round(current_price, 2) if current_price is not None else None,
            "day_change": day_change,
            "percentage_change": percentage_change,
            "close": round(index_data["Close"], 2).tolist(),
            "high": round(index_data["High"], 2).tolist(),
            "low": round(index_data["Low"], 2).tolist(),
            "open": round(index_data["Open"], 2).tolist(),
        }

        return JsonResponse(data)
    except Exception as e:
        # Log the error for debugging
        logger.error(f"Error fetching index data for {ticker_symbol}: {e}")
        return JsonResponse({"error": str(e)}, status=500)



# def fetch_stock_data_and_compute_gainers_losers(request):
#     tickers = ['INFY', 'HDFCBANK', 'RELIANCE', 'SBILIFE', 'DMART', 'SBIN', 'ITC', 
#                'BRITANNIA', 'INDIGO', 'LALPATHLAB', 'AARTIIND', 'INDIACEM', 'ZOMATO',
#                'MPHASIS', 'HAPPSTMNDS', 'KSOLVES', 'M&M', 'EIHAHOTELS', 'EIHOTEL',
#                'MAXHEALTH', 'JTLIND', 'APLAPOLLO', 'HCLTECH', 'AVANTEL', 'TRIDENT', 
#                'BORORENEW', 'RVNL', 'COALINDIA', 'NMDC', 'RECLTD', 'COCHINSHIP', 
#                'COCHMAL', 'LICI', 'PFC', 'HBLPOWER', 'TTML', 'WIPRO', 'WELSPUNLIV', 
#                'WELCORP', 'WELENT', 'ALOKINDS', 'CYIENTDLM', 'TAJGVK', 'ADVANIHOTR',
#                'IOC', 'TATAINVEST', 'TATASTEEL', 'TATACONSUM', 'TATATECH', 
#                'ADANIENT', 'ADANIPORTS', 'ADANIENSOL', 'ADANIPOWER', 'TATAPOWER', 
#                'JIOFIN', 'TCS', 'TATAMOTORS', 'TATACOMM', 'GRANULES', 'IRCTC', 
#                'IRFC', 'IREDA', 'IOB', 'BHEL', 'BANKBARODA', 'GESHIP', 'GAIL', 
#                'SAIL', 'BPCL', 'EICHERMOT', 'NBCC', 'HAL', 'POWERGRID', 'SUZLON']

#     data_list = []
#     for ticker in tickers:
#         if not ticker.endswith('.NS'):
#             ticker += '.NS'
        
#         print(f"Fetching data for {ticker}")  # Debugging statement

#         try:
#             stock_data = yf.Ticker(ticker)
#             stock_quote = stock_data.history(period="1d").tail(1)
            
#             # Debugging: check if stock_quote is empty
#             print(f"Stock Quote for {ticker}: {stock_quote}") 

#             price = stock_quote['Close'].values[0] if not stock_quote.empty else None
#             close = stock_quote['Close'].values[0] if not stock_quote.empty else None
#             name = stock_data.info.get('longName', 'N/A')
            
#             if close is not None and close != 0:
#                 percentage_change = ((price - close) / close) * 100
#             else:
#                 percentage_change = 0
            
#             data_list.append({
#                 'symbol': ticker,
#                 'name': name,
#                 'price': price,
#                 'close': close,
#                 'percentage_change': percentage_change
#             })
#         except Exception as e:
#             print(f"Error fetching data for {ticker}: {e}")

#     # Debugging: Check if data_list is populated
#     print(f"Data List: {data_list}")

#     sorted_data = sorted(data_list, key=lambda x: x['percentage_change'] if x['percentage_change'] is not None else float('-inf'), reverse=True)

#     # Debugging: Check the sorted data
#     print(f"Sorted Data: {sorted_data}")

#     top_gainers = sorted_data[:5]
#     top_losers = sorted_data[-5:]

#     # Debugging: Check top gainers and losers
#     print(f"Top Gainers: {top_gainers}")
#     print(f"Top Losers: {top_losers}")

#     return render(request, 'dashboard.html', {'top_gainers': top_gainers, 'top_losers': top_losers})


# def api_update_gainers_losers(request):
#     tickers = ['INFY', 'HDFCBANK', 'RELIANCE', 'SBILIFE', 'DMART']
#     data_list = []
#     for ticker in tickers:
#         if not ticker.endswith('.NS'):
#             ticker += '.NS'
        
#         print(f"Fetching data for {ticker}")  # Debugging statement

#         try:
#             stock_data = yf.Ticker(ticker)
#             stock_quote = stock_data.history(period="1d").tail(1)

#             # Debugging: check if stock_quote is empty
#             print(f"Stock Quote for {ticker}: {stock_quote}")

#             price = stock_quote['Close'].values[0] if not stock_quote.empty else None
#             open_price = stock_quote['Open'].values[0] if not stock_quote.empty else None
#             change = (price - open_price) if open_price else None
#             percentage_change = ((price - open_price) / open_price) * 100 if open_price else None
            
#             data_list.append({'symbol': ticker, 'price': price, 'percentage_change': percentage_change, 'change': change})
#         except Exception as e:
#             print(f"Error fetching data for {ticker}: {e}")

#     # Safe sorting by providing a default value (0 or a very low value) for None
#     sorted_data = sorted(data_list, key=lambda x: x['percentage_change'] if x['percentage_change'] is not None else float('-inf'), reverse=True)

#     # Debugging: check sorted data
#     print(f"Sorted Data: {sorted_data}")

#     top_gainers = sorted_data[:5]
#     top_losers = sorted_data[-5:]

#     return JsonResponse({'top_gainers': top_gainers, 'top_losers': top_losers})

# def fetch_stock_data(tickers, period="1d", page=1, per_page=10, volume_threshold=1000000):
#     """
#     Fetches stock data for a list of tickers, identifies trending stocks based on volume, 
#     and returns paginated results.

#     :param tickers: List of stock tickers to fetch data for.
#     :param period: Historical data period (default is "1d").
#     :param page: Current page for pagination (default is 1).
#     :param per_page: Number of stocks to display per page (default is 10).
#     :param volume_threshold: Volume threshold for identifying trending stocks.
#     :return: Dictionary with stock data, trending stocks, and metadata.
#     """
#     results = []
#     trending_stocks = []
#     total_stocks = len(tickers)
#     start_index = (page - 1) * per_page
#     end_index = start_index + per_page
#     tickers_to_fetch = tickers[start_index:end_index]

#     for ticker in tickers_to_fetch:
#         if not ticker.endswith('.NS'):
#             ticker += '.NS'
#         try:
#             # Fetch stock data
#             stock_data = yf.Ticker(ticker)
#             stock_quote = stock_data.history(period=period).tail(1)
#             stock_info_data = stock_data.info  # Access metadata
            
#             # Extract data
#             stock_info = {
#                 'ticker': ticker,
#                 'name': stock_info_data.get('longName', 'N/A'),
#                 'price': round(float(stock_quote['Close'].values[0]), 2) if not stock_quote.empty else None,
#                 'change': round(stock_info_data.get('regularMarketChangePercent', 0), 2),
#                 'open': round(float(stock_quote['Open'].values[0]), 2) if not stock_quote.empty else None,
#                 'high': round(float(stock_quote['High'].values[0]), 2) if not stock_quote.empty else None,
#                 'low': round(float(stock_quote['Low'].values[0]), 2) if not stock_quote.empty else None,
#                 'volume': int(stock_quote['Volume'].values[0]) if not stock_quote.empty else None,
#                 'avg_volume': stock_info_data.get('averageVolume', 'N/A'),
#                 'market_cap': stock_info_data.get('marketCap', 'N/A'),
#                 'pe_ratio': stock_info_data.get('trailingPE', 'N/A'),
#                 'high_52wk': stock_info_data.get('fiftyTwoWeekHigh', 'N/A'),
#                 'low_52wk': stock_info_data.get('fiftyTwoWeekLow', 'N/A'),
#                 'sector': stock_info_data.get('sector', 'N/A')
#             }

#             # Check if volume exceeds the threshold for trending stocks
#             if stock_info['volume'] and stock_info['volume'] > volume_threshold:
#                 trending_stocks.append(stock_info)

#             results.append(stock_info)
#         except Exception as e:
#             results.append({'error': f"Failed to fetch data for {ticker}: {e}"})

#     return {
#         'stocks': results,
#         'trending_stocks': trending_stocks,
#         'total': total_stocks,
#         'current_page': page,
#         'per_page': per_page,
#         'total_pages': (total_stocks + per_page - 1) // per_page
#     }

def fetch_stock_data_and_compute_gainers_losers(request):
    tickers = ['20MICRONS', '21STCENMGM', '360ONE', '3IINFOLTD', '3MINDIA', '3PLAND', '5PAISA', '63MOONS', 'A2ZINFRA', 'AAATECH', 'AADHARHFC', 
               'AAKASH', 'AAREYDRUGS', 'AARON', 'AARTECH', 'AARTIDRUGS', 'AARTIIND', 'AARTIPHARM', 'AARTISURF', 'AARVEEDEN', 'AARVI', 'AAVAS', 
               'ABAN', 'ABB', 'ABBOTINDIA', 'ABCAPITAL', 'ABDL', 'ABFRL', 'ABMINTLLTD', 'ABSLAMC', 'ACC', 'ACCELYA', 'ACCURACY', 'ACE', 'ACEINTEG',
                 'ACI', 'ACL', 'ACLGATI', 'ADANIENSOL', 'ADANIENT', 'ADANIGREEN', 'ADANIPORTS', 'ADANIPOWER', 'ADFFOODS', 'ADL', 'ADORWELD', 
                 'ADROITINFO', 'ADSL', 'ADVANIHOTR', 'ADVENZYMES', 'AEGISLOG', 'AEROFLEX', 'AETHER', 'AFFLE', 'AFIL', 'AGARIND', 'AGI', 'AGIIL', 
                 'AGRITECH', 'AGROPHOS', 'AGSTRA', 'AHL', 'AHLADA', 'AHLEAST', 'AHLUCONT', 'AIAENG', 'AIIL', 'AIRAN', 'AIROLAM', 'AJANTPHARM', 
                 'AJMERA', 'AJOONI', 'AKASH', 'AKG', 'AKI', 'AKSHAR', 'AKSHARCHEM', 'AKSHOPTFBR', 'AKUMS', 'AKZOINDIA', 'ALANKIT', 'ALBERTDAVD', 
                 'ALEMBICLTD', 'ALICON', 'ALKALI', 'ALKEM', 'ALKYLAMINE', 'ALLCARGO', 'ALLSEC', 'ALMONDZ', 'ALOKINDS', 'ALPA', 'ALPHAGEO', 
                 'ALPSINDUS', 'AMBER', 'AMBICAAGAR', 'AMBIKCO', 'AMBUJACEM', 'AMDIND', 'AMIORG', 'AMJLAND', 'AMNPLST', 'AMRUTANJAN', 'ANANDRATHI',
                   'ANANTRAJ', 'ANDHRAPAP', 'ANDHRSUGAR', 'ANGELONE', 'ANIKINDS', 'ANMOL', 'ANSALAPI', 'ANTGRAPHIC', 'ANUP', 'ANURAS', 'APARINDS', 
                   'APCL', 'APCOTEXIND', 'APEX', 'APLAPOLLO', 'APLLTD', 'APOLLO', 'APOLLOHOSP', 'APOLLOPIPE', 'APOLLOTYRE', 'APOLSINHOT',
                     'APTECHT', 'APTUS', 'ARCHIDPLY', 'ARCHIES', 'ARE&M', 'ARENTERP', 'ARIES', 'ARIHANTCAP', 'ARIHANTSUP', 'ARMANFIN', 
                     'AROGRANITE', 'ARROWGREEN', 'ARSHIYA', 'ARSSINFRA', 'ARTEMISMED', 'ARTNIRMAN', 'ARVEE', 'ARVIND', 'ARVINDFASN', 
                     'ARVSMART', 'ASAHIINDIA', 'ASAHISONG', 'ASAL', 'ASALCBR', 'ASHAPURMIN', 'ASHIANA', 'ASHIMASYN', 'ASHOKA', 'ASHOKAMET',
                       'ASHOKLEY', 'ASIANENE', 'ASIANHOTNR', 'ASIANPAINT', 'ASIANTILES', 'ASKAUTOLTD', 'ASMS', 'ASPINWALL', 'ASTEC', 'ASTERDM', 
                       'ASTRAL', 'ASTRAMICRO', 'ASTRAZEN', 'ASTRON', 'ATALREAL', 'ATAM', 'ATFL', 'ATGL', 'ATL', 'ATLANTAA', 'ATUL', 'ATULAUTO',
                         'AUBANK', 'AURIONPRO', 'AUROPHARMA', 'AURUM', 'AUSOMENT', 'AUTOAXLES', 'AUTOIND', 'AVADHSUGAR', 'AVALON', 'AVANTEL',
                           'AVANTIFEED', 'AVG', 'AVONMORE', 'AVROIND', 'AVTNPL', 'AWFIS', 'AWHCL', 'AWL', 'AXISBANK', 'AXISCADES', 'AXITA', 
                           'AYMSYNTEX', 'AZAD', 'BAFNAPH', 'BAGFILMS', 'BAIDFIN', 'BAJAJ-AUTO', 'BAJAJCON', 'BAJAJELEC', 'BAJAJFINSV', 
                           'BAJAJHCARE', 'BAJAJHIND', 'BAJAJHLDNG', 'BAJEL', 'BAJFINANCE', 'BALAJITELE', 'BALAMINES', 'BALAXI',
                             'BALKRISHNA', 'BALKRISIND', 'BALMLAWRIE', 'BALPHARMA', 'BALRAMCHIN', 'BALUFORGE', 'BANARBEADS', 
                             'BANARISUG', 'BANCOINDIA', 'BANDHANBNK', 'BANG', 'BANKA', 'BANKBARODA', 'BANKINDIA', 'BANSALWIRE', 
                             'BANSWRAS', 'BARBEQUE', 'BASF', 'BASML', 'BATAINDIA', 'BAYERCROP', 'BBL', 'BBOX', 'BBTC', 'BBTCL',
                               'BCLIND', 'BCONCEPTS', 'BDL', 'BEARDSELL', 'BECTORFOOD', 'BEDMUTHA', 'BEL', 'BEML', 'BEPL', 'BERGEPAINT',
                                 'BESTAGRO', 'BFINVEST', 'BFUTILITIE', 'BGRENERGY', 'BHAGCHEM', 'BHAGERIA', 'BHAGYANGR', 'BHANDARI',
                                   'BHARATFORG', 'BHARATGEAR', 'BHARATRAS', 'BHARATWIRE', 'BHARTIARTL', 'BHARTIHEXA', 'BHEL', 'BIGBLOC',
                                     'BIKAJI', 'BIL', 'BINANIIND', 'BIOCON', 'BIOFILCHEM', 'BIRLACABLE', 'BIRLACORPN', 'BIRLAMONEY',
                                       'BLAL', 'BLBLIMITED', 'BLISSGVS', 'BLKASHYAP', 'BLS', 'BLSE', 'BLUECHIP', 'BLUEDART', 'BLUEJET',
                                         'BLUESTARCO', 'BODALCHEM', 'BOMDYEING', 'BOROLTD', 'BORORENEW', 'BOROSCI', 'BOSCHLTD', 'BPCL',
                                           'BPL', 'BRIGADE', 'BRITANNIA', 'BRNL', 'BROOKS', 'BSE', 'BSHSL', 'BSL', 'BSOFT', 'BTML',
         'BURNPUR', 'BUTTERFLY', 'BVCL', 'BYKE', 'CALSOFT', 'CAMLINFINE', 'CAMPUS', 'CAMS', 'CANBK', 'CANFINHOME',
           'CANTABIL', 'CAPACITE', 'CAPITALSFB', 'CAPLIPOINT', 'CAPTRUST', 'CARBORUNIV', 'CAREERP', 'CARERATING', 
           'CARTRADE', 'CARYSIL', 'CASTROLIND', 'CCHHL', 'CCL', 'CDSL', 'CEATLTD', 'CEIGALL', 'CELEBRITY', 'CELLO', 
           'CENTENKA', 'CENTEXT', 'CENTRALBK', 'CENTRUM', 'CENTUM', 'CENTURYPLY', 'CENTURYTEX', 'CERA', 'CEREBRAINT',
             'CESC', 'CGCL', 'CGPOWER', 'CHALET', 'CHAMBLFERT', 'CHEMBOND', 'CHEMCON', 'CHEMFAB', 'CHEMPLASTS', 'CHENNPETRO',
               'CHEVIOT', 'CHOICEIN', 'CHOLAFIN', 'CHOLAHLDNG', 'CIEINDIA', 'CIGNITITEC', 'CINELINE', 'CINEVISTA', 'CIPLA', 
               'CLEAN', 'CLEDUCATE', 'CLSEL', 'CMSINFO', 'COALINDIA', 'COASTCORP', 'COCHINSHIP', 'COFFEEDAY', 'COFORGE',
                 'COLPAL', 'COMPUSOFT', 'COMSYN', 'CONCOR', 'CONCORDBIO', 'CONFIPET', 'CONSOFINVT', 'CONTROLPR', 'CORALFINAC',
                   'CORDSCABLE', 'COROMANDEL', 'COSMOFIRST', 'COUNCODOS', 'CRAFTSMAN', 'CREATIVE', 'CREATIVEYE', 'CREDITACC', 
                   'CREST', 'CRISIL', 'CROMPTON', 'CROWN', 'CSBBANK', 'CSLFINANCE', 'CTE', 'CUB', 'CUBEXTUB', 'CUMMINSIND',
                     'CUPID', 'CYBERMEDIA', 'CYBERTECH', 'CYIENT', 'CYIENTDLM', 'DABUR', 'DALBHARAT', 'DALMIASUG', 'DAMODARIND',
                       'DANGEE', 'DATAMATICS', 'DATAPATTNS', 'DAVANGERE', 'DBCORP', 'DBL', 'DBOL', 'DBREALTY', 'DBSTOCKBRO', 
                       'DCAL', 'DCBBANK', 'DCI', 'DCM', 'DCMFINSERV', 'DCMNVL', 'DCMSHRIRAM', 'DCMSRIND', 'DCW', 'DCXINDIA', 
                       'DECCANCE', 'DEEDEV', 'DEEPAKFERT', 'DEEPAKNTR', 'DEEPENR', 'DEEPINDS', 'DELHIVERY', 'DELPHIFX', 'DELTACORP',
                         'DELTAMAGNT', 'DEN', 'DENORA', 'DEVIT', 'DEVYANI', 'DGCONTENT', 'DHAMPURSUG', 'DHANBANK', 'DHANI',
                           'DHANUKA', 'DHARMAJ', 'DHRUV', 'DHUNINV', 'DIACABS', 'DIAMINESQ', 'DIAMONDYD', 'DICIND', 'DIGIDRIVE',
                             'DIGISPICE', 'DIGJAMLMTD', 'DIL', 'DISHTV', 'DIVGIITTS', 'DIVISLAB', 'DIXON', 'DJML', 'DLF',
                               'DLINKINDIA', 'DMART', 'DMCC', 'DNAMEDIA', 'DODLA', 'DOLATALGO', 'DOLLAR', 'DOLPHIN', 'DOMS',
                                 'DONEAR', 'DPABHUSHAN', 'DPSCLTD', 'DPWIRES', 'DRCSYSTEMS', 'DREAMFOLKS', 'DREDGECORP',
                                   'DRREDDY', 'DSSL', 'DTIL', 'DUCON', 'DVL', 'DWARKESH', 'DYCL', 'DYNAMATECH', 'DYNPRO',
                                     'E2E', 'EASEMYTRIP', 'ECLERX', 'EDELWEISS', 'EICHERMOT', 'EIDPARRY', 'EIFFL', 'EIHAHOTELS',
                                       'EIHOTEL', 'EIMCOELECO', 'EKC', 'ELDEHSG', 'ELECON', 'ELECTCAST', 'ELECTHERM', 'ELGIEQUIP',
                                         'ELGIRUBCO', 'ELIN', 'EMAMILTD', 'EMAMIPAP', 'EMAMIREAL', 'EMBDL', 'EMCURE', 'EMIL',
                                           'EMKAY', 'EMMBI', 'EMSLIMITED', 'EMUDHRA', 'ENDURANCE', 'ENERGYDEV', 'ENGINERSIN',
                                             'ENIL', 'ENTERO', 'EPACK', 'EPIGRAL', 'EPL', 'EQUIPPP', 'EQUITASBNK', 'ERIS', 'EROSMEDIA',
         'ESABINDIA', 'ESAFSFB', 'ESCORTS', 'ESSARSHPNG', 'ESSENTIA', 'ESTER', 'ETHOSLTD', 'EUROTEXIND', 'EVEREADY',
           'EVERESTIND', 'EXCEL', 'EXCELINDUS', 'EXICOM', 'EXIDEIND', 'EXPLEOSOL', 'EXXARO', 'FACT', 'FAIRCHEMOR', 'FAZE3Q',
             'FCL', 'FCSSOFT', 'FDC', 'FEDERALBNK', 'FEDFINA', 'FEL', 'FELDVR', 'FIBERWEB', 'FIEMIND', 'FILATEX', 'FILATFASH',
               'FINCABLES', 'FINEORG', 'FINOPB', 'FINPIPE', 'FIRSTCRY', 'FIVESTAR', 'FLAIR', 'FLEXITUFF', 'FLFL', 'FLUOROCHEM',
                 'FMGOETZE', 'FMNL', 'FOCUS', 'FOODSIN', 'FORCEMOT', 'FORTIS', 'FOSECOIND', 'FSL', 'FUSION', 'GABRIEL', 'GAEL',
                   'GAIL', 'GALAXYSURF', 'GALLANTT', 'GANDHAR', 'GANDHITUBE', 'GANECOS', 'GANESHBE', 'GANESHHOUC', 'GANGAFORGE',
                     'GANGESSECU', 'GARFIBRES', 'GATECH', 'GATECHDVR', 'GATEWAY', 'GEECEE', 'GEEKAYWIRE', 'GENCON', 'GENESYS',
                       'GENSOL', 'GENUSPAPER', 'GENUSPOWER', 'GEOJITFSL', 'GEPIL', 'GESHIP', 'GET&D', 'GFLLIMITED', 'GHCL',
                         'GHCLTEXTIL', 'GICHSGFIN', 'GICRE', 'GILLANDERS', 'GILLETTE', 'GINNIFILA', 'GIPCL', 'GKWLIMITED',
                           'GLAND', 'GLAXO', 'GLENMARK', 'GLFL', 'GLOBAL', 'GLOBALVECT', 'GLOBE', 'GLOBUSSPR', 'GLOSTERLTD',
                             'GLS', 'GMBREW', 'GMDCLTD', 'GMMPFAUDLR', 'GMRINFRA', 'GMRP&UI', 'GNA', 'GNFC', 'GOACARBON', 
                             'GOCLCORP', 'GOCOLORS', 'GODFRYPHLP', 'GODHA', 'GODIGIT', 'GODREJAGRO', 'GODREJCP', 'GODREJIND', 
                             'GODREJPROP', 'GOKEX', 'GOKUL', 'GOKULAGRO', 'GOLDENTOBC', 'GOLDIAM', 'GOLDTECH', 'GOODLUCK',
                               'GOPAL', 'GOYALALUM', 'GPIL', 'GPPL', 'GPTHEALTH', 'GPTINFRA', 'GRANULES', 'GRAPHITE', 'GRASIM', 
                               'GRAVITA', 'GREAVESCOT', 'GREENLAM', 'GREENPANEL', 'GREENPLY', 'GREENPOWER', 'GRINDWELL', 'GRINFRA',            
        'GRMOVER', 'GROBTEA', 'GRPLTD', 'GRSE', 'GRWRHITECH', 'GSFC', 'GSLSU', 'GSPL', 'GSS', 'GTECJAINX',
          'GTL', 'GTLINFRA', 'GTPL', 'GUFICBIO', 'GUJALKALI', 'GUJAPOLLO', 'GUJGASLTD', 'GUJRAFFIA', 
          'GULFOILLUB', 'GULFPETRO', 'GULPOLY', 'GVKPIL', 'GVPTECH', 'HAL', 'HAPPSTMNDS', 'HAPPYFORGE', 
          'HARDWYN', 'HARIOMPIPE', 'HARRMALAYA', 'HARSHA', 'HATHWAY', 'HATSUN', 'HAVELLS', 'HAVISHA',
            'HBLPOWER', 'HBSL', 'HCC', 'HCG', 'HCL-INSYS', 'HCLTECH', 'HDFCAMC', 'HDFCBANK', 'HDFCLIFE',
              'HDIL', 'HEADSUP', 'HECPROJECT', 'HEG', 'HEIDELBERG', 'HEMIPROP', 'HERANBA', 'HERCULES',
                'HERITGFOOD', 'HEROMOTOCO', 'HESTERBIO', 'HEUBACHIND', 'HEXATRADEX', 'HFCL', 'HGINFRA', 
                'HGS', 'HIKAL', 'HIL', 'HILTON', 'HIMATSEIDE', 'HINDALCO', 'HINDCOMPOS', 'HINDCON', 'HINDCOPPER',
                  'HINDMOTORS', 'HINDOILEXP', 'HINDPETRO', 'HINDUNILVR', 'HINDWAREAP', 'HINDZINC', 'HIRECT',
                    'HISARMETAL', 'HITECH', 'HITECHCORP', 'HITECHGEAR', 'HLEGLAS', 'HLVLTD', 'HMAAGRO', 'HMT',
                      'HMVL', 'HNDFDS', 'HOMEFIRST', 'HONASA', 'HONAUT', 'HONDAPOWER', 'HOVS', 'HPAL', 'HPIL',
                        'HPL', 'HSCL', 'HTMEDIA', 'HUBTOWN', 'HUDCO', 'HUHTAMAKI', 'HYBRIDFIN', 'ICDSLTD', 'ICEMAKE',
                          'ICICIBANK', 'ICICIGI', 'ICICIPRULI', 'ICIL', 'ICRA', 'IDBI', 'IDEA', 'IDEAFORGE', 'IDFC',
                            'IDFCFIRSTB', 'IEL', 'IEX', 'IFBAGRO', 'IFBIND', 'IFCI', 'IFGLEXPOR', 'IGARASHI', 'IGL',
                              'IGPL', 'IIFL', 'IIFLSEC', 'IITL', 'IKIO', 'IL&FSENGG', 'IL&FSTRANS', 'IMAGICAA', 'IMFA', 
                              'IMPAL', 'IMPEXFERRO', 'INCREDIBLE', 'INDBANK', 'INDGN', 'INDHOTEL', 'INDIACEM', 'INDIAGLYCO', 
                              'INDIAMART', 'INDIANB', 'INDIANCARD', 'INDIANHUME', 'INDIASHLTR', 'INDIGO', 'INDIGOPNTS', 'INDNIPPON',
     'INDOAMIN', 'INDOBORAX', 'INDOCO', 'INDORAMA', 'INDOSTAR', 'INDOTECH', 'INDOTHAI', 'INDOWIND', 'INDRAMEDCO', 'INDSWFTLAB',
       'INDSWFTLTD', 'INDTERRAIN', 'INDUSINDBK', 'INDUSTOWER', 'INFIBEAM', 'INFOBEAN', 'INFOMEDIA', 'INFY', 'INGERRAND',
         'INNOVACAP', 'INOXGREEN', 'INOXINDIA', 'INOXWIND', 'INSECTICID', 'INSPIRISYS', 'INTELLECT', 'INTENTECH', 'INTLCONV',
           'INVENTURE', 'IOB', 'IOC', 'IOLCP', 'IONEXCHANG', 'IPCALAB', 'IPL', 'IRB', 'IRCON', 'IRCTC', 'IREDA', 'IRFC', 'IRIS',
             'IRISDOREME', 'IRMENERGY', 'ISEC', 'ISFT', 'ISGEC', 'ITC', 'ITDC', 'ITDCEM', 'ITI', 'IVC', 'IVP', 'IWEL', 'IXIGO',
               'IZMO', 'J&KBANK', 'JAGRAN', 'JAGSNPHARM', 'JAIBALAJI', 'JAICORPLTD', 'JAIPURKURT', 'JAMNAAUTO', 'JASH',
                 'JAYAGROGN', 'JAYBARMARU', 'JAYNECOIND', 'JAYSREETEA', 'JBCHEPHARM', 'JBMA', 'JCHAC', 'JETAIRWAYS', 
                 'JETFREIGHT', 'JGCHEM', 'JHS', 'JINDALPHOT', 'JINDALPOLY', 'JINDALSAW', 'JINDALSTEL', 'JINDRILL', 
                 'JINDWORLD', 'JIOFIN', 'JISLDVREQS', 'JISLJALEQS', 'JITFINFRA', 'JKCEMENT', 'JKIL', 'JKLAKSHMI', 
                 'JKPAPER', 'JKTYRE', 'JLHL', 'JMA', 'JMFINANCIL', 'JNKINDIA', 'JOCIL', 'JPOLYINVST', 'JPPOWER', 
                 'JSFB', 'JSL', 'JSWENERGY', 'JSWHL', 'JSWINFRA', 'JSWSTEEL', 'JTEKTINDIA', 'JTLIND', 'JUBLFOOD',
                   'JUBLINDS', 'JUBLINGREA', 'JUBLPHARMA', 'JUNIPER', 'JUSTDIAL', 'JWL', 'JYOTHYLAB', 'JYOTICNC',
                     'JYOTISTRUC', 'KABRAEXTRU', 'KAJARIACER', 'KAKATCEM', 'KALAMANDIR', 'KALYANI', 'KALYANIFRG',
                       'KALYANKJIL', 'KAMATHOTEL', 'KAMDHENU', 'KAMOPAINTS', 'KANANIIND', 'KANORICHEM', 'KANPRPLA', 
                       'KANSAINER', 'KAPSTON', 'KARMAENG', 'KARURVYSYA', 'KAUSHALYA', 'KAVVERITEL', 'KAYA', 'KAYNES',
                         'KBCGLOBAL', 'KCP', 'KCPSUGIND', 'KDDL', 'KEC', 'KECL', 'KEEPLEARN', 'KEI', 'KELLTONTEC',
                           'KERNEX', 'KESORAMIND', 'KEYFINSERV', 'KFINTECH', 'KHADIM', 'KHAICHEM', 'KHAITANLTD', 'KHANDSE',
                             'KICL', 'KILITCH', 'KIMS', 'KINGFA', 'KIOCL', 'KIRIINDUS', 'KIRLOSBROS', 'KIRLOSENG', 'KIRLOSIND',
                               'KIRLPNU', 'KITEX', 'KKCL', 'KMSUGAR', 'KNRCON', 'KOHINOOR', 'KOKUYOCMLN', 'KOLTEPATIL', 'KOPRAN',
                                 'KOTAKBANK', 'KOTARISUG', 'KOTHARIPET', 'KOTHARIPRO', 'KPIGREEN', 'KPIL', 'KPITTECH', 'KPRMILL',
                                   'KRBL', 'KREBSBIO', 'KRIDHANINF', 'KRISHANA', 'KRITI', 'KRITIKA', 'KRITINUT', 'KRONOX', 'KRSNAA',
                                     'KRYSTAL', 'KSB', 'KSCL', 'KSHITIJPOL', 'KSL', 'KSOLVES', 'KTKBANK', 'KUANTUM', 'LAGNAM', 'LAL',
                                       'LALPATHLAB', 'LAMBODHARA', 'LANCORHOL', 'LANDMARK', 'LAOPALA', 'LASA', 'LATENTVIEW', 'LATTEYS',
                                         'LAURUSLABS', 'LAXMICOT', 'LAXMIMACH', 'LCCINFOTEC', 'LEMONTREE', 'LEXUS', 'LFIC', 'LGBBROSLTD',
                                           'LGHL', 'LIBAS', 'LIBERTSHOE', 'LICHSGFIN', 'LICI', 'LIKHITHA', 'LINC', 'LINCOLN', 'LINDEINDIA',
                                             'LLOYDSENGG', 'LLOYDSME', 'LODHA', 'LOKESHMACH', 'LORDSCHLO', 'LOTUSEYE', 'LOVABLE', 'LOYALTEX',
                                               'LPDC', 'LT', 'LTF', 'LTFOODS', 'LTIM', 'LTTS', 'LUMAXIND', 'LUMAXTECH', 'LUPIN', 'LUXIND', 'LXCHEM',
                                                 'LYKALABS', 'LYPSAGEMS', 'M&M', 'M&MFIN', 'MAANALU', 'MACPOWER', 'MADHAV', 'MADHUCON', 'MADRASFERT',
                                                 'MAGADSUGAR', 'MAGNUM', 'MAHABANK', 'MAHAPEXLTD', 'MAHASTEEL', 'MAHEPC', 'MAHESHWARI', 'MAHLIFE', 'MAHLOG', 'MAHSCOOTER', 'MAHSEAMLES', 'MAITHANALL', 'MALLCOM', 'MALUPAPER', 'MANAKALUCO', 'MANAKCOAT', 'MANAKSIA', 'MANAKSTEEL', 'MANALIPETC', 'MANAPPURAM', 'MANCREDIT', 'MANGALAM', 'MANGCHEFER', 'MANGLMCEM', 'MANINDS', 'MANINFRA', 'MANKIND', 'MANOMAY', 'MANORAMA', 'MANORG', 'MANUGRAPH', 'MANYAVAR', 'MAPMYINDIA', 'MARALOVER', 'MARATHON', 'MARICO', 'MARINE', 'MARKSANS', 'MARSHALL', 'MARUTI', 'MASFIN', 'MASKINVEST', 'MASTEK', 'MATRIMONY', 'MAWANASUG', 'MAXESTATES', 'MAXHEALTH', 'MAXIND', 'MAYURUNIQ', 'MAZDA', 'MAZDOCK', 'MBAPL', 'MBECL', 'MBLINFRA', 'MCL', 'MCLEODRUSS', 'MCX', 'MEDANTA', 'MEDIASSIST', 'MEDICAMEQ', 'MEDICO', 'MEDPLUS', 'MEGASOFT', 'MEGASTAR', 'MENONBE', 'METROBRAND', 'METROPOLIS', 'MFSL', 'MGEL', 'MGL', 'MHLXMIRU', 'MHRIL', 'MICEL', 'MIDHANI', 'MINDACORP', 'MINDTECK', 'MIRCELECTR', 'MIRZAINT', 'MITCON', 'MITTAL', 'MKPL', 'MMFL', 'MMP', 'MMTC', 'MODIRUBBER', 'MODISONLTD', 'MODTHREAD', 'MOHITIND', 'MOIL', 'MOKSH', 'MOL', 'MOLDTECH', 'MOLDTKPAC', 'MONARCH', 'MONTECARLO', 'MORARJEE', 'MOREPENLAB', 'MOTHERSON', 'MOTILALOFS', 'MOTISONS', 'MOTOGENFIN', 'MPHASIS', 'MPSLTD', 'MRF', 'MRO-TEK', 'MRPL', 'MSPL', 'MSTCLTD', 'MSUMI', 'MTARTECH', 'MTEDUCARE', 'MTNL', 'MUFIN', 'MUFTI', 'MUKANDLTD', 'MUKKA', 'MUKTAARTS', 'MUNJALAU', 'MUNJALSHOW', 'MURUDCERA', 'MUTHOOTCAP', 'MUTHOOTFIN', 'MUTHOOTMF', 'MVGJL', 'NACLIND', 'NAGAFERT', 'NAGREEKCAP', 'NAGREEKEXP', 'NAHARCAP', 'NAHARINDUS', 'NAHARPOLY', 'NAHARSPING', 'NAM-INDIA', 'NARMADA', 'NATCOPHARM', 'NATHBIOGEN', 'NATIONALUM', 'NAUKRI', 'NAVA', 'NAVINFLUOR', 'NAVKARCORP', 'NAVNETEDUL', 'NAZARA', 'NBCC', 'NBIFIN', 'NCC', 'NCLIND', 'NDGL', 'NDL', 'NDLVENTURE', 'NDRAUTO', 'NDTV', 'NECCLTD', 'NECLIFE', 'NELCAST', 'NELCO', 'NEOGEN', 'NESCO', 'NESTLEIND', 'NETWEB', 'NETWORK18', 'NEULANDLAB', 'NEWGEN', 'NEXTMEDIA', 'NFL', 'NGIL', 'NGLFINE', 'NH', 'NHPC', 'NIACL', 'NIBL', 'NIITLTD', 'NIITMTS', 'NILAINFRA', 'NILASPACES', 'NILKAMAL', 'NINSYS', 'NIPPOBATRY', 'NIRAJ', 'NIRAJISPAT', 'NITCO', 'NITINSPIN', 'NITIRAJ', 'NKIND', 'NLCINDIA', 'NMDC', 'NOCIL', 'NOIDATOLL', 'NORBTEAEXP', 'NOVAAGRI', 'NRAIL', 'NRBBEARING', 'NRL', 'NSIL', 'NSLNISP', 'NTPC', 'NUCLEUS', 'NURECA', 'NUVAMA', 'NUVOCO', 'NYKAA', 'OAL', 'OBCL', 'OBEROIRLTY', 'OCCL', 'OFSS', 'OIL', 'OILCOUNTUB', 'OLAELEC', 'OLECTRA', 'OMAXAUTO', 'OMAXE', 'OMINFRAL', 'ONELIFECAP', 'ONEPOINT', 'ONGC', 'ONMOBILE', 'ONWARDTEC', 'OPTIEMUS', 'ORBTEXP', 'ORCHPHARMA', 'ORICONENT', 'ORIENTALTL', 'ORIENTBELL', 'ORIENTCEM', 'ORIENTCER', 'ORIENTELEC', 'ORIENTHOT', 'ORIENTLTD', 'ORIENTPPR', 'ORISSAMINE', 'ORTEL', 'ORTINLAB', 'OSIAHYPER', 'OSWALAGRO', 'OSWALGREEN', 'OSWALSEEDS', 'PAGEIND', 'PAISALO', 'PAKKA', 'PALASHSECU', 'PALREDTEC', 'PANACEABIO', 'PANACHE', 'PANAMAPET', 'PANSARI', 'PAR', 'PARACABLES', 'PARADEEP', 'PARAGMILK', 'PARAS', 'PARASPETRO', 'PARKHOTELS', 'PARSVNATH', 'PASUPTAC', 'PATANJALI', 'PATELENG', 'PATINTLOG', 'PAVNAIND', 'PAYTM', 'PCBL', 'PCJEWELLER', 'PDMJEPAPER', 'PDSL', 'PEARLPOLY', 'PEL', 'PENIND', 'PENINLAND', 'PERSISTENT', 'PETRONET', 'PFC', 'PFIZER', 'PFOCUS', 'PFS', 'PGEL', 'PGHH', 'PGHL', 'PGIL', 'PHOENIXLTD', 'PIDILITIND', 'PIGL', 'PIIND', 'PILANIINVS', 'PILITA', 'PIONEEREMB', 'PITTIENG', 'PIXTRANS', 'PKTEA', 'PLASTIBLEN', 'PLATIND', 'PLAZACABLE', 'PNB', 'PNBGILTS', 'PNBHOUSING', 'PNC', 'PNCINFRA', 'POCL', 'PODDARHOUS', 'PODDARMENT', 'POKARNA', 'POLICYBZR', 'POLYCAB', 'POLYMED', 'POLYPLEX', 'PONNIERODE', 'POONAWALLA', 'POWERGRID', 'POWERINDIA', 'POWERMECH', 'PPAP', 'PPL', 'PPLPHARMA', 'PRAENG', 'PRAJIND', 'PRAKASH', 'PRAKASHSTL', 'PRAXIS', 'PRECAM', 'PRECOT', 'PRECWIRE', 'PREMEXPLN', 'PREMIERPOL', 'PRESTIGE', 'PRICOLLTD', 'PRIMESECU', 'PRINCEPIPE', 'PRITI', 'PRITIKAUTO', 'PRIVISCL', 'PROZONER', 'PRSMJOHNSN', 'PRUDENT', 'PRUDMOULI', 'PSB', 'PSPPROJECT', 'PTC', 'PTCIL', 'PTL', 'PUNJABCHEM', 'PURVA', 'PVP', 'PVRINOX', 'PVSL', 'PYRAMID', 'QUESS', 'QUICKHEAL', 'RACE', 'RADHIKAJWE', 'RADIANTCMS', 'RADICO', 'RADIOCITY', 'RAILTEL', 'RAIN', 'RAINBOW', 'RAJESHEXPO', 'RAJMET', 'RAJRATAN', 'RAJRILTD', 'RAJSREESUG', 'RAJTV', 'RALLIS', 'RAMANEWS', 'RAMAPHO', 'RAMASTEEL', 'RAMCOCEM', 'RAMCOIND', 'RAMCOSYS', 'RAMKY', 'RAMRAT', 'RANASUG', 'RANEENGINE', 'RANEHOLDIN', 'RATEGAIN', 'RATNAMANI',
                             'RATNAVEER', 'RAYMOND', 'RBA', 'RBL', 'RBLBANK', 'RBZJEWEL', 'RCF', 'RCOM', 'RECLTD', 'REDINGTON', 'REDTAPE', 'REFEX', 'REGENCERAM', 'RELAXO', 'RELCHEMQ', 'RELIABLE', 'RELIANCE', 'RELIGARE', 'RELINFRA', 'RELTD', 'REMSONSIND', 'RENUKA', 'REPCOHOME', 'REPL', 'REPRO', 'RESPONIND', 'RETAIL', 'RGL', 'RHFL', 'RHIM', 'RHL', 'RICOAUTO', 'RIIL', 'RISHABH', 'RITCO', 'RITES', 'RKDL', 'RKEC', 'RKFORGE', 'RKSWAMY', 'RML', 'ROHLTD', 'ROLEXRINGS', 'ROLLT', 'ROLTA', 'ROML', 'ROSSARI', 'ROSSELLIND', 'ROTO', 'ROUTE', 'RPEL', 'RPGLIFE', 'RPOWER', 'RPPINFRA', 'RPPL', 'RPSGVENT', 'RPTECH', 'RRKABEL', 'RSSOFTWARE', 'RSWM', 'RSYSTEMS', 'RTNINDIA', 'RTNPOWER', 'RUBFILA', 'RUBYMILLS', 'RUCHINFRA', 'RUCHIRA', 'RUPA', 'RUSHIL', 'RUSTOMJEE', 'RVHL', 'RVNL', 'S&SPOWER', 'SABEVENTS', 'SABTNL', 'SADBHAV', 'SADBHIN', 'SADHNANIQ', 'SAFARI', 'SAGARDEEP', 'SAGCEM', 'SAH', 'SAHYADRI', 'SAIL', 'SAKAR', 'SAKHTISUG', 'SAKSOFT', 'SAKUMA', 'SALASAR', 'SALONA', 'SALSTEEL', 'SALZERELEC', 'SAMBHAAV', 'SAMHI', 'SAMMAANCAP', 'SAMPANN', 'SANCO', 'SANDESH', 'SANDHAR', 'SANDUMA', 'SANGAMIND', 'SANGHIIND', 'SANGHVIMOV', 'SANGINITA', 'SANOFI', 'SANSERA', 'SANSTAR', 'SANWARIA', 'SAPPHIRE', 'SARDAEN', 'SAREGAMA', 'SARLAPOLY', 'SARVESHWAR', 'SASKEN', 'SASTASUNDR', 'SATIA', 'SATIN', 'SATINDLTD', 'SAURASHCEM', 'SBC', 'SBCL', 'SBFC', 'SBGLP', 'SBICARD', 'SBILIFE', 'SBIN', 'SCHAEFFLER', 'SCHAND', 'SCHNEIDER', 'SCI', 'SCILAL', 'SCPL', 'SDBL', 'SEAMECLTD', 'SECMARK', 'SECURCRED', 'SECURKLOUD', 'SEJALLTD', 'SELAN', 'SELMC', 'SEMAC', 'SENCO', 'SEPC', 'SEQUENT', 'SERVOTECH', 'SESHAPAPER', 'SETCO', 'SETUINFRA', 'SFL', 'SGIL', 'SGL', 'SHAH', 'SHAHALLOYS', 'SHAILY', 'SHAKTIPUMP', 'SHALBY', 'SHALPAINTS', 'SHANKARA', 'SHANTI', 'SHANTIGEAR', 'SHARDACROP', 'SHARDAMOTR', 'SHAREINDIA', 'SHEKHAWATI', 'SHEMAROO', 'SHILPAMED', 'SHIVALIK', 'SHIVAMAUTO', 'SHIVAMILLS', 'SHIVATEX', 'SHK', 'SHOPERSTOP', 'SHRADHA', 'SHREDIGCEM', 'SHREECEM', 'SHREEPUSHK', 'SHREERAMA', 'SHRENIK', 'SHREYANIND', 'SHREYAS', 'SHRIPISTON', 'SHRIRAMFIN', 'SHRIRAMPPS', 'SHYAMCENT', 'SHYAMMETL', 'SHYAMTEL', 'SIEMENS', 'SIGACHI', 'SIGIND', 'SIGMA', 'SIGNATURE', 'SIGNPOST', 'SIKKO', 'SIL', 'SILGO', 'SILINV', 'SILLYMONKS', 'SILVERTUC', 'SIMBHALS', 'SIMPLEXINF', 'SINCLAIR', 'SINDHUTRAD', 'SINTERCOM', 'SIRCA', 'SIS', 'SITINET', 'SIYSIL', 'SJS', 'SJVN', 'SKFINDIA', 'SKIPPER', 'SKMEGGPROD', 'SKYGOLD', 'SMARTLINK', 'SMCGLOBAL', 'SMLISUZU', 'SMLT', 'SMSLIFE', 'SMSPHARMA', 'SNOWMAN', 'SOBHA', 'SOFTTECH', 'SOLARA', 'SOLARINDS', 'SOMANYCERA', 'SOMATEX', 'SOMICONVEY', 'SONACOMS', 'SONAMLTD', 'SONATSOFTW', 'SOTL', 'SOUTHBANK', 'SOUTHWEST', 'SPAL', 'SPANDANA', 'SPARC', 'SPCENET', 'SPECIALITY', 'SPENCERS', 'SPIC', 'SPLIL', 'SPLPETRO', 'SPMLINFRA', 'SPORTKING', 'SREEL', 'SRF', 'SRGHFL', 'SRHHYPOLTD', 'SRM', 'SRPL', 'SSDL', 'SSWL', 'STANLEY', 'STAR', 'STARCEMENT', 'STARHEALTH', 'STARPAPER', 'STARTECK', 'STCINDIA', 'STEELCAS', 'STEELCITY', 'STEELXIND', 'STEL', 'STERTOOLS', 'STLTECH', 'STOVEKRAFT', 'STYLAMIND', 'STYRENIX', 'SUBEXLTD', 'SUBROS', 'SUDARSCHEM', 'SUKHJITS', 'SULA', 'SUMEETINDS', 'SUMICHEM', 'SUMIT', 'SUMMITSEC', 'SUNCLAY', 'SUNDARAM', 'SUNDARMFIN', 'SUNDARMHLD', 'SUNDRMBRAK', 'SUNDRMFAST', 'SUNFLAG', 'SUNPHARMA', 'SUNTECK', 'SUNTV', 'SUPERHOUSE', 'SUPERSPIN', 'SUPRAJIT', 'SUPREMEENG', 'SUPREMEIND', 'SUPREMEINF', 'SUPRIYA', 'SURAJEST', 'SURANASOL', 'SURANAT&P', 'SURYALAXMI', 'SURYAROSNI', 'SURYODAY', 'SUTLEJTEX', 'SUULD', 'SUVEN', 'SUVENPHAR', 'SUVIDHAA', 'SUYOG', 'SUZLON', 'SVLL', 'SVPGLOB', 'SWANENERGY', 'SWARAJENG', 'SWELECTES', 'SWSOLAR', 'SYMPHONY', 'SYNCOMF', 'SYNGENE', 'SYRMA', 'TAINWALCHM', 'TAJGVK', 'TAKE', 'TALBROAUTO', 'TANLA', 'TARACHAND', 'TARAPUR', 'TARC', 'TARMAT', 'TARSONS', 'TASTYBITE', 'TATACHEM', 'TATACOMM', 'TATACONSUM', 'TATAELXSI', 'TATAINVEST', 'TATAMOTORS', 'TATAMTRDVR', 'TATAPOWER', 'TATASTEEL', 'TATATECH', 'TATVA', 'TBOTEK', 'TBZ', 'TCI', 'TCIEXP', 'TCIFINANCE', 'TCLCONS', 'TCNSBRANDS', 'TCPLPACK', 'TCS', 'TDPOWERSYS', 'TEAMLEASE', 'TECHIN', 'TECHM', 'TECHNOE', 'TECILCHEM', 'TEGA', 'TEJASNET', 'TEMBO', 'TERASOFT', 'TEXINFRA', 'TEXMOPIPES', 'TEXRAIL', 'TFCILTD', 'TFL', 'TGBHOTELS', 'THANGAMAYL', 'THEINVEST', 'THEJO', 'THEMISMED', 'THERMAX', 'THOMASCOOK', 'THOMASCOTT', 'THYROCARE', 'TI', 'TIDEWATER', 'TIIL', 'TIINDIA', 'TIJARIA', 'TIL', 'TIMESGTY', 'TIMETECHNO', 'TIMKEN', 'TIPSFILMS', 'TIPSINDLTD', 'TIRUMALCHM', 'TIRUPATIFL', 'TITAGARH', 'TITAN', 'TMB', 'TNPETRO', 'TNPL', 'TNTELE', 'TOKYOPLAST', 'TORNTPHARM', 'TORNTPOWER', 'TOTAL', 'TOUCHWOOD', 'TPHQ', 'TPLPLASTEH', 'TRACXN', 'TREEHOUSE', 'TREJHARA', 'TREL', 'TRENT', 'TRF', 'TRIDENT', 'TRIGYN', 'TRIL', 'TRITURBINE', 'TRIVENI', 'TRU', 'TTKHLTCARE', 'TTKPRESTIG', 'TTL', 'TTML', 'TV18BRDCST', 'TVSELECT', 'TVSHLTD', 'TVSMOTOR', 'TVSSCS', 'TVSSRICHAK', 'TVTODAY', 'TVVISION', 'UBL', 'UCAL', 'UCOBANK', 'UDAICEMENT', 'UDS', 'UFLEX', 'UFO', 'UGARSUGAR', 'UGROCAP', 'UJJIVANSFB', 'ULTRACEMCO', 'UMAEXPORTS', 'UMANGDAIRY', 'UMESLTD', 'UNICHEMLAB', 'UNIDT', 'UNIECOM', 'UNIENTER', 'UNIINFO', 'UNIONBANK', 'UNIPARTS', 'UNITDSPR', 'UNITECH', 'UNITEDPOLY', 'UNITEDTEA', 'UNIVASTU', 'UNIVCABLES', 'UNIVPHOTO', 'UNOMINDA', 'UPL', 'URAVI', 'URJA', 'USHAMART', 'USK', 'UTIAMC', 'UTKARSHBNK', 'UTTAMSUGAR', 'V2RETAIL', 'VADILALIND', 'VAIBHAVGBL', 'VAISHALI', 'VAKRANGEE', 'VALIANTLAB', 'VALIANTORG', 'VARDHACRLC', 'VARDMNPOLY', 'VARROC', 'VASCONEQ', 'VASWANI', 'VBL', 'VEDL', 'VENKEYS', 'VENUSPIPES', 'VENUSREM', 'VERANDA', 'VERTOZ', 'VESUVIUS', 'VETO', 'VGUARD', 'VHL', 'VHLTD', 'VIDHIING', 'VIJAYA', 'VIJIFIN', 'VIKASECO', 'VIKASLIFE', 'VIMTALABS', 'VINATIORGA', 'VINDHYATEL', 'VINEETLAB', 'VINNY', 'VINYLINDIA', 'VIPCLOTHNG', 'VIPIND', 'VIPULLTD', 'VIRINCHI', 'VISAKAIND', 'VISHNU', 'VISHWARAJ', 'VIVIDHA', 'VLEGOV', 'VLSFINANCE', 'VMART', 'VOLTAMP', 'VOLTAS', 'VPRPL', 'VRAJ', 'VRLLOG', 'VSSL', 'VSTIND', 'VSTL', 'VSTTILLERS', 'VTL', 'WABAG', 'WALCHANNAG', 'WANBURY', 'WEALTH', 'WEBELSOLAR', 'WEIZMANIND', 'WEL', 'WELCORP', 'WELENT', 'WELINV', 'WELSPUNLIV', 'WENDT', 'WESTLIFE', 'WEWIN', 'WHEELS', 'WHIRLPOOL', 'WILLAMAGOR', 'WINDLAS', 'WINDMACHIN', 'WINSOME', 'WIPL', 'WIPRO', 'WOCKPHARMA', 'WONDERLA', 'WORTH', 'WSI', 'WSTCSTPAPR', 'XCHANGING', 'XELPMOC', 'XPROINDIA', 'YAARI', 'YASHO', 'YATHARTH', 'YATRA', 'YESBANK', 'YUKEN', 'ZAGGLE', 'ZEEL', 'ZEELEARN', 'ZEEMEDIA', 'ZENITHEXPO', 'ZENITHSTL', 'ZENSARTECH', 'ZENTEC', 'ZFCVINDIA', 'ZIMLAB', 'ZODIAC', 'ZODIACLOTH', 'ZOMATO', 'ZOTA', 'ZUARI', 'ZUARIIND', 'ZYDUSLIFE', 'ZYDUSWELL']

    data_list = []
    for ticker in tickers:
        if not ticker.endswith('.NS'):
            ticker += '.NS'

        try:
            stock_data = yf.Ticker(ticker)
            stock_quote = stock_data.history(period="1d").tail(1)
            price = round(stock_quote['Close'].values[0], 2) if not stock_quote.empty else None
            close = round(stock_quote['Close'].values[0], 2) if not stock_quote.empty else None
            name = stock_data.info.get('longName', 'N/A')
            
            percentage_change = round(((price - close) / close) * 100, 2) if close else 0

            data_list.append({
                'symbol': ticker,
                'name': name,
                'price': price,
                'close': close,
                'percentage_change': percentage_change
            })
        except Exception as e:
            print(f"Error fetching data for {ticker}: {e}")

    sorted_data = sorted(data_list, key=lambda x: x['percentage_change'] or float('-inf'), reverse=True)
    top_gainers = sorted_data[:5]
    top_losers = sorted_data[-5:]

    return render(request, 'dashboard.html', {'top_gainers': top_gainers, 'top_losers': top_losers})

def api_update_gainers_losers(request):
    tickers = ['INFY', 'HDFCBANK', 'RELIANCE', 'SBILIFE', 'DMART']
    data_list = []
    for ticker in tickers:
        if not ticker.endswith('.NS'):
            ticker += '.NS'

        try:
            stock_data = yf.Ticker(ticker)
            stock_quote = stock_data.history(period="1d").tail(1)
            stock_info_data = stock_data.info
            pe_ratio = round(stock_info_data.get('trailingPE', 0), 2) if stock_info_data.get('trailingPE') else 'N/A'
            price = round(stock_quote['Close'].values[0], 2) if not stock_quote.empty else None
            open_price = round(stock_quote['Open'].values[0], 2) if not stock_quote.empty else None
            change = round(price - open_price, 2) if open_price else None
            percentage_change = round(((price - open_price) / open_price) * 100, 2) if open_price else None
            dayChartImage = 'app/static/gainer.jpg' 
            data_list.append({'symbol': ticker, 'price': price, 'percentage_change': percentage_change, 'change': change, 'pe_ratio': pe_ratio, dayChartImage: '/static/gainer.jpg' })
        except Exception as e:
            print(f"Error fetching data for {ticker}: {e}")

    sorted_data = sorted(data_list, key=lambda x: x['percentage_change'] or float('-inf'), reverse=True)
    top_gainers = sorted_data[:5]
    top_losers = sorted_data[-5:]

    return JsonResponse({'top_gainers': top_gainers, 'top_losers': top_losers})

# def fetch_stock_data(tickers, period="1d", page=1, per_page=10, volume_threshold=1000000):
#     results = []
#     trending_stocks = []
#     total_stocks = len(tickers)
#     start_index = (page - 1) * per_page
#     end_index = start_index + per_page
#     tickers_to_fetch = tickers[start_index:end_index]

#     for ticker in tickers_to_fetch:
#         if not ticker.endswith('.NS'):
#             ticker += '.NS'

#         try:
#             stock_data = yf.Ticker(ticker)
#             stock_quote = stock_data.history(period=period).tail(1)
#             stock_info_data = stock_data.info
            
#             stock_info = {
#                 'ticker': ticker,
#                 'name': stock_info_data.get('longName', 'N/A'),
#                 'price': round(stock_quote['Close'].values[0], 2) if not stock_quote.empty else None,
#                 'change': round(stock_info_data.get('regularMarketChangePercent', 0), 2),
#                 'open': round(stock_quote['Open'].values[0], 2) if not stock_quote.empty else None,
#                 'high': round(stock_quote['High'].values[0], 2) if not stock_quote.empty else None,
#                 'low': round(stock_quote['Low'].values[0], 2) if not stock_quote.empty else None,
#                 'volume': int(stock_quote['Volume'].values[0]) if not stock_quote.empty else None,
#                 'avg_volume': stock_info_data.get('averageVolume', 'N/A'),
#                 'market_cap': stock_info_data.get('marketCap', 'N/A'),
#                 'pe_ratio': round(stock_info_data.get('trailingPE', 'N/A'), 2),
#                 'high_52wk': round(stock_info_data.get('fiftyTwoWeekHigh', 'N/A'), 2),
#                 'low_52wk': round(stock_info_data.get('fiftyTwoWeekLow', 'N/A'), 2),
#                 'sector': stock_info_data.get('sector', 'N/A')
#             }

#             if stock_info['volume'] and stock_info['volume'] > volume_threshold:
#                 trending_stocks.append(stock_info)

#             results.append(stock_info)
#         except Exception as e:
#             results.append({'error': f"Failed to fetch data for {ticker}: {e}"})

#     return {
#         'stocks': results,
#         'trending_stocks': trending_stocks,
#         'total': total_stocks,
#         'current_page': page,
#         'per_page': per_page,
#         'total_pages': (total_stocks + per_page - 1) // per_page
#     }

def fetch_stock_data(tickers, period="1d", page=1, per_page=10, volume_threshold=1000000):
    results = []
    trending_stocks = []
    total_stocks = len(tickers)
    start_index = (page - 1) * per_page
    end_index = start_index + per_page
    tickers_to_fetch = tickers[start_index:end_index]

    for ticker in tickers_to_fetch:
        if not ticker.endswith('.NS'):
            ticker += '.NS'

        try:
            stock_data = yf.Ticker(ticker)
            stock_quote = stock_data.history(period=period).tail(1)  # Fetch the latest data
            stock_info_data = stock_data.info

            if not stock_quote.empty:
                # Extract key data points
                close_price = stock_quote['Close'].values[0]
                open_price = stock_quote['Open'].values[0]
                change_percent = round(((close_price - open_price) / open_price) * 100, 2) if open_price else None
                volume = stock_quote['Volume'].values[0]
                high = stock_quote['High'].values[0]
                low = stock_quote['Low'].values[0]
            else:
                close_price = open_price = change_percent = volume = high = low = None

            # Build stock info dictionary
            stock_info = {
                'ticker': ticker,
                'name': stock_info_data.get('longName', 'N/A'),
                'price': round(close_price, 2) if close_price else None,
                'change': change_percent,
                'open_price': round(open_price, 2) if open_price else None,
                'high': round(high, 2) if high else None,
                'volume': round(int(stock_quote['Volume'].values[0]) / 100000, 2) if not stock_quote.empty else None,  # Convert to lakhs
                # 'volume': round(volume / 100000, 2) if volume else None,  # Convert volume to lakhs
                'avg_volume': round(stock_info_data.get('averageVolume', 0) / 100000, 2) if stock_info_data.get('averageVolume') else 'N/A',  # Avg Volume in Lakhs
                'market_cap': round(stock_info_data.get('marketCap', 0) / 10000000, 2) if stock_info_data.get('marketCap') else 'N/A',  # Convert to crores
                'pe_ratio': round(stock_info_data.get('trailingPE', 0), 2) if stock_info_data.get('trailingPE') else 'N/A',
                'high_52wk': round(stock_info_data.get('fiftyTwoWeekHigh', 0), 2) if stock_info_data.get('fiftyTwoWeekHigh') else 'N/A',
                'low_52wk': round(stock_info_data.get('fiftyTwoWeekLow', 0), 2) if stock_info_data.get('fiftyTwoWeekLow') else 'N/A',
                'sector': stock_info_data.get('sector', 'N/A')
            }

            # Add to trending stocks if volume exceeds threshold
            if volume and volume > volume_threshold:
                trending_stocks.append(stock_info)

            results.append(stock_info)
        except Exception as e:
            results.append({'error': f"Failed to fetch data for {ticker}: {e}"})

    return {
        'stocks': results,
        'trending_stocks': trending_stocks,
        'total': total_stocks,
        'current_page': page,
        'per_page': per_page,
        'total_pages': (total_stocks + per_page - 1) // per_page
    }


# Default list of tickers
TICKERS = ['20MICRONS', '21STCENMGM', '360ONE', '3IINFOLTD', '3MINDIA', '3PLAND', '5PAISA', '63MOONS', 'A2ZINFRA', 'AAATECH', 'AADHARHFC', 
               'AAKASH', 'AAREYDRUGS', 'AARON', 'AARTECH', 'AARTIDRUGS', 'AARTIIND', 'AARTIPHARM', 'AARTISURF', 'AARVEEDEN', 'AARVI', 'AAVAS', 
               'ABAN', 'ABB', 'ABBOTINDIA', 'ABCAPITAL', 'ABDL', 'ABFRL', 'ABMINTLLTD', 'ABSLAMC', 'ACC', 'ACCELYA', 'ACCURACY', 'ACE', 'ACEINTEG',
                 'ACI', 'ACL', 'ACLGATI', 'ADANIENSOL', 'ADANIENT', 'ADANIGREEN', 'ADANIPORTS', 'ADANIPOWER', 'ADFFOODS', 'ADL', 'ADORWELD', 
                 'ADROITINFO', 'ADSL', 'ADVANIHOTR', 'ADVENZYMES', 'AEGISLOG', 'AEROFLEX', 'AETHER', 'AFFLE', 'AFIL', 'AGARIND', 'AGI', 'AGIIL', 
                 'AGRITECH', 'AGROPHOS', 'AGSTRA', 'AHL', 'AHLADA', 'AHLEAST', 'AHLUCONT', 'AIAENG', 'AIIL', 'AIRAN', 'AIROLAM', 'AJANTPHARM', 
                 'AJMERA', 'AJOONI', 'AKASH', 'AKG', 'AKI', 'AKSHAR', 'AKSHARCHEM', 'AKSHOPTFBR', 'AKUMS', 'AKZOINDIA', 'ALANKIT', 'ALBERTDAVD', 
                 'ALEMBICLTD', 'ALICON', 'ALKALI', 'ALKEM', 'ALKYLAMINE', 'ALLCARGO', 'ALLSEC', 'ALMONDZ', 'ALOKINDS', 'ALPA', 'ALPHAGEO', 
                 'ALPSINDUS', 'AMBER', 'AMBICAAGAR', 'AMBIKCO', 'AMBUJACEM', 'AMDIND', 'AMIORG', 'AMJLAND', 'AMNPLST', 'AMRUTANJAN', 'ANANDRATHI',
                   'ANANTRAJ', 'ANDHRAPAP', 'ANDHRSUGAR', 'ANGELONE', 'ANIKINDS', 'ANMOL', 'ANSALAPI', 'ANTGRAPHIC', 'ANUP', 'ANURAS', 'APARINDS', 
                   'APCL', 'APCOTEXIND', 'APEX', 'APLAPOLLO', 'APLLTD', 'APOLLO', 'APOLLOHOSP', 'APOLLOPIPE', 'APOLLOTYRE', 'APOLSINHOT',
                     'APTECHT', 'APTUS', 'ARCHIDPLY', 'ARCHIES', 'ARE&M', 'ARENTERP', 'ARIES', 'ARIHANTCAP', 'ARIHANTSUP', 'ARMANFIN', 
                     'AROGRANITE', 'ARROWGREEN', 'ARSHIYA', 'ARSSINFRA', 'ARTEMISMED', 'ARTNIRMAN', 'ARVEE', 'ARVIND', 'ARVINDFASN', 
                     'ARVSMART', 'ASAHIINDIA', 'ASAHISONG', 'ASAL', 'ASALCBR', 'ASHAPURMIN', 'ASHIANA', 'ASHIMASYN', 'ASHOKA', 'ASHOKAMET',
                       'ASHOKLEY', 'ASIANENE', 'ASIANHOTNR', 'ASIANPAINT', 'ASIANTILES', 'ASKAUTOLTD', 'ASMS', 'ASPINWALL', 'ASTEC', 'ASTERDM', 
                       'ASTRAL', 'ASTRAMICRO', 'ASTRAZEN', 'ASTRON', 'ATALREAL', 'ATAM', 'ATFL', 'ATGL', 'ATL', 'ATLANTAA', 'ATUL', 'ATULAUTO',
                         'AUBANK', 'AURIONPRO', 'AUROPHARMA', 'AURUM', 'AUSOMENT', 'AUTOAXLES', 'AUTOIND', 'AVADHSUGAR', 'AVALON', 'AVANTEL',
                           'AVANTIFEED', 'AVG', 'AVONMORE', 'AVROIND', 'AVTNPL', 'AWFIS', 'AWHCL', 'AWL', 'AXISBANK', 'AXISCADES', 'AXITA', 
                           'AYMSYNTEX', 'AZAD', 'BAFNAPH', 'BAGFILMS', 'BAIDFIN', 'BAJAJ-AUTO', 'BAJAJCON', 'BAJAJELEC', 'BAJAJFINSV', 
                           'BAJAJHCARE', 'BAJAJHIND', 'BAJAJHLDNG', 'BAJEL', 'BAJFINANCE', 'BALAJITELE', 'BALAMINES', 'BALAXI',
                             'BALKRISHNA', 'BALKRISIND', 'BALMLAWRIE', 'BALPHARMA', 'BALRAMCHIN', 'BALUFORGE', 'BANARBEADS', 
                             'BANARISUG', 'BANCOINDIA', 'BANDHANBNK', 'BANG', 'BANKA', 'BANKBARODA', 'BANKINDIA', 'BANSALWIRE', 
                             'BANSWRAS', 'BARBEQUE', 'BASF', 'BASML', 'BATAINDIA', 'BAYERCROP', 'BBL', 'BBOX', 'BBTC', 'BBTCL',
                               'BCLIND', 'BCONCEPTS', 'BDL', 'BEARDSELL', 'BECTORFOOD', 'BEDMUTHA', 'BEL', 'BEML', 'BEPL', 'BERGEPAINT',
                                 'BESTAGRO', 'BFINVEST', 'BFUTILITIE', 'BGRENERGY', 'BHAGCHEM', 'BHAGERIA', 'BHAGYANGR', 'BHANDARI',
                                   'BHARATFORG', 'BHARATGEAR', 'BHARATRAS', 'BHARATWIRE', 'BHARTIARTL', 'BHARTIHEXA', 'BHEL', 'BIGBLOC',
                                     'BIKAJI', 'BIL', 'BINANIIND', 'BIOCON', 'BIOFILCHEM', 'BIRLACABLE', 'BIRLACORPN', 'BIRLAMONEY',
                                       'BLAL', 'BLBLIMITED', 'BLISSGVS', 'BLKASHYAP', 'BLS', 'BLSE', 'BLUECHIP', 'BLUEDART', 'BLUEJET',
                                         'BLUESTARCO', 'BODALCHEM', 'BOMDYEING', 'BOROLTD', 'BORORENEW', 'BOROSCI', 'BOSCHLTD', 'BPCL',
                                           'BPL', 'BRIGADE', 'BRITANNIA', 'BRNL', 'BROOKS', 'BSE', 'BSHSL', 'BSL', 'BSOFT', 'BTML',
         'BURNPUR', 'BUTTERFLY', 'BVCL', 'BYKE', 'CALSOFT', 'CAMLINFINE', 'CAMPUS', 'CAMS', 'CANBK', 'CANFINHOME',
           'CANTABIL', 'CAPACITE', 'CAPITALSFB', 'CAPLIPOINT', 'CAPTRUST', 'CARBORUNIV', 'CAREERP', 'CARERATING', 
           'CARTRADE', 'CARYSIL', 'CASTROLIND', 'CCHHL', 'CCL', 'CDSL', 'CEATLTD', 'CEIGALL', 'CELEBRITY', 'CELLO', 
           'CENTENKA', 'CENTEXT', 'CENTRALBK', 'CENTRUM', 'CENTUM', 'CENTURYPLY', 'CENTURYTEX', 'CERA', 'CEREBRAINT',
             'CESC', 'CGCL', 'CGPOWER', 'CHALET', 'CHAMBLFERT', 'CHEMBOND', 'CHEMCON', 'CHEMFAB', 'CHEMPLASTS', 'CHENNPETRO',
               'CHEVIOT', 'CHOICEIN', 'CHOLAFIN', 'CHOLAHLDNG', 'CIEINDIA', 'CIGNITITEC', 'CINELINE', 'CINEVISTA', 'CIPLA', 
               'CLEAN', 'CLEDUCATE', 'CLSEL', 'CMSINFO', 'COALINDIA', 'COASTCORP', 'COCHINSHIP', 'COFFEEDAY', 'COFORGE',
                 'COLPAL', 'COMPUSOFT', 'COMSYN', 'CONCOR', 'CONCORDBIO', 'CONFIPET', 'CONSOFINVT', 'CONTROLPR', 'CORALFINAC',
                   'CORDSCABLE', 'COROMANDEL', 'COSMOFIRST', 'COUNCODOS', 'CRAFTSMAN', 'CREATIVE', 'CREATIVEYE', 'CREDITACC', 
                   'CREST', 'CRISIL', 'CROMPTON', 'CROWN', 'CSBBANK', 'CSLFINANCE', 'CTE', 'CUB', 'CUBEXTUB', 'CUMMINSIND',
                     'CUPID', 'CYBERMEDIA', 'CYBERTECH', 'CYIENT', 'CYIENTDLM', 'DABUR', 'DALBHARAT', 'DALMIASUG', 'DAMODARIND',
                       'DANGEE', 'DATAMATICS', 'DATAPATTNS', 'DAVANGERE', 'DBCORP', 'DBL', 'DBOL', 'DBREALTY', 'DBSTOCKBRO', 
                       'DCAL', 'DCBBANK', 'DCI', 'DCM', 'DCMFINSERV', 'DCMNVL', 'DCMSHRIRAM', 'DCMSRIND', 'DCW', 'DCXINDIA', 
                       'DECCANCE', 'DEEDEV', 'DEEPAKFERT', 'DEEPAKNTR', 'DEEPENR', 'DEEPINDS', 'DELHIVERY', 'DELPHIFX', 'DELTACORP',
                         'DELTAMAGNT', 'DEN', 'DENORA', 'DEVIT', 'DEVYANI', 'DGCONTENT', 'DHAMPURSUG', 'DHANBANK', 'DHANI',
                           'DHANUKA', 'DHARMAJ', 'DHRUV', 'DHUNINV', 'DIACABS', 'DIAMINESQ', 'DIAMONDYD', 'DICIND', 'DIGIDRIVE',
                             'DIGISPICE', 'DIGJAMLMTD', 'DIL', 'DISHTV', 'DIVGIITTS', 'DIVISLAB', 'DIXON', 'DJML', 'DLF',
                               'DLINKINDIA', 'DMART', 'DMCC', 'DNAMEDIA', 'DODLA', 'DOLATALGO', 'DOLLAR', 'DOLPHIN', 'DOMS',
                                 'DONEAR', 'DPABHUSHAN', 'DPSCLTD', 'DPWIRES', 'DRCSYSTEMS', 'DREAMFOLKS', 'DREDGECORP',
                                   'DRREDDY', 'DSSL', 'DTIL', 'DUCON', 'DVL', 'DWARKESH', 'DYCL', 'DYNAMATECH', 'DYNPRO',
                                     'E2E', 'EASEMYTRIP', 'ECLERX', 'EDELWEISS', 'EICHERMOT', 'EIDPARRY', 'EIFFL', 'EIHAHOTELS',
                                       'EIHOTEL', 'EIMCOELECO', 'EKC', 'ELDEHSG', 'ELECON', 'ELECTCAST', 'ELECTHERM', 'ELGIEQUIP',
                                         'ELGIRUBCO', 'ELIN', 'EMAMILTD', 'EMAMIPAP', 'EMAMIREAL', 'EMBDL', 'EMCURE', 'EMIL',
                                           'EMKAY', 'EMMBI', 'EMSLIMITED', 'EMUDHRA', 'ENDURANCE', 'ENERGYDEV', 'ENGINERSIN',
                                             'ENIL', 'ENTERO', 'EPACK', 'EPIGRAL', 'EPL', 'EQUIPPP', 'EQUITASBNK', 'ERIS', 'EROSMEDIA',
         'ESABINDIA', 'ESAFSFB', 'ESCORTS', 'ESSARSHPNG', 'ESSENTIA', 'ESTER', 'ETHOSLTD', 'EUROTEXIND', 'EVEREADY',
           'EVERESTIND', 'EXCEL', 'EXCELINDUS', 'EXICOM', 'EXIDEIND', 'EXPLEOSOL', 'EXXARO', 'FACT', 'FAIRCHEMOR', 'FAZE3Q',
             'FCL', 'FCSSOFT', 'FDC', 'FEDERALBNK', 'FEDFINA', 'FEL', 'FELDVR', 'FIBERWEB', 'FIEMIND', 'FILATEX', 'FILATFASH',
               'FINCABLES', 'FINEORG', 'FINOPB', 'FINPIPE', 'FIRSTCRY', 'FIVESTAR', 'FLAIR', 'FLEXITUFF', 'FLFL', 'FLUOROCHEM',
                 'FMGOETZE', 'FMNL', 'FOCUS', 'FOODSIN', 'FORCEMOT', 'FORTIS', 'FOSECOIND', 'FSL', 'FUSION', 'GABRIEL', 'GAEL',
                   'GAIL', 'GALAXYSURF', 'GALLANTT', 'GANDHAR', 'GANDHITUBE', 'GANECOS', 'GANESHBE', 'GANESHHOUC', 'GANGAFORGE',
                     'GANGESSECU', 'GARFIBRES', 'GATECH', 'GATECHDVR', 'GATEWAY', 'GEECEE', 'GEEKAYWIRE', 'GENCON', 'GENESYS',
                       'GENSOL', 'GENUSPAPER', 'GENUSPOWER', 'GEOJITFSL', 'GEPIL', 'GESHIP', 'GET&D', 'GFLLIMITED', 'GHCL',
                         'GHCLTEXTIL', 'GICHSGFIN', 'GICRE', 'GILLANDERS', 'GILLETTE', 'GINNIFILA', 'GIPCL', 'GKWLIMITED',
                           'GLAND', 'GLAXO', 'GLENMARK', 'GLFL', 'GLOBAL', 'GLOBALVECT', 'GLOBE', 'GLOBUSSPR', 'GLOSTERLTD',
                             'GLS', 'GMBREW', 'GMDCLTD', 'GMMPFAUDLR', 'GMRINFRA', 'GMRP&UI', 'GNA', 'GNFC', 'GOACARBON', 
                             'GOCLCORP', 'GOCOLORS', 'GODFRYPHLP', 'GODHA', 'GODIGIT', 'GODREJAGRO', 'GODREJCP', 'GODREJIND', 
                             'GODREJPROP', 'GOKEX', 'GOKUL', 'GOKULAGRO', 'GOLDENTOBC', 'GOLDIAM', 'GOLDTECH', 'GOODLUCK',
                               'GOPAL', 'GOYALALUM', 'GPIL', 'GPPL', 'GPTHEALTH', 'GPTINFRA', 'GRANULES', 'GRAPHITE', 'GRASIM', 
                               'GRAVITA', 'GREAVESCOT', 'GREENLAM', 'GREENPANEL', 'GREENPLY', 'GREENPOWER', 'GRINDWELL', 'GRINFRA',            
        'GRMOVER', 'GROBTEA', 'GRPLTD', 'GRSE', 'GRWRHITECH', 'GSFC', 'GSLSU', 'GSPL', 'GSS', 'GTECJAINX',
          'GTL', 'GTLINFRA', 'GTPL', 'GUFICBIO', 'GUJALKALI', 'GUJAPOLLO', 'GUJGASLTD', 'GUJRAFFIA', 
          'GULFOILLUB', 'GULFPETRO', 'GULPOLY', 'GVKPIL', 'GVPTECH', 'HAL', 'HAPPSTMNDS', 'HAPPYFORGE', 
          'HARDWYN', 'HARIOMPIPE', 'HARRMALAYA', 'HARSHA', 'HATHWAY', 'HATSUN', 'HAVELLS', 'HAVISHA',
            'HBLPOWER', 'HBSL', 'HCC', 'HCG', 'HCL-INSYS', 'HCLTECH', 'HDFCAMC', 'HDFCBANK', 'HDFCLIFE',
              'HDIL', 'HEADSUP', 'HECPROJECT', 'HEG', 'HEIDELBERG', 'HEMIPROP', 'HERANBA', 'HERCULES',
                'HERITGFOOD', 'HEROMOTOCO', 'HESTERBIO', 'HEUBACHIND', 'HEXATRADEX', 'HFCL', 'HGINFRA', 
                'HGS', 'HIKAL', 'HIL', 'HILTON', 'HIMATSEIDE', 'HINDALCO', 'HINDCOMPOS', 'HINDCON', 'HINDCOPPER',
                  'HINDMOTORS', 'HINDOILEXP', 'HINDPETRO', 'HINDUNILVR', 'HINDWAREAP', 'HINDZINC', 'HIRECT',
                    'HISARMETAL', 'HITECH', 'HITECHCORP', 'HITECHGEAR', 'HLEGLAS', 'HLVLTD', 'HMAAGRO', 'HMT',
                      'HMVL', 'HNDFDS', 'HOMEFIRST', 'HONASA', 'HONAUT', 'HONDAPOWER', 'HOVS', 'HPAL', 'HPIL',
                        'HPL', 'HSCL', 'HTMEDIA', 'HUBTOWN', 'HUDCO', 'HUHTAMAKI', 'HYBRIDFIN', 'ICDSLTD', 'ICEMAKE',
                          'ICICIBANK', 'ICICIGI', 'ICICIPRULI', 'ICIL', 'ICRA', 'IDBI', 'IDEA', 'IDEAFORGE', 'IDFC',
                            'IDFCFIRSTB', 'IEL', 'IEX', 'IFBAGRO', 'IFBIND', 'IFCI', 'IFGLEXPOR', 'IGARASHI', 'IGL',
                              'IGPL', 'IIFL', 'IIFLSEC', 'IITL', 'IKIO', 'IL&FSENGG', 'IL&FSTRANS', 'IMAGICAA', 'IMFA', 
                              'IMPAL', 'IMPEXFERRO', 'INCREDIBLE', 'INDBANK', 'INDGN', 'INDHOTEL', 'INDIACEM', 'INDIAGLYCO', 
                              'INDIAMART', 'INDIANB', 'INDIANCARD', 'INDIANHUME', 'INDIASHLTR', 'INDIGO', 'INDIGOPNTS', 'INDNIPPON',
     'INDOAMIN', 'INDOBORAX', 'INDOCO', 'INDORAMA', 'INDOSTAR', 'INDOTECH', 'INDOTHAI', 'INDOWIND', 'INDRAMEDCO', 'INDSWFTLAB',
       'INDSWFTLTD', 'INDTERRAIN', 'INDUSINDBK', 'INDUSTOWER', 'INFIBEAM', 'INFOBEAN', 'INFOMEDIA', 'INFY', 'INGERRAND',
         'INNOVACAP', 'INOXGREEN', 'INOXINDIA', 'INOXWIND', 'INSECTICID', 'INSPIRISYS', 'INTELLECT', 'INTENTECH', 'INTLCONV',
           'INVENTURE', 'IOB', 'IOC', 'IOLCP', 'IONEXCHANG', 'IPCALAB', 'IPL', 'IRB', 'IRCON', 'IRCTC', 'IREDA', 'IRFC', 'IRIS',
             'IRISDOREME', 'IRMENERGY', 'ISEC', 'ISFT', 'ISGEC', 'ITC', 'ITDC', 'ITDCEM', 'ITI', 'IVC', 'IVP', 'IWEL', 'IXIGO',
               'IZMO', 'J&KBANK', 'JAGRAN', 'JAGSNPHARM', 'JAIBALAJI', 'JAICORPLTD', 'JAIPURKURT', 'JAMNAAUTO', 'JASH',
                 'JAYAGROGN', 'JAYBARMARU', 'JAYNECOIND', 'JAYSREETEA', 'JBCHEPHARM', 'JBMA', 'JCHAC', 'JETAIRWAYS', 
                 'JETFREIGHT', 'JGCHEM', 'JHS', 'JINDALPHOT', 'JINDALPOLY', 'JINDALSAW', 'JINDALSTEL', 'JINDRILL', 
                 'JINDWORLD', 'JIOFIN', 'JISLDVREQS', 'JISLJALEQS', 'JITFINFRA', 'JKCEMENT', 'JKIL', 'JKLAKSHMI', 
                 'JKPAPER', 'JKTYRE', 'JLHL', 'JMA', 'JMFINANCIL', 'JNKINDIA', 'JOCIL', 'JPOLYINVST', 'JPPOWER', 
                 'JSFB', 'JSL', 'JSWENERGY', 'JSWHL', 'JSWINFRA', 'JSWSTEEL', 'JTEKTINDIA', 'JTLIND', 'JUBLFOOD',
                   'JUBLINDS', 'JUBLINGREA', 'JUBLPHARMA', 'JUNIPER', 'JUSTDIAL', 'JWL', 'JYOTHYLAB', 'JYOTICNC',
                     'JYOTISTRUC', 'KABRAEXTRU', 'KAJARIACER', 'KAKATCEM', 'KALAMANDIR', 'KALYANI', 'KALYANIFRG',
                       'KALYANKJIL', 'KAMATHOTEL', 'KAMDHENU', 'KAMOPAINTS', 'KANANIIND', 'KANORICHEM', 'KANPRPLA', 
                       'KANSAINER', 'KAPSTON', 'KARMAENG', 'KARURVYSYA', 'KAUSHALYA', 'KAVVERITEL', 'KAYA', 'KAYNES',
                         'KBCGLOBAL', 'KCP', 'KCPSUGIND', 'KDDL', 'KEC', 'KECL', 'KEEPLEARN', 'KEI', 'KELLTONTEC',
                           'KERNEX', 'KESORAMIND', 'KEYFINSERV', 'KFINTECH', 'KHADIM', 'KHAICHEM', 'KHAITANLTD', 'KHANDSE',
                             'KICL', 'KILITCH', 'KIMS', 'KINGFA', 'KIOCL', 'KIRIINDUS', 'KIRLOSBROS', 'KIRLOSENG', 'KIRLOSIND',
                               'KIRLPNU', 'KITEX', 'KKCL', 'KMSUGAR', 'KNRCON', 'KOHINOOR', 'KOKUYOCMLN', 'KOLTEPATIL', 'KOPRAN',
                                 'KOTAKBANK', 'KOTARISUG', 'KOTHARIPET', 'KOTHARIPRO', 'KPIGREEN', 'KPIL', 'KPITTECH', 'KPRMILL',
                                   'KRBL', 'KREBSBIO', 'KRIDHANINF', 'KRISHANA', 'KRITI', 'KRITIKA', 'KRITINUT', 'KRONOX', 'KRSNAA',
                                     'KRYSTAL', 'KSB', 'KSCL', 'KSHITIJPOL', 'KSL', 'KSOLVES', 'KTKBANK', 'KUANTUM', 'LAGNAM', 'LAL',
                                       'LALPATHLAB', 'LAMBODHARA', 'LANCORHOL', 'LANDMARK', 'LAOPALA', 'LASA', 'LATENTVIEW', 'LATTEYS',
                                         'LAURUSLABS', 'LAXMICOT', 'LAXMIMACH', 'LCCINFOTEC', 'LEMONTREE', 'LEXUS', 'LFIC', 'LGBBROSLTD',
                                           'LGHL', 'LIBAS', 'LIBERTSHOE', 'LICHSGFIN', 'LICI', 'LIKHITHA', 'LINC', 'LINCOLN', 'LINDEINDIA',
                                             'LLOYDSENGG', 'LLOYDSME', 'LODHA', 'LOKESHMACH', 'LORDSCHLO', 'LOTUSEYE', 'LOVABLE', 'LOYALTEX',
                                               'LPDC', 'LT', 'LTF', 'LTFOODS', 'LTIM', 'LTTS', 'LUMAXIND', 'LUMAXTECH', 'LUPIN', 'LUXIND', 'LXCHEM',
                                                 'LYKALABS', 'LYPSAGEMS', 'M&M', 'M&MFIN', 'MAANALU', 'MACPOWER', 'MADHAV', 'MADHUCON', 'MADRASFERT',
                                                 'MAGADSUGAR', 'MAGNUM', 'MAHABANK', 'MAHAPEXLTD', 'MAHASTEEL', 'MAHEPC', 'MAHESHWARI', 'MAHLIFE', 'MAHLOG', 'MAHSCOOTER', 'MAHSEAMLES', 'MAITHANALL', 'MALLCOM', 'MALUPAPER', 'MANAKALUCO', 'MANAKCOAT', 'MANAKSIA', 'MANAKSTEEL', 'MANALIPETC', 'MANAPPURAM', 'MANCREDIT', 'MANGALAM', 'MANGCHEFER', 'MANGLMCEM', 'MANINDS', 'MANINFRA', 'MANKIND', 'MANOMAY', 'MANORAMA', 'MANORG', 'MANUGRAPH', 'MANYAVAR', 'MAPMYINDIA', 'MARALOVER', 'MARATHON', 'MARICO', 'MARINE', 'MARKSANS', 'MARSHALL', 'MARUTI', 'MASFIN', 'MASKINVEST', 'MASTEK', 'MATRIMONY', 'MAWANASUG', 'MAXESTATES', 'MAXHEALTH', 'MAXIND', 'MAYURUNIQ', 'MAZDA', 'MAZDOCK', 'MBAPL', 'MBECL', 'MBLINFRA', 'MCL', 'MCLEODRUSS', 'MCX', 'MEDANTA', 'MEDIASSIST', 'MEDICAMEQ', 'MEDICO', 'MEDPLUS', 'MEGASOFT', 'MEGASTAR', 'MENONBE', 'METROBRAND', 'METROPOLIS', 'MFSL', 'MGEL', 'MGL', 'MHLXMIRU', 'MHRIL', 'MICEL', 'MIDHANI', 'MINDACORP', 'MINDTECK', 'MIRCELECTR', 'MIRZAINT', 'MITCON', 'MITTAL', 'MKPL', 'MMFL', 'MMP', 'MMTC', 'MODIRUBBER', 'MODISONLTD', 'MODTHREAD', 'MOHITIND', 'MOIL', 'MOKSH', 'MOL', 'MOLDTECH', 'MOLDTKPAC', 'MONARCH', 'MONTECARLO', 'MORARJEE', 'MOREPENLAB', 'MOTHERSON', 'MOTILALOFS', 'MOTISONS', 'MOTOGENFIN', 'MPHASIS', 'MPSLTD', 'MRF', 'MRO-TEK', 'MRPL', 'MSPL', 'MSTCLTD', 'MSUMI', 'MTARTECH', 'MTEDUCARE', 'MTNL', 'MUFIN', 'MUFTI', 'MUKANDLTD', 'MUKKA', 'MUKTAARTS', 'MUNJALAU', 'MUNJALSHOW', 'MURUDCERA', 'MUTHOOTCAP', 'MUTHOOTFIN', 'MUTHOOTMF', 'MVGJL', 'NACLIND', 'NAGAFERT', 'NAGREEKCAP', 'NAGREEKEXP', 'NAHARCAP', 'NAHARINDUS', 'NAHARPOLY', 'NAHARSPING', 'NAM-INDIA', 'NARMADA', 'NATCOPHARM', 'NATHBIOGEN', 'NATIONALUM', 'NAUKRI', 'NAVA', 'NAVINFLUOR', 'NAVKARCORP', 'NAVNETEDUL', 'NAZARA', 'NBCC', 'NBIFIN', 'NCC', 'NCLIND', 'NDGL', 'NDL', 'NDLVENTURE', 'NDRAUTO', 'NDTV', 'NECCLTD', 'NECLIFE', 'NELCAST', 'NELCO', 'NEOGEN', 'NESCO', 'NESTLEIND', 'NETWEB', 'NETWORK18', 'NEULANDLAB', 'NEWGEN', 'NEXTMEDIA', 'NFL', 'NGIL', 'NGLFINE', 'NH', 'NHPC', 'NIACL', 'NIBL', 'NIITLTD', 'NIITMTS', 'NILAINFRA', 'NILASPACES', 'NILKAMAL', 'NINSYS', 'NIPPOBATRY', 'NIRAJ', 'NIRAJISPAT', 'NITCO', 'NITINSPIN', 'NITIRAJ', 'NKIND', 'NLCINDIA', 'NMDC', 'NOCIL', 'NOIDATOLL', 'NORBTEAEXP', 'NOVAAGRI', 'NRAIL', 'NRBBEARING', 'NRL', 'NSIL', 'NSLNISP', 'NTPC', 'NUCLEUS', 'NURECA', 'NUVAMA', 'NUVOCO', 'NYKAA', 'OAL', 'OBCL', 'OBEROIRLTY', 'OCCL', 'OFSS', 'OIL', 'OILCOUNTUB', 'OLAELEC', 'OLECTRA', 'OMAXAUTO', 'OMAXE', 'OMINFRAL', 'ONELIFECAP', 'ONEPOINT', 'ONGC', 'ONMOBILE', 'ONWARDTEC', 'OPTIEMUS', 'ORBTEXP', 'ORCHPHARMA', 'ORICONENT', 'ORIENTALTL', 'ORIENTBELL', 'ORIENTCEM', 'ORIENTCER', 'ORIENTELEC', 'ORIENTHOT', 'ORIENTLTD', 'ORIENTPPR', 'ORISSAMINE', 'ORTEL', 'ORTINLAB', 'OSIAHYPER', 'OSWALAGRO', 'OSWALGREEN', 'OSWALSEEDS', 'PAGEIND', 'PAISALO', 'PAKKA', 'PALASHSECU', 'PALREDTEC', 'PANACEABIO', 'PANACHE', 'PANAMAPET', 'PANSARI', 'PAR', 'PARACABLES', 'PARADEEP', 'PARAGMILK', 'PARAS', 'PARASPETRO', 'PARKHOTELS', 'PARSVNATH', 'PASUPTAC', 'PATANJALI', 'PATELENG', 'PATINTLOG', 'PAVNAIND', 'PAYTM', 'PCBL', 'PCJEWELLER', 'PDMJEPAPER', 'PDSL', 'PEARLPOLY', 'PEL', 'PENIND', 'PENINLAND', 'PERSISTENT', 'PETRONET', 'PFC', 'PFIZER', 'PFOCUS', 'PFS', 'PGEL', 'PGHH', 'PGHL', 'PGIL', 'PHOENIXLTD', 'PIDILITIND', 'PIGL', 'PIIND', 'PILANIINVS', 'PILITA', 'PIONEEREMB', 'PITTIENG', 'PIXTRANS', 'PKTEA', 'PLASTIBLEN', 'PLATIND', 'PLAZACABLE', 'PNB', 'PNBGILTS', 'PNBHOUSING', 'PNC', 'PNCINFRA', 'POCL', 'PODDARHOUS', 'PODDARMENT', 'POKARNA', 'POLICYBZR', 'POLYCAB', 'POLYMED', 'POLYPLEX', 'PONNIERODE', 'POONAWALLA', 'POWERGRID', 'POWERINDIA', 'POWERMECH', 'PPAP', 'PPL', 'PPLPHARMA', 'PRAENG', 'PRAJIND', 'PRAKASH', 'PRAKASHSTL', 'PRAXIS', 'PRECAM', 'PRECOT', 'PRECWIRE', 'PREMEXPLN', 'PREMIERPOL', 'PRESTIGE', 'PRICOLLTD', 'PRIMESECU', 'PRINCEPIPE', 'PRITI', 'PRITIKAUTO', 'PRIVISCL', 'PROZONER', 'PRSMJOHNSN', 'PRUDENT', 'PRUDMOULI', 'PSB', 'PSPPROJECT', 'PTC', 'PTCIL', 'PTL', 'PUNJABCHEM', 'PURVA', 'PVP', 'PVRINOX', 'PVSL', 'PYRAMID', 'QUESS', 'QUICKHEAL', 'RACE', 'RADHIKAJWE', 'RADIANTCMS', 'RADICO', 'RADIOCITY', 'RAILTEL', 'RAIN', 'RAINBOW', 'RAJESHEXPO', 'RAJMET', 'RAJRATAN', 'RAJRILTD', 'RAJSREESUG', 'RAJTV', 'RALLIS', 'RAMANEWS', 'RAMAPHO', 'RAMASTEEL', 'RAMCOCEM', 'RAMCOIND', 'RAMCOSYS', 'RAMKY', 'RAMRAT', 'RANASUG', 'RANEENGINE', 'RANEHOLDIN', 'RATEGAIN', 'RATNAMANI',
                             'RATNAVEER', 'RAYMOND', 'RBA', 'RBL', 'RBLBANK', 'RBZJEWEL', 'RCF', 'RCOM', 'RECLTD', 'REDINGTON', 'REDTAPE', 'REFEX', 'REGENCERAM', 'RELAXO', 'RELCHEMQ', 'RELIABLE', 'RELIANCE', 'RELIGARE', 'RELINFRA', 'RELTD', 'REMSONSIND', 'RENUKA', 'REPCOHOME', 'REPL', 'REPRO', 'RESPONIND', 'RETAIL', 'RGL', 'RHFL', 'RHIM', 'RHL', 'RICOAUTO', 'RIIL', 'RISHABH', 'RITCO', 'RITES', 'RKDL', 'RKEC', 'RKFORGE', 'RKSWAMY', 'RML', 'ROHLTD', 'ROLEXRINGS', 'ROLLT', 'ROLTA', 'ROML', 'ROSSARI', 'ROSSELLIND', 'ROTO', 'ROUTE', 'RPEL', 'RPGLIFE', 'RPOWER', 'RPPINFRA', 'RPPL', 'RPSGVENT', 'RPTECH', 'RRKABEL', 'RSSOFTWARE', 'RSWM', 'RSYSTEMS', 'RTNINDIA', 'RTNPOWER', 'RUBFILA', 'RUBYMILLS', 'RUCHINFRA', 'RUCHIRA', 'RUPA', 'RUSHIL', 'RUSTOMJEE', 'RVHL', 'RVNL', 'S&SPOWER', 'SABEVENTS', 'SABTNL', 'SADBHAV', 'SADBHIN', 'SADHNANIQ', 'SAFARI', 'SAGARDEEP', 'SAGCEM', 'SAH', 'SAHYADRI', 'SAIL', 'SAKAR', 'SAKHTISUG', 'SAKSOFT', 'SAKUMA', 'SALASAR', 'SALONA', 'SALSTEEL', 'SALZERELEC', 'SAMBHAAV', 'SAMHI', 'SAMMAANCAP', 'SAMPANN', 'SANCO', 'SANDESH', 'SANDHAR', 'SANDUMA', 'SANGAMIND', 'SANGHIIND', 'SANGHVIMOV', 'SANGINITA', 'SANOFI', 'SANSERA', 'SANSTAR', 'SANWARIA', 'SAPPHIRE', 'SARDAEN', 'SAREGAMA', 'SARLAPOLY', 'SARVESHWAR', 'SASKEN', 'SASTASUNDR', 'SATIA', 'SATIN', 'SATINDLTD', 'SAURASHCEM', 'SBC', 'SBCL', 'SBFC', 'SBGLP', 'SBICARD', 'SBILIFE', 'SBIN', 'SCHAEFFLER', 'SCHAND', 'SCHNEIDER', 'SCI', 'SCILAL', 'SCPL', 'SDBL', 'SEAMECLTD', 'SECMARK', 'SECURCRED', 'SECURKLOUD', 'SEJALLTD', 'SELAN', 'SELMC', 'SEMAC', 'SENCO', 'SEPC', 'SEQUENT', 'SERVOTECH', 'SESHAPAPER', 'SETCO', 'SETUINFRA', 'SFL', 'SGIL', 'SGL', 'SHAH', 'SHAHALLOYS', 'SHAILY', 'SHAKTIPUMP', 'SHALBY', 'SHALPAINTS', 'SHANKARA', 'SHANTI', 'SHANTIGEAR', 'SHARDACROP', 'SHARDAMOTR', 'SHAREINDIA', 'SHEKHAWATI', 'SHEMAROO', 'SHILPAMED', 'SHIVALIK', 'SHIVAMAUTO', 'SHIVAMILLS', 'SHIVATEX', 'SHK', 'SHOPERSTOP', 'SHRADHA', 'SHREDIGCEM', 'SHREECEM', 'SHREEPUSHK', 'SHREERAMA', 'SHRENIK', 'SHREYANIND', 'SHREYAS', 'SHRIPISTON', 'SHRIRAMFIN', 'SHRIRAMPPS', 'SHYAMCENT', 'SHYAMMETL', 'SHYAMTEL', 'SIEMENS', 'SIGACHI', 'SIGIND', 'SIGMA', 'SIGNATURE', 'SIGNPOST', 'SIKKO', 'SIL', 'SILGO', 'SILINV', 'SILLYMONKS', 'SILVERTUC', 'SIMBHALS', 'SIMPLEXINF', 'SINCLAIR', 'SINDHUTRAD', 'SINTERCOM', 'SIRCA', 'SIS', 'SITINET', 'SIYSIL', 'SJS', 'SJVN', 'SKFINDIA', 'SKIPPER', 'SKMEGGPROD', 'SKYGOLD', 'SMARTLINK', 'SMCGLOBAL', 'SMLISUZU', 'SMLT', 'SMSLIFE', 'SMSPHARMA', 'SNOWMAN', 'SOBHA', 'SOFTTECH', 'SOLARA', 'SOLARINDS', 'SOMANYCERA', 'SOMATEX', 'SOMICONVEY', 'SONACOMS', 'SONAMLTD', 'SONATSOFTW', 'SOTL', 'SOUTHBANK', 'SOUTHWEST', 'SPAL', 'SPANDANA', 'SPARC', 'SPCENET', 'SPECIALITY', 'SPENCERS', 'SPIC', 'SPLIL', 'SPLPETRO', 'SPMLINFRA', 'SPORTKING', 'SREEL', 'SRF', 'SRGHFL', 'SRHHYPOLTD', 'SRM', 'SRPL', 'SSDL', 'SSWL', 'STANLEY', 'STAR', 'STARCEMENT', 'STARHEALTH', 'STARPAPER', 'STARTECK', 'STCINDIA', 'STEELCAS', 'STEELCITY', 'STEELXIND', 'STEL', 'STERTOOLS', 'STLTECH', 'STOVEKRAFT', 'STYLAMIND', 'STYRENIX', 'SUBEXLTD', 'SUBROS', 'SUDARSCHEM', 'SUKHJITS', 'SULA', 'SUMEETINDS', 'SUMICHEM', 'SUMIT', 'SUMMITSEC', 'SUNCLAY', 'SUNDARAM', 'SUNDARMFIN', 'SUNDARMHLD', 'SUNDRMBRAK', 'SUNDRMFAST', 'SUNFLAG', 'SUNPHARMA', 'SUNTECK', 'SUNTV', 'SUPERHOUSE', 'SUPERSPIN', 'SUPRAJIT', 'SUPREMEENG', 'SUPREMEIND', 'SUPREMEINF', 'SUPRIYA', 'SURAJEST', 'SURANASOL', 'SURANAT&P', 'SURYALAXMI', 'SURYAROSNI', 'SURYODAY', 'SUTLEJTEX', 'SUULD', 'SUVEN', 'SUVENPHAR', 'SUVIDHAA', 'SUYOG', 'SUZLON', 'SVLL', 'SVPGLOB', 'SWANENERGY', 'SWARAJENG', 'SWELECTES', 'SWSOLAR', 'SYMPHONY', 'SYNCOMF', 'SYNGENE', 'SYRMA', 'TAINWALCHM', 'TAJGVK', 'TAKE', 'TALBROAUTO', 'TANLA', 'TARACHAND', 'TARAPUR', 'TARC', 'TARMAT', 'TARSONS', 'TASTYBITE', 'TATACHEM', 'TATACOMM', 'TATACONSUM', 'TATAELXSI', 'TATAINVEST', 'TATAMOTORS', 'TATAMTRDVR', 'TATAPOWER', 'TATASTEEL', 'TATATECH', 'TATVA', 'TBOTEK', 'TBZ', 'TCI', 'TCIEXP', 'TCIFINANCE', 'TCLCONS', 'TCNSBRANDS', 'TCPLPACK', 'TCS', 'TDPOWERSYS', 'TEAMLEASE', 'TECHIN', 'TECHM', 'TECHNOE', 'TECILCHEM', 'TEGA', 'TEJASNET', 'TEMBO', 'TERASOFT', 'TEXINFRA', 'TEXMOPIPES', 'TEXRAIL', 'TFCILTD', 'TFL', 'TGBHOTELS', 'THANGAMAYL', 'THEINVEST', 'THEJO', 'THEMISMED', 'THERMAX', 'THOMASCOOK', 'THOMASCOTT', 'THYROCARE', 'TI', 'TIDEWATER', 'TIIL', 'TIINDIA', 'TIJARIA', 'TIL', 'TIMESGTY', 'TIMETECHNO', 'TIMKEN', 'TIPSFILMS', 'TIPSINDLTD', 'TIRUMALCHM', 'TIRUPATIFL', 'TITAGARH', 'TITAN', 'TMB', 'TNPETRO', 'TNPL', 'TNTELE', 'TOKYOPLAST', 'TORNTPHARM', 'TORNTPOWER', 'TOTAL', 'TOUCHWOOD', 'TPHQ', 'TPLPLASTEH', 'TRACXN', 'TREEHOUSE', 'TREJHARA', 'TREL', 'TRENT', 'TRF', 'TRIDENT', 'TRIGYN', 'TRIL', 'TRITURBINE', 'TRIVENI', 'TRU', 'TTKHLTCARE', 'TTKPRESTIG', 'TTL', 'TTML', 'TV18BRDCST', 'TVSELECT', 'TVSHLTD', 'TVSMOTOR', 'TVSSCS', 'TVSSRICHAK', 'TVTODAY', 'TVVISION', 'UBL', 'UCAL', 'UCOBANK', 'UDAICEMENT', 'UDS', 'UFLEX', 'UFO', 'UGARSUGAR', 'UGROCAP', 'UJJIVANSFB', 'ULTRACEMCO', 'UMAEXPORTS', 'UMANGDAIRY', 'UMESLTD', 'UNICHEMLAB', 'UNIDT', 'UNIECOM', 'UNIENTER', 'UNIINFO', 'UNIONBANK', 'UNIPARTS', 'UNITDSPR', 'UNITECH', 'UNITEDPOLY', 'UNITEDTEA', 'UNIVASTU', 'UNIVCABLES', 'UNIVPHOTO', 'UNOMINDA', 'UPL', 'URAVI', 'URJA', 'USHAMART', 'USK', 'UTIAMC', 'UTKARSHBNK', 'UTTAMSUGAR', 'V2RETAIL', 'VADILALIND', 'VAIBHAVGBL', 'VAISHALI', 'VAKRANGEE', 'VALIANTLAB', 'VALIANTORG', 'VARDHACRLC', 'VARDMNPOLY', 'VARROC', 'VASCONEQ', 'VASWANI', 'VBL', 'VEDL', 'VENKEYS', 'VENUSPIPES', 'VENUSREM', 'VERANDA', 'VERTOZ', 'VESUVIUS', 'VETO', 'VGUARD', 'VHL', 'VHLTD', 'VIDHIING', 'VIJAYA', 'VIJIFIN', 'VIKASECO', 'VIKASLIFE', 'VIMTALABS', 'VINATIORGA', 'VINDHYATEL', 'VINEETLAB', 'VINNY', 'VINYLINDIA', 'VIPCLOTHNG', 'VIPIND', 'VIPULLTD', 'VIRINCHI', 'VISAKAIND', 'VISHNU', 'VISHWARAJ', 'VIVIDHA', 'VLEGOV', 'VLSFINANCE', 'VMART', 'VOLTAMP', 'VOLTAS', 'VPRPL', 'VRAJ', 'VRLLOG', 'VSSL', 'VSTIND', 'VSTL', 'VSTTILLERS', 'VTL', 'WABAG', 'WALCHANNAG', 'WANBURY', 'WEALTH', 'WEBELSOLAR', 'WEIZMANIND', 'WEL', 'WELCORP', 'WELENT', 'WELINV', 'WELSPUNLIV', 'WENDT', 'WESTLIFE', 'WEWIN', 'WHEELS', 'WHIRLPOOL', 'WILLAMAGOR', 'WINDLAS', 'WINDMACHIN', 'WINSOME', 'WIPL', 'WIPRO', 'WOCKPHARMA', 'WONDERLA', 'WORTH', 'WSI', 'WSTCSTPAPR', 'XCHANGING', 'XELPMOC', 'XPROINDIA', 'YAARI', 'YASHO', 'YATHARTH', 'YATRA', 'YESBANK', 'YUKEN', 'ZAGGLE', 'ZEEL', 'ZEELEARN', 'ZEEMEDIA', 'ZENITHEXPO', 'ZENITHSTL', 'ZENSARTECH', 'ZENTEC', 'ZFCVINDIA', 'ZIMLAB', 'ZODIAC', 'ZODIACLOTH', 'ZOMATO', 'ZOTA', 'ZUARI', 'ZUARIIND', 'ZYDUSLIFE', 'ZYDUSWELL']


def stock_data_view(request):
    try:
        tickers = request.GET.getlist('tickers') or TICKERS
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 10))
        period = request.GET.get('period', '1d')
        volume_threshold = int(request.GET.get('volume_threshold', 1000000))

        stock_data = fetch_stock_data(tickers, period, page, per_page, volume_threshold)

        if not stock_data:
            return JsonResponse({'error': 'No stock data available'}, status=404)

        return JsonResponse(stock_data, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def generate_closing_price_graph(ticker):
    # Fetch historical data from Yahoo Finance
    stock = yf.Ticker(ticker)
    timeframe_df = stock.history(period="1y")  # Fetch 1-year historical data

    if timeframe_df.empty:
        return None

    timeframe_df.reset_index(inplace=True)
    timeframe_df['date'] = pd.to_datetime(timeframe_df['Date'])
    timeframe_df.set_index('date', inplace=True)

    fig = go.Figure()

    # Line Chart with area fill
    fig.add_trace(go.Scatter(
        x=timeframe_df.index,
        y=timeframe_df['Close'],
        mode='lines',
        name='Closing Price',
        line=dict(color='lightblue'),
        fill='tozeroy',
        fillcolor='rgba(173, 216, 230, 0.3)',
        showlegend=True
    ))

    # Candlestick Chart
    fig.add_trace(go.Candlestick(
        x=timeframe_df.index,
        open=timeframe_df['Open'],
        high=timeframe_df['High'],
        low=timeframe_df['Low'],
        close=timeframe_df['Close'],
        name='Candlestick',
        visible=False
    ))

    fig.update_layout(
        title={'text': f'{ticker} Closing Prices (1 Year)', 'x': 0.5, 'font': {'size': 16, 'color': 'white'}},
        xaxis_title='Date',
        yaxis_title='Closing Price',
        plot_bgcolor='black',
        paper_bgcolor='black',
        font=dict(color='white'),
        updatemenus=[{
            'buttons': [
                {'label': 'Line Chart', 'method': 'update', 'args': [{'visible': [True, False]}]},
                {'label': 'Candlestick Chart', 'method': 'update', 'args': [{'visible': [False, True]}]}
            ],
            'direction': 'down', 'x': 0.1, 'y': 1.15
        }]
    )

    return fig.to_html(full_html=False)

def stock_chart_view(request, ticker):
    """API Endpoint to return the stock chart HTML."""
    graph_html = generate_closing_price_graph(ticker)
    
    if graph_html:
        return JsonResponse({'chart_html': graph_html})
    return JsonResponse({'error': 'No data found'}, status=404)
