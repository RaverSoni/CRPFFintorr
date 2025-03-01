def generate_closing_price_graph(ticker):
    # Fetch historical stock data
    stock = yf.Ticker(ticker)
    timeframe_df = stock.history(period="1y")  # Fetch last 1 year of data

    if timeframe_df.empty:
        logger.error(f"No data found for {ticker}")
        return None

    # Process data
    timeframe_df.reset_index(inplace=True)
    timeframe_df['date'] = pd.to_datetime(timeframe_df['Date'])
    timeframe_df.set_index('date', inplace=True)

    fig = go.Figure()

    # Line Chart
    fig.add_trace(go.Scatter(
        x=timeframe_df.index.astype(str),  # Convert dates to string format
        y=timeframe_df['Close'].tolist(),  # Convert NumPy arrays to lists
        mode='lines',
        name='Closing Price',
        line=dict(color='lightblue'),
        fill='tozeroy',
        fillcolor='rgba(173, 216, 230, 0.3)',
        showlegend=True
    ))

    fig.update_layout(
        title=f'{ticker} Stock Chart',
        xaxis_title='Date',
        yaxis_title='Closing Price',
        plot_bgcolor='black',
        paper_bgcolor='black',
        font=dict(color='white'),
        height=400,
    )

    return fig.to_dict()  # Return as dictionary instead of HTML


def stock_chart_view(request, ticker):
    logger.info(f"Fetching chart for {ticker}...")

    fig_dict = generate_closing_price_graph(ticker)

    if fig_dict:
        logger.info(f"Chart generated for {ticker}")

        # Convert NumPy arrays to lists for JSON serialization
        json_compatible = json.loads(json.dumps(fig_dict, default=lambda x: x.tolist() if isinstance(x, np.ndarray) else x))

        return JsonResponse({"data": json_compatible['data'], "layout": json_compatible['layout']})  # Send valid JSON

    logger.error(f"Failed to generate chart for {ticker}")
    return JsonResponse({'error': 'No data found'}, status=404)




















































import yfinance as yf
import plotly.graph_objects as go
import pandas as pd
import json
import numpy as np
import logging
from django.http import JsonResponse

logger = logging.getLogger(__name__)

def generate_closing_price_graph(ticker):
    """
    Fetches stock data from Yahoo Finance and generates multiple stock charts
    for different timeframes ('1D', '1M', '6M', '1Y', '5Y').
    """
    stock = yf.Ticker(ticker)

    # Define timeframes
    timeframes = {
        "1D": stock.history(period="1d"),
        "1M": stock.history(period="1mo"),
        "6M": stock.history(period="6mo"),
        "1Y": stock.history(period="1y"),
        "5Y": stock.history(period="5y")
    }

    charts = {}

    for key, df in timeframes.items():
        if df.empty:
            logger.warning(f"No data found for {ticker} ({key} timeframe)")
            continue

        # Process Data
        df.reset_index(inplace=True)
        df['date'] = pd.to_datetime(df['Date'])
        df.set_index('date', inplace=True)

        fig = go.Figure()

        # **Main Line Chart (Default)**
        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=df['Close'].tolist(),
            mode='lines',
            name='Closing Price',
            line=dict(color='lightblue', width=2),
            fill='tozeroy',
            fillcolor='rgba(173, 216, 230, 0.3)',
            visible=True
        ))

        # **Candlestick Chart**
        fig.add_trace(go.Candlestick(
            x=df.index.astype(str),
            open=df['Open'].tolist(),
            high=df['High'].tolist(),
            low=df['Low'].tolist(),
            close=df['Close'].tolist(),
            name='Candlestick',
            visible=False
        ))

        # **Bar Chart**
        fig.add_trace(go.Bar(
            x=df.index.astype(str),
            y=df['Close'].tolist(),
            name='Bar Chart',
            visible=False
        ))

        # **Different Line Styles**
        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=df['Close'].tolist(),
            mode='lines',
            name='Dashed Line',
            line=dict(color='lightblue', dash='dash'),
            visible=False
        ))

        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=df['Close'].tolist(),
            mode='lines',
            name='Dotted Line',
            line=dict(color='lightblue', dash='dot'),
            visible=False
        ))

        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=df['Close'].tolist(),
            mode='lines',
            name='Step Chart',
            line_shape='hv',
            line=dict(color='lightblue'),
            visible=False
        ))

        # **Dropdown for Chart Type Selection**
        fig.update_layout(
            title=f'{ticker} Closing Prices - {key.upper()}',
            xaxis_title='Date',
            yaxis_title='Closing Price',
            xaxis_rangeslider_visible=True,
            plot_bgcolor='black',
            paper_bgcolor='black',
            height=700,  # **More Horizontal Space Added**
            width=1200,
            margin=dict(l=40, r=40, t=50, b=40),
            font=dict(color='white'),
            updatemenus=[
                {
                    'buttons': [
                        {'label': 'Line Chart', 'method': 'update', 'args': [{'visible': [True, False, False, False, False, False]}]},
                        {'label': 'Candlestick', 'method': 'update', 'args': [{'visible': [False, True, False, False, False, False]}]},
                        {'label': 'Bar Chart', 'method': 'update', 'args': [{'visible': [False, False, True, False, False, False]}]},
                        {'label': 'Dashed Line', 'method': 'update', 'args': [{'visible': [False, False, False, True, False, False]}]},
                        {'label': 'Dotted Line', 'method': 'update', 'args': [{'visible': [False, False, False, False, True, False]}]},
                        {'label': 'Step Chart', 'method': 'update', 'args': [{'visible': [False, False, False, False, False, True]}]},
                    ],
                    'direction': 'down',
                    'x': 1.0,
                    'y': 1.15,
                    'showactive': True
                }
            ]
        )

        # **Improve Axis & Grid Appearance**
        fig.update_xaxes(showgrid=True, gridwidth=0.5, gridcolor='grey')
        fig.update_yaxes(showgrid=True, gridwidth=0.5, gridcolor='grey')

        charts[key] = fig.to_dict()

    return charts

def stock_chart_view(request, ticker):
    logger.info(f"Fetching chart for {ticker}...")

    charts = generate_closing_price_graph(ticker)

    if charts:
        json_compatible = json.loads(json.dumps(charts, default=lambda x: x.tolist() if isinstance(x, np.ndarray) else x))
        return JsonResponse(json_compatible)

    logger.error(f"Failed to generate charts for {ticker}")
    return JsonResponse({'error': 'No data found'}, status=404)












































# app/views.py


from django.http import JsonResponse
import yfinance as yf
import time
from datetime import datetime, timedelta
from django.core.cache import cache
from cachetools import TTLCache
import logging
import json
import numpy as np
from django.http import HttpResponse
from django.shortcuts import render
import plotly.graph_objects as go
import pandas as pd

# Set up logging
logger = logging.getLogger(__name__)
def home(request):
    return HttpResponse("Hello, Django!")

    
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

def fetch_stock_data_and_compute_gainers_losers(request):
    tickers = ['20MICRONS', '21STCENMGM', '360ONE', '3IINFOLTD', '3MINDIA', '3PLAND', '5PAISA', '63MOONS', 'A2ZINFRA', 'AAATECH', 'AADHARHFC', 
                                       'LYKALABS', 'LYPSAGEMS', 'M&M', 'M&MFIN', 'MAANALU', 'MACPOWER', 'MADHAV', 'MADHUCON', 'MADRASFERT',
                                                 'MAGADSUGAR', 'MAGNUM', 'MAHABANK', 'MAHAPEXLTD', 'MAHASTEEL', 'MAHEPC', 'MAHESHWARI', 'MAHLIFE', 'MAHLOG', 'MAHSCOOTER', 'MAHSEAMLES', 'MAITHANALL', 'MALLCOM', 'MALUPAPER', 'MANAKALUCO', 'MANAKCOAT', 'MANAKSIA', 'MANAKSTEEL', 'MANALIPETC', 'MANAPPURAM', 'MANCREDIT', 'MANGALAM', 'MANGCHEFER', 'MANGLMCEM', 'MANINDS', 'MANINFRA', 'MANKIND', 'MANOMAY', 'MANORAMA', 'MANORG', 'MANUGRAPH', 'MANYAVAR', 'MAPMYINDIA', 'MARALOVER', 'MARATHON', 'MARICO', 'MARINE', 'MARKSANS', 'MARSHALL', 'MARUTI', 'MASFIN', 'MASKINVEST', 'MASTEK', 'MATRIMONY', 'MAWANASUG', 'MAXESTATES', 'MAXHEALTH', 'MAXIND', 'MAYURUNIQ', 'MAZDA', 'MAZDOCK', 'MBAPL', 'MBECL', 'MBLINFRA', 'MCL', 'MCLEODRUSS', 'MCX', 'MEDANTA', 'MEDIASSIST', 'MEDICAMEQ', 'MEDICO', 'MEDPLUS', 'MEGASOFT', 'MEGASTAR', 'MENONBE', 'METROBRAND', 'METROPOLIS', 'MFSL', 'MGEL', 'MGL', 'MHLXMIRU', 'MHRIL', 'MICEL', 'MIDHANI', 'MINDACORP', 'MINDTECK', 'MIRCELECTR', 'MIRZAINT', 'MITCON', 'MITTAL', 'MKPL', 'MMFL', 'MMP', 'MMTC', 'MODIRUBBER', 'MODISONLTD', 'MODTHREAD', 'MOHITIND', 'MOIL', 'MOKSH', 'MOL', 'MOLDTECH', 'MOLDTKPAC', 'MONARCH', 'MONTECARLO', 'MORARJEE', 'MOREPENLAB', 'MOTHERSON', 'MOTILALOFS', 'MOTISONS', 'MOTOGENFIN', 'MPHASIS', 'MPSLTD', 'MRF', 'MRO-TEK', 'MRPL', 'MSPL', 'MSTCLTD', 'MSUMI', 'MTARTECH', 'MTEDUCARE', 'MTNL', 'MUFIN', 'MUFTI', 'MUKANDLTD', 'MUKKA', 'MUKTAARTS', 'MUNJALAU', 'MUNJALSHOW', 'MURUDCERA', 'MUTHOOTCAP', 'MUTHOOTFIN', 'MUTHOOTMF', 'MVGJL', 'NACLIND', 'NAGAFERT', 'NAGREEKCAP', 'NAGREEKEXP', 'NAHARCAP', 'NAHARINDUS', 'NAHARPOLY', 'NAHARSPING', 'NAM-INDIA', 'NARMADA', 'NATCOPHARM', 'NATHBIOGEN', 'NATIONALUM', 'NAUKRI', 'NAVA', 'NAVINFLUOR', 'NAVKARCORP', 'NAVNETEDUL', 'NAZARA', 'NBCC', 'NBIFIN', 'NCC', 'NCLIND', 'NDGL', 'NDL', 'NDLVENTURE', 'NDRAUTO', 'NDTV', 'NECCLTD', 'NECLIFE', 'NELCAST', 'NELCO', 'NEOGEN', 'NESCO', 'NESTLEIND', 'NETWEB', 'NETWORK18', 'NEULANDLAB', 'NEWGEN', 'NEXTMEDIA', 'NFL', 'NGIL', 'NGLFINE', 'NH', 'NHPC', 'NIACL', 'NIBL', 'NIITLTD', 'NIITMTS', 'NILAINFRA', 'NILASPACES', 'NILKAMAL', 'NINSYS', 'NIPPOBATRY', 'NIRAJ', 'NIRAJISPAT', 'NITCO', 'NITINSPIN', 'NITIRAJ', 'NKIND', 'NLCINDIA', 'NMDC', 'NOCIL', 'NOIDATOLL', 'NORBTEAEXP', 'NOVAAGRI', 'NRAIL', 'NRBBEARING', 'NRL', 'NSIL', 'NSLNISP', 'NTPC', 'NUCLEUS', 'NURECA', 'NUVAMA', 'NUVOCO', 'NYKAA', 'OAL', 'OBCL', 'OBEROIRLTY', 'OCCL', 'OFSS', 'OIL', 'OILCOUNTUB', 'OLAELEC', 'OLECTRA', 'OMAXAUTO', 'OMAXE', 'OMINFRAL', 'ONELIFECAP', 'ONEPOINT', 'ONGC', 'ONMOBILE', 'ONWARDTEC', 'OPTIEMUS', 'ORBTEXP', 'ORCHPHARMA', 'ORICONENT', 'ORIENTALTL', 'ORIENTBELL', 'ORIENTCEM', 'ORIENTCER', 'ORIENTELEC', 'ORIENTHOT', 'ORIENTLTD', 'ORIENTPPR', 'ORISSAMINE', 'ORTEL', 'ORTINLAB', 'OSIAHYPER', 'OSWALAGRO', 'OSWALGREEN', 'OSWALSEEDS', 'PAGEIND', 'PAISALO', 'PAKKA', 'PALASHSECU', 'PALREDTEC', 'PANACEABIO', 'PANACHE', 'PANAMAPET', 'PANSARI', 'PAR', 'PARACABLES', 'PARADEEP', 'PARAGMILK', 'PARAS', 'PARASPETRO', 'PARKHOTELS', 'PARSVNATH', 'PASUPTAC', 'PATANJALI', 'PATELENG', 'PATINTLOG', 'PAVNAIND', 'PAYTM', 'PCBL', 'PCJEWELLER', 'PDMJEPAPER', 'PDSL', 'PEARLPOLY', 'PEL', 'PENIND', 'PENINLAND', 'PERSISTENT', 'PETRONET', 'PFC', 'PFIZER', 'PFOCUS', 'PFS', 'PGEL', 'PGHH', 'PGHL', 'PGIL', 'PHOENIXLTD', 'PIDILITIND', 'PIGL', 'PIIND', 'PILANIINVS', 'PILITA', 'PIONEEREMB', 'PITTIENG', 'PIXTRANS', 'PKTEA', 'PLASTIBLEN', 'PLATIND', 'PLAZACABLE', 'PNB', 'PNBGILTS', 'PNBHOUSING', 'PNC', 'PNCINFRA', 'POCL', 'PODDARHOUS', 'PODDARMENT', 'POKARNA', 'POLICYBZR', 'POLYCAB', 'POLYMED', 'POLYPLEX', 'PONNIERODE', 'POONAWALLA', 'POWERGRID', 'POWERINDIA', 'POWERMECH', 'PPAP', 'PPL', 'PPLPHARMA', 'PRAENG', 'PRAJIND', 'PRAKASH', 'PRAKASHSTL', 'PRAXIS', 'PRECAM', 'PRECOT', 'PRECWIRE', 'PREMEXPLN', 'PREMIERPOL', 'PRESTIGE', 'PRICOLLTD', 'PRIMESECU', 'PRINCEPIPE', 'PRITI', 'PRITIKAUTO', 'PRIVISCL', 'PROZONER', 'PRSMJOHNSN', 'PRUDENT', 'PRUDMOULI', 'PSB', 'PSPPROJECT', 'PTC', 'PTCIL', 'PTL', 'PUNJABCHEM', 'PURVA', 'PVP', 'PVRINOX', 'PVSL', 'PYRAMID', 'QUESS', 'QUICKHEAL', 'RACE', 'RADHIKAJWE', 'RADIANTCMS', 'RADICO', 'RADIOCITY', 'RAILTEL', 'RAIN', 'RAINBOW', 'RAJESHEXPO', 'RAJMET', 'RAJRATAN', 'RAJRILTD', 'RAJSREESUG', 'RAJTV', 'RALLIS', 'RAMANEWS', 'RAMAPHO', 'RAMASTEEL', 'RAMCOCEM', 'RAMCOIND', 'RAMCOSYS', 'RAMKY', 'RAMRAT', 'RANASUG', 'RANEENGINE', 'RANEHOLDIN', 'RATEGAIN', 'RATNAMANI',
                             'RATNAVEER', 'RAYMOND',  'ZYDUSWELL']
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
                                       'LYKALABS', 'LYPSAGEMS', 'M&M', 'M&MFIN', 'MAANALU', 'MACPOWER', 'MADHAV', 'MADHUCON', 'MADRASFERT',
                                                 'MAGADSUGAR', 'MAGNUM', 'MAHABANK', 'MAHAPEXLTD', 'MAHASTEEL', 'MAHEPC', 'MAHESHWARI', 'MAHLIFE', 'MAHLOG', 'MAHSCOOTER', 'MAHSEAMLES', 'MAITHANALL', 'MALLCOM', 'MALUPAPER', 'MANAKALUCO', 'MANAKCOAT', 'MANAKSIA', 'MANAKSTEEL', 'MANALIPETC', 'MANAPPURAM', 'MANCREDIT', 'MANGALAM', 'MANGCHEFER', 'MANGLMCEM', 'MANINDS', 'MANINFRA', 'MANKIND', 'MANOMAY', 'MANORAMA', 'MANORG', 'MANUGRAPH', 'MANYAVAR', 'MAPMYINDIA', 'MARALOVER', 'MARATHON', 'MARICO', 'MARINE', 'MARKSANS', 'MARSHALL', 'MARUTI', 'MASFIN', 'MASKINVEST', 'MASTEK', 'MATRIMONY', 'MAWANASUG', 'MAXESTATES', 'MAXHEALTH', 'MAXIND', 'MAYURUNIQ', 'MAZDA', 'MAZDOCK', 'MBAPL', 'MBECL', 'MBLINFRA', 'MCL', 'MCLEODRUSS', 'MCX', 'MEDANTA', 'MEDIASSIST', 'MEDICAMEQ', 'MEDICO', 'MEDPLUS', 'MEGASOFT', 'MEGASTAR', 'MENONBE', 'METROBRAND', 'METROPOLIS', 'MFSL', 'MGEL', 'MGL', 'MHLXMIRU', 'MHRIL', 'MICEL', 'MIDHANI', 'MINDACORP', 'MINDTECK', 'MIRCELECTR', 'MIRZAINT', 'MITCON', 'MITTAL', 'MKPL', 'MMFL', 'MMP', 'MMTC', 'MODIRUBBER', 'MODISONLTD', 'MODTHREAD', 'MOHITIND', 'MOIL', 'MOKSH', 'MOL', 'MOLDTECH', 'MOLDTKPAC', 'MONARCH', 'MONTECARLO', 'MORARJEE', 'MOREPENLAB', 'MOTHERSON', 'MOTILALOFS', 'MOTISONS', 'MOTOGENFIN', 'MPHASIS', 'MPSLTD', 'MRF', 'MRO-TEK', 'MRPL', 'MSPL', 'MSTCLTD', 'MSUMI', 'MTARTECH', 'MTEDUCARE', 'MTNL', 'MUFIN', 'MUFTI', 'MUKANDLTD', 'MUKKA', 'MUKTAARTS', 'MUNJALAU', 'MUNJALSHOW', 'MURUDCERA', 'MUTHOOTCAP', 'MUTHOOTFIN', 'MUTHOOTMF', 'MVGJL', 'NACLIND', 'NAGAFERT', 'NAGREEKCAP', 'NAGREEKEXP', 'NAHARCAP', 'NAHARINDUS', 'NAHARPOLY', 'NAHARSPING', 'NAM-INDIA', 'NARMADA', 'NATCOPHARM', 'NATHBIOGEN', 'NATIONALUM', 'NAUKRI', 'NAVA', 'NAVINFLUOR', 'NAVKARCORP', 'NAVNETEDUL', 'NAZARA', 'NBCC', 'NBIFIN', 'NCC', 'NCLIND', 'NDGL', 'NDL', 'NDLVENTURE', 'NDRAUTO', 'NDTV', 'NECCLTD', 'NECLIFE', 'NELCAST', 'NELCO', 'NEOGEN', 'NESCO', 'NESTLEIND', 'NETWEB', 'NETWORK18', 'NEULANDLAB', 'NEWGEN', 'NEXTMEDIA', 'NFL', 'NGIL', 'NGLFINE', 'NH', 'NHPC', 'NIACL', 'NIBL', 'NIITLTD', 'NIITMTS', 'NILAINFRA', 'NILASPACES', 'NILKAMAL', 'NINSYS', 'NIPPOBATRY', 'NIRAJ', 'NIRAJISPAT', 'NITCO', 'NITINSPIN', 'NITIRAJ', 'NKIND', 'NLCINDIA', 'NMDC', 'NOCIL', 'NOIDATOLL', 'NORBTEAEXP', 'NOVAAGRI', 'NRAIL', 'NRBBEARING', 'NRL', 'NSIL', 'NSLNISP', 'NTPC', 'NUCLEUS', 'NURECA', 'NUVAMA', 'NUVOCO', 'NYKAA', 'OAL', 'OBCL', 'OBEROIRLTY', 'OCCL', 'OFSS', 'OIL', 'OILCOUNTUB', 'OLAELEC', 'OLECTRA', 'OMAXAUTO', 'OMAXE', 'OMINFRAL', 'ONELIFECAP', 'ONEPOINT', 'ONGC', 'ONMOBILE', 'ONWARDTEC', 'OPTIEMUS', 'ORBTEXP', 'ORCHPHARMA', 'ORICONENT', 'ORIENTALTL', 'ORIENTBELL', 'ORIENTCEM', 'ORIENTCER', 'ORIENTELEC', 'ORIENTHOT', 'ORIENTLTD', 'ORIENTPPR', 'ORISSAMINE', 'ORTEL', 'ORTINLAB', 'OSIAHYPER', 'OSWALAGRO', 'OSWALGREEN', 'OSWALSEEDS', 'PAGEIND', 'PAISALO', 'PAKKA', 'PALASHSECU', 'PALREDTEC', 'PANACEABIO', 'PANACHE', 'PANAMAPET', 'PANSARI', 'PAR', 'PARACABLES', 'PARADEEP', 'PARAGMILK', 'PARAS', 'PARASPETRO', 'PARKHOTELS', 'PARSVNATH', 'PASUPTAC', 'PATANJALI', 'PATELENG', 'PATINTLOG', 'PAVNAIND', 'PAYTM', 'PCBL', 'PCJEWELLER', 'PDMJEPAPER', 'PDSL', 'PEARLPOLY', 'PEL', 'PENIND', 'PENINLAND', 'PERSISTENT', 'PETRONET', 'PFC', 'PFIZER', 'PFOCUS', 'PFS', 'PGEL', 'PGHH', 'PGHL', 'PGIL', 'PHOENIXLTD', 'PIDILITIND', 'PIGL', 'PIIND', 'PILANIINVS', 'PILITA', 'PIONEEREMB', 'PITTIENG', 'PIXTRANS', 'PKTEA', 'PLASTIBLEN', 'PLATIND', 'PLAZACABLE', 'PNB', 'PNBGILTS', 'PNBHOUSING', 'PNC', 'PNCINFRA', 'POCL', 'PODDARHOUS', 'PODDARMENT', 'POKARNA', 'POLICYBZR', 'POLYCAB', 'POLYMED', 'POLYPLEX', 'PONNIERODE', 'POONAWALLA', 'POWERGRID', 'POWERINDIA', 'POWERMECH', 'PPAP', 'PPL', 'PPLPHARMA', 'PRAENG', 'PRAJIND', 'PRAKASH', 'PRAKASHSTL', 'PRAXIS', 'PRECAM', 'PRECOT', 'PRECWIRE', 'PREMEXPLN', 'PREMIERPOL', 'PRESTIGE', 'PRICOLLTD', 'PRIMESECU', 'PRINCEPIPE', 'PRITI', 'PRITIKAUTO', 'PRIVISCL', 'PROZONER', 'PRSMJOHNSN', 'PRUDENT', 'PRUDMOULI', 'PSB', 'PSPPROJECT', 'PTC', 'PTCIL', 'PTL', 'PUNJABCHEM', 'PURVA', 'PVP', 'PVRINOX', 'PVSL', 'PYRAMID', 'QUESS', 'QUICKHEAL', 'RACE', 'RADHIKAJWE', 'RADIANTCMS', 'RADICO', 'RADIOCITY', 'RAILTEL', 'RAIN', 'RAINBOW', 'RAJESHEXPO', 'RAJMET', 'RAJRATAN', 'RAJRILTD', 'RAJSREESUG', 'RAJTV', 'RALLIS', 'RAMANEWS', 'RAMAPHO', 'RAMASTEEL', 'RAMCOCEM', 'RAMCOIND', 'RAMCOSYS', 'RAMKY', 'RAMRAT', 'RANASUG', 'RANEENGINE', 'RANEHOLDIN', 'RATEGAIN', 'RATNAMANI',
                             'RATNAVEER', 'RAYMOND',  'ZYDUSWELL']


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

import yfinance as yf
import plotly.graph_objects as go
import pandas as pd
import json
import numpy as np
import logging
from django.http import JsonResponse

logger = logging.getLogger(__name__)

def generate_closing_price_graph(ticker):
    """
    Fetches stock data from Yahoo Finance and generates multiple stock charts
    for different timeframes ('1D', '1M', '6M', '1Y', '5Y').
    """
    stock = yf.Ticker(ticker)

    # Define timeframes
    timeframes = {
        "1D": stock.history(period="1d"),
        "1M": stock.history(period="1mo"),
        "6M": stock.history(period="6mo"),
        "1Y": stock.history(period="1y"),
        "5Y": stock.history(period="5y")
    }

    charts = {}

    for key, df in timeframes.items():
        if df.empty:
            logger.warning(f"No data found for {ticker} ({key} timeframe)")
            continue

        # Process Data
        df.reset_index(inplace=True)
        df['date'] = pd.to_datetime(df['Date'])
        df.set_index('date', inplace=True)

        fig = go.Figure()

        # **Main Line Chart (Default)**
        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=df['Close'].tolist(),
            mode='lines',
            name='Closing Price',
            line=dict(color='lightblue', width=2),
            fill='tozeroy',
            fillcolor='rgba(173, 216, 230, 0.3)',
            visible=True
        ))

        # **Candlestick Chart**
        fig.add_trace(go.Candlestick(
            x=df.index.astype(str),
            open=df['Open'].tolist(),
            high=df['High'].tolist(),
            low=df['Low'].tolist(),
            close=df['Close'].tolist(),
            name='Candlestick',
            visible=False
        ))

        # **Bar Chart**
        fig.add_trace(go.Bar(
            x=df.index.astype(str),
            y=df['Close'].tolist(),
            name='Bar Chart',
            visible=False
        ))

        # **Different Line Styles**
        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=df['Close'].tolist(),
            mode='lines',
            name='Dashed Line',
            line=dict(color='lightblue', dash='dash'),
            visible=False
        ))

        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=df['Close'].tolist(),
            mode='lines',
            name='Dotted Line',
            line=dict(color='lightblue', dash='dot'),
            visible=False
        ))

        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=df['Close'].tolist(),
            mode='lines',
            name='Step Chart',
            line_shape='hv',
            line=dict(color='lightblue'),
            visible=False
        ))

        # **Dropdown for Chart Type Selection**
        fig.update_layout(
            title={
                'text': f'{ticker} Closing Prices - {key.upper()}',
                'x': 0.5,  # Center align title
                'xanchor': 'center',
                'font': {'size': 18, 'color': 'white'}
            },
            xaxis_title='Date',
            yaxis_title='Closing Price',
            xaxis_rangeslider_visible=True,
            plot_bgcolor='black',
            paper_bgcolor='black',
            height=750,  # **Further Increased Graph Size**
            width=1300,  # **More Horizontal Expansion**
            margin=dict(l=40, r=40, t=80, b=40),  # **Increased top margin**
            font=dict(color='white'),
            updatemenus=[
                {
                    'buttons': [
                        {'label': 'Line Chart', 'method': 'update', 'args': [{'visible': [True, False, False, False, False, False]}]},
                        {'label': 'Candlestick', 'method': 'update', 'args': [{'visible': [False, True, False, False, False, False]}]},
                        {'label': 'Bar Chart', 'method': 'update', 'args': [{'visible': [False, False, True, False, False, False]}]},
                        {'label': 'Dashed Line', 'method': 'update', 'args': [{'visible': [False, False, False, True, False, False]}]},
                        {'label': 'Dotted Line', 'method': 'update', 'args': [{'visible': [False, False, False, False, True, False]}]},
                        {'label': 'Step Chart', 'method': 'update', 'args': [{'visible': [False, False, False, False, False, True]}]},
                    ],
                    'direction': 'down',
                    'x': 0.88,  # **Move left of timeframe dropdown**
                    'y': 1.2,
                    'showactive': True
                }
            ]
        )

        # **Move Zoom/Pan Controls Above Chart**
        fig.update_layout(
            modebar={'orientation': 'h', 'bgcolor': 'rgba(0, 0, 0, 0.7)'}
        )

        # **Improve Axis & Grid Appearance**
        fig.update_xaxes(showgrid=True, gridwidth=0.5, gridcolor='grey')
        fig.update_yaxes(showgrid=True, gridwidth=0.5, gridcolor='grey')

        charts[key] = fig.to_dict()

    return charts

def stock_chart_view(request, ticker):
    logger.info(f"Fetching chart for {ticker}...")

    charts = generate_closing_price_graph(ticker)

    if charts:
        json_compatible = json.loads(json.dumps(charts, default=lambda x: x.tolist() if isinstance(x, np.ndarray) else x))
        return JsonResponse(json_compatible)

    logger.error(f"Failed to generate charts for {ticker}")
    return JsonResponse({'error': 'No data found'}, status=404)
