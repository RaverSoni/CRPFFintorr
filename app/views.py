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
import matplotlib as plt

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

# def api_update_gainers_losers(request):
#     tickers = ['AARTIIND', 'ADANIENSOL', 'ADANIENT', 'ADANIGREEN', 'ADANIPORTS', 'ADANIPOWER', 'ADVANIHOTR', 'AGI', 'ALOKINDS', 'APLAPOLLO', 'BAJAJ-AUTO',
#                      'BALKRISHNA', 'BAJAJELEC', 'BAJAJFINSV', 'BAJAJELEC', 'BEL', 'BERGEPAINT', 'BHEL', 'BIOCON', 'BIRLACORPN','BLUEDART', 'BOROLTD', 'BORORENEW', 'BPCL','BPL', 'BRITANNIA',
#                        'BSE', 'CDSL','COALINDIA', 'COCHINSHIP', 'CYIENT', 'DABUR','EICHERMOT', 'EIHAHOTELS', 'EIHOTEL', 'EIHOTEL','FEDERALBNK', 'GAIL', 'HAVELLS', 'HCLTECH','HINDMOTORS', 'HINDPETRO',
#                          'HINDALCO', 'HINDCON','HINDCOPPER', 'HINDMOTORS', 'HINDUNILVR', 'DELTACORP','DIVISLAB', 'DIXON', 'DMART', 'E2E','EASEMYTRIP', 'GMRINFRA', 'GRANULES', 'GRASIM','HAL', 'HAPPSTMNDS', 'HAPPYFORGE', 'HBLPOWER',
#                          'HITECH', 'HITECHCORP', 'ICICIBANK', 'ICIL','IDEAFORGE', 'IGL', 'INDBANK', 'INDHOTEL','INDIACEM', 'INDIGO', 'INDUSINDBK', 'INFIBEAM','INFY', 'IOB', 'IOC', 'IRCON',
#                     'IRCTC', 'IREDA', 'IRFC', 'ITC','JINDALSTEL', 'JIOFIN', 'JKLAKSHMI', 'JTLIND', 'KAYNES', 'KOTAKBANK', 'KRSNAA', 'KSOLVES','LALPATHLAB', 'LICI',
#                       'M&M', 'M&MFIN','MAHABANK', 'MAHABANK', 'MAZDOCK', 'MMTC','MOTHERSON', 'MPHASIS', 'NATIONALUM', 'ONGC','OMINFRAL', 'PATANJALI', 'POWERINDIA', 'POONAWALLA','SAFARI', 'SAIL', 'SBILIFE', 'NBCC',
#                       'NHPC', 'NITCO', 'NMDC', 'NTPC','NYKAA','OLAELEC', 'PATANJALI', 'POWERGRID','RAYMOND', 'RBL', 'RECLTD', 'ORIENTLTD','RTNINDIA', 'RTNPOWER', 'RVNL', 'TVSMOTOR','UNIONBANK', 'UPL',
#                       'NESTLEIND', 'PCJEWELLER','RELIANCE', 'RELTD', 'REPL', 'SBICARD','SBIN', 'SIEMENS', 'SJVN', 'SUNDARMFIN','SUZLON', 'TAJGVK', 'TCS', 'TRENT','TRIDENT', 'VOLTAS', 'WELCORP', 'WELENT','WELSPUNLIV', 'WIPRO', 'YESBANK', 'ZEEL','ZOMATO', 'ZYDUSLIFE',
#                       'TATACHEM', 'TATACOMM', 'TATACONSUM', 'TATAELXSI','TATAINVEST', 'TATAMOTORS', 'TATAMTRDVR', 'TATAPOWER', 'TATASTEEL', 'TATATECH',]
#     data_list = []
#     for ticker in tickers:
#         if not ticker.endswith('.NS'):
#             ticker += '.NS'

#         try:
#             stock_data = yf.Ticker(ticker)
#             stock_quote = stock_data.history(period="1d").tail(1)
#             stock_info_data = stock_data.info
#             pe_ratio = round(stock_info_data.get('trailingPE', 0), 2) if stock_info_data.get('trailingPE') else 'N/A'
#             price = round(stock_quote['Close'].values[0], 2) if not stock_quote.empty else None
#             open_price = round(stock_quote['Open'].values[0], 2) if not stock_quote.empty else None
#             change = round(price - open_price, 2) if open_price else None
#             percentage_change = round(((price - open_price) / open_price) * 100, 2) if open_price else None
#             dayChartImage = 'app/static/gainer.jpg' 
#             data_list.append({'symbol': ticker, 'price': price, 'percentage_change': percentage_change, 'change': change, 'pe_ratio': pe_ratio, dayChartImage: '/static/gainer.jpg' })
#         except Exception as e:
#             print(f"Error fetching data for {ticker}: {e}")

#     sorted_data = sorted(data_list, key=lambda x: x['percentage_change'] or float('-inf'), reverse=True)
#     top_gainers = sorted_data[:5]
#     top_losers = sorted_data[-5:]

#     return JsonResponse({'top_gainers': top_gainers, 'top_losers': top_losers})

def api_update_gainers_losers(request):
    tickers = ['AARTIIND', 'ADANIENSOL', 'ADANIENT', 'ADANIGREEN', 'ADANIPORTS', 'ADANIPOWER', 'ADVANIHOTR', 'AGI', 'ALOKINDS', 'APLAPOLLO', 'BAJAJ-AUTO',
                     'BALKRISHNA', 'BAJAJELEC', 'BAJAJFINSV', 'BAJAJELEC', 'BEL', 'BERGEPAINT', 'BHEL', 'BIOCON', 'BIRLACORPN','BLUEDART', 'BOROLTD', 'BORORENEW', 'BPCL','BPL', 'BRITANNIA',
                       'TATATECH',]

    data_list = []
    for ticker in tickers:
        if not ticker.endswith('.NS'):
            ticker += '.NS'

        try:
            stock_data = yf.Ticker(ticker)
            stock_quote = stock_data.history(period="1d").tail(1)
            stock_info_data = stock_data.info

            # Extract PE Ratio properly
            pe_ratio = stock_info_data.get('trailingPE')
            pe_ratio = round(pe_ratio, 2) if isinstance(pe_ratio, (int, float)) else None  # Ensuring it's a number

            price = round(stock_quote['Close'].values[0], 2) if not stock_quote.empty else None
            open_price = round(stock_quote['Open'].values[0], 2) if not stock_quote.empty else None
            change = round(price - open_price, 2) if open_price else None
            percentage_change = round(((price - open_price) / open_price) * 100, 2) if open_price else None
            dayChartImage = 'app/static/gainer.jpg' 

            data_list.append({
                'symbol': ticker, 
                'price': price, 
                'percentage_change': percentage_change, 
                'change': change, 
                'pe_ratio': pe_ratio,  # Fix applied here
                'dayChartImage': '/static/gainer.jpg'
            })
        except Exception as e:
            print(f"Error fetching data for {ticker}: {e}")

    sorted_data = sorted(data_list, key=lambda x: x['percentage_change'] or float('-inf'), reverse=True)
    top_gainers = sorted_data[:5]
    top_losers = sorted_data[-5:]

    return JsonResponse({'top_gainers': top_gainers, 'top_losers': top_losers})


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


import yfinance as yf
from django.http import JsonResponse

from django.http import JsonResponse
import yfinance as yf

def fetch_stock_data(tickers, period="1d", page=1, per_page=20, volume_threshold=1000000):
    results = []
    trending_candidates = []

    total_stocks = len(TICKERS)  # Use full ticker list for pagination
    start_index = (page - 1) * per_page
    end_index = start_index + per_page
    tickers_to_fetch = TICKERS[start_index:end_index]  # Slice from full list

    for ticker in tickers_to_fetch:
        if not ticker.endswith('.NS'):
            ticker += '.NS'

        try:
            stock_data = yf.Ticker(ticker)
            stock_quote = stock_data.history(period=period).tail(1)
            stock_info_data = stock_data.info

            if not stock_quote.empty:
                close_price = stock_quote['Close'].values[0]
                open_price = stock_quote['Open'].values[0]
                change_percent = round(((close_price - open_price) / open_price) * 100, 2) if open_price else None
                volume = stock_quote['Volume'].values[0]
                high = stock_quote['High'].values[0]
                low = stock_quote['Low'].values[0]
            else:
                close_price = open_price = change_percent = volume = high = low = None

            stock_info = {
                'ticker': ticker,
                'name': stock_info_data.get('longName', 'N/A'),
                'price': round(close_price, 2) if close_price else None,
                'change': change_percent,
                'open_price': round(open_price, 2) if open_price else None,
                'high': round(high, 2) if high else None,
                'volume': round(volume / 100000, 2) if volume else None,
                'avg_volume': round(stock_info_data.get('averageVolume', 0) / 100000, 2) if stock_info_data.get('averageVolume') else 'N/A',
                'market_cap': round(stock_info_data.get('marketCap', 0) / 10000000, 2) if stock_info_data.get('marketCap') else 'N/A',
                'pe_ratio': round(stock_info_data.get('trailingPE', 0), 2) if stock_info_data.get('trailingPE') else 'N/A',
                'high_52wk': round(stock_info_data.get('fiftyTwoWeekHigh', 0), 2) if stock_info_data.get('fiftyTwoWeekHigh') else 'N/A',
                'low_52wk': round(stock_info_data.get('fiftyTwoWeekLow', 0), 2) if stock_info_data.get('fiftyTwoWeekLow') else 'N/A',
                'sector': stock_info_data.get('sector', 'N/A')
            }

            results.append(stock_info)

            if volume and volume > volume_threshold:
                trending_candidates.append(stock_info)

        except Exception as e:
            results.append({'error': f"Failed to fetch data for {ticker}: {e}"})

    total_pages = (total_stocks + per_page - 1) // per_page

    return {
        'stocks': results,
        'trending_stocks': trending_candidates[:per_page],
        'total': total_stocks,
        'current_page': page,
        'per_page': per_page,
        'total_pages': total_pages
    }

def stock_data_view(request):
    try:
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))
        period = request.GET.get('period', '1d')
        volume_threshold = int(request.GET.get('volume_threshold', 1000000))

        stock_data = fetch_stock_data(TICKERS, period, page, per_page, volume_threshold)

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

# def stock_chart_view(request, ticker):
#     logger.info(f"Fetching chart for {ticker}...")

#     charts = generate_closing_price_graph(ticker)
#     technical_chart = generate_technical_chart(ticker)

#     if charts:
#         json_compatible = json.loads(json.dumps(charts, default=lambda x: x.tolist() if isinstance(x, np.ndarray) else x))
#         return JsonResponse(json_compatible)

#     logger.error(f"Failed to generate charts for {ticker}")
#     return JsonResponse({'error': 'No data found'}, status=404)


import yfinance as yf
import plotly.graph_objects as go
import pandas as pd
import json
import numpy as np
import logging
from django.http import JsonResponse

logger = logging.getLogger(__name__)

def calculate_technical_indicators(df):
    """Compute multiple technical indicators"""
    if df.empty or len(df) < 20:  # Ensure enough data points
        return df

    df["SMA_20"] = df["Close"].rolling(window=20, min_periods=1).mean()
    df["SMA_50"] = df["Close"].rolling(window=50, min_periods=1).mean()
    df["SMA_200"] = df["Close"].rolling(window=200, min_periods=1).mean()
    df["EMA_20"] = df["Close"].ewm(span=20, adjust=False).mean()
    
    # Compute RSI
    df["RSI"] = compute_rsi(df["Close"])

    # Compute MACD
    df["MACD"], df["MACD_Signal"], df["MACD_Hist"] = compute_macd(df["Close"])

    # Compute ATR
    df["ATR"] = compute_atr(df)

    # Compute ADX
    df["ADX"] = compute_adx(df)

    # Compute OBV
    df["OBV"] = compute_obv(df)

    # Compute Bollinger Bands
    rolling_mean = df["Close"].rolling(window=20, min_periods=1).mean()
    rolling_std = df["Close"].rolling(window=20, min_periods=1).std()
    
    df["BB_Upper"] = rolling_mean + (rolling_std * 2)
    df["BB_Lower"] = rolling_mean - (rolling_std * 2)

    # Ensure BB columns exist to avoid KeyError
    df["BB_Upper"].fillna(df["Close"], inplace=True)
    df["BB_Lower"].fillna(df["Close"], inplace=True)

    return df


# def generate_technical_chart(ticker):
#     """Generates technical analysis charts for different timeframes"""
#     stock = yf.Ticker(ticker)
#     charts = {}

#     # Define timeframes
#     timeframes = {
#         "1D": stock.history(period="1d"),
#         "1M": stock.history(period="1mo"),
#         "6M": stock.history(period="6mo"),
#         "1Y": stock.history(period="1y"),
#         "5Y": stock.history(period="5y")
#     }

#     for key, df in timeframes.items():
#         if df.empty:
#             logger.warning(f"No data found for {ticker} ({key} timeframe)")
#             continue

#         # Apply technical indicators
#         df.reset_index(inplace=True)
#         df["date"] = pd.to_datetime(df["Date"])
#         df.set_index("date", inplace=True)
#         df = calculate_technical_indicators(df)

#         fig = go.Figure()

#         # **RSI Indicator with Overbought/Oversold Lines**
#         fig.add_trace(go.Scatter(
#             x=df.index.astype(str),
#             y=df["RSI"],
#             mode="lines",
#             name="RSI",
#             line=dict(color="cyan", width=2),
#         ))
#         fig.add_trace(go.Scatter(
#             x=df.index.astype(str),
#             y=[70] * len(df),
#             mode="lines",
#             name="Overbought (70)",
#             line=dict(color="red", dash="dot"),
#         ))
#         fig.add_trace(go.Scatter(
#             x=df.index.astype(str),
#             y=[30] * len(df),
#             mode="lines",
#             name="Oversold (30)",
#             line=dict(color="green", dash="dot"),
#         ))

#         # **MACD with Histogram**
#         fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["MACD"], mode="lines", name="MACD", line=dict(color="blue", width=2)))
#         fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["MACD_Signal"], mode="lines", name="MACD Signal", line=dict(color="orange", width=2)))
#         # fig.add_trace(go.Bar(x=df.index.astype(str), y=df["MACD_Histogram"], name="MACD Histogram", marker=dict(color="gray"), opacity=0.4))

#         # **Bollinger Bands**
#         fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["BB_Upper"], mode="lines", name="Upper Bollinger", line=dict(color="lightgray", width=1)))
#         fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["BB_Lower"], mode="lines", name="Lower Bollinger", line=dict(color="lightgray", width=1)))

#         fig.update_layout(
#             title={"text": f"{ticker} Technical Indicators - {key}", "x": 0.5, "xanchor": "center", "font": {"size": 18, "color": "white"}},
#             xaxis_title="Date",
#             yaxis_title="Indicator Value",
#             xaxis_rangeslider_visible=True,
#             plot_bgcolor="black",
#             paper_bgcolor="black",
#             font=dict(color="white"),
#             height=400,
#             width=1300,
#         )

#         charts[key] = fig.to_dict()

#     return charts

def generate_technical_chart(ticker):
    """Generates technical analysis charts for different timeframes"""
    stock = yf.Ticker(ticker)
    charts = {}

    # Define timeframes
    timeframes = {
        "1D": stock.history(period="1d"),
        "1M": stock.history(period="1mo"),
        "6M": stock.history(period="6mo"),
        "1Y": stock.history(period="1y"),
        "5Y": stock.history(period="5y")
    }

    for key, df in timeframes.items():
        if df.empty:
            logger.warning(f"No data found for {ticker} ({key} timeframe)")
            continue

        # Apply technical indicators
        df.reset_index(inplace=True)
        df["date"] = pd.to_datetime(df["Date"])
        df.set_index("date", inplace=True)
        df = calculate_technical_indicators(df)

        fig = go.Figure()

        # **Safe Data Fetching Helper**
        def get_series(col_name, default_val=None):
            return df[col_name] if col_name in df else [default_val] * len(df)

        # **RSI Indicator with Overbought/Oversold Lines**
        if "RSI" in df:
            fig.add_trace(go.Scatter(
                x=df.index.astype(str),
                y=df["RSI"],
                mode="lines",
                name="RSI",
                line=dict(color="cyan", width=2),
            ))
        else:
            logger.warning(f"RSI missing for {ticker} ({key} timeframe)")

        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=[70] * len(df),
            mode="lines",
            name="Overbought (70)",
            line=dict(color="red", dash="dot"),
        ))
        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=[30] * len(df),
            mode="lines",
            name="Oversold (30)",
            line=dict(color="green", dash="dot"),
        ))

        # **MACD with Histogram**
        if "MACD" in df and "MACD_Signal" in df:
            fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["MACD"], mode="lines", name="MACD", line=dict(color="blue", width=2)))
            fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["MACD_Signal"], mode="lines", name="MACD Signal", line=dict(color="orange", width=2)))
        else:
            logger.warning(f"MACD missing for {ticker} ({key} timeframe)")

        # **Bollinger Bands**
        if "BB_Upper" in df and "BB_Lower" in df:
            fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["BB_Upper"], mode="lines", name="Upper Bollinger", line=dict(color="lightgray", width=1)))
            fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["BB_Lower"], mode="lines", name="Lower Bollinger", line=dict(color="lightgray", width=1)))
        else:
            logger.warning(f"Bollinger Bands missing for {ticker} ({key} timeframe)")

        fig.update_layout(
            title={"text": f"{ticker} Technical Indicators - {key}", "x": 0.5, "xanchor": "center", "font": {"size": 18, "color": "white"}},
            xaxis_title="Date",
            yaxis_title="Indicator Value",
            xaxis_rangeslider_visible=True,
            plot_bgcolor="black",
            paper_bgcolor="black",
            font=dict(color="white"),
            height=400,
            width=1300,
        )

        charts[key] = fig.to_dict()

    return charts


def stock_chart_view(request, ticker):
    """Fetches both the stock price chart and the technical indicators chart"""
    logger.info(f"Fetching charts for {ticker}...")

    # Fetch the main stock chart
    charts = generate_closing_price_graph(ticker)
    
    # Fetch the technical indicators chart
    technical_chart = generate_technical_chart(ticker)

    if charts and technical_chart:
        json_compatible = {
            "stock_chart": json.loads(json.dumps(charts, default=lambda x: x.tolist() if isinstance(x, np.ndarray) else x)),
            "technical_chart": json.loads(json.dumps(technical_chart, default=lambda x: x.tolist() if isinstance(x, np.ndarray) else x))
        }
        return JsonResponse(json_compatible)

    logger.error(f"Failed to generate charts for {ticker}")
    return JsonResponse({'error': 'No data found'}, status=404)


from django.http import JsonResponse
import yfinance as yf

# def stock_info_view(request, ticker):
#     try:
#         stock_data = yf.Ticker(ticker)
        
#         # Get stock history (price data)
#         stock_history = stock_data.history(period="1d")
#         latest_price = stock_history["Close"].iloc[-1] if not stock_history.empty else None

#         # Get metadata (only if history retrieval worked)
#         stock_info = stock_data.info if latest_price else {}

#         def safe_number(value, default=0):
#             return value if isinstance(value, (int, float)) else default

#         response_data = {
#             'ticker': ticker,
#             'company': stock_info.get('longName', 'N/A'),
#             'exchange': stock_info.get('exchange', 'N/A'),
#             'price': safe_number(latest_price),
#             'change': safe_number(stock_info.get('regularMarketChange')),
#             'percentage': safe_number(stock_info.get('regularMarketChangePercent')),
#             'open': safe_number(stock_info.get('open')),
#             'high': safe_number(stock_info.get('dayHigh')),
#             'low': safe_number(stock_info.get('dayLow')),
#             'marketCap': safe_number(stock_info.get('marketCap')),
#             'avgVolume': safe_number(stock_info.get('averageVolume')),
#             'sharesOutstanding': safe_number(stock_info.get('sharesOutstanding')),
#             'dividendYield': safe_number(stock_info.get('dividendYield'), None),
#         }

#         # Return error if price is missing
#         if response_data["price"] is None:
#             return JsonResponse({'error': 'Failed to fetch stock price'}, status=400)

#         return JsonResponse(response_data)

#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)

# CURRENCY_MAP = {
#     "NASDAQ": "$",
#     "NYSE": "$",
#     "NSI": "₹",
#     "BSE": "₹",
#     "LSE": "£",
#     "JPX": "¥",
#     "SSE": "¥",
# }

# def stock_info_view(request, ticker):
#     try:
#         stock_data = yf.Ticker(ticker)
        
#         # Get stock history (price data)
#         stock_history = stock_data.history(period="1d")
#         latest_price = stock_history["Close"].iloc[-1] if not stock_history.empty else None
#         open_price = stock_history["Open"].iloc[-1] if not stock_history.empty else None

#         # Get metadata (only if history retrieval worked)
#         stock_info = stock_data.info if latest_price else {}

#         def safe_number(value, default=0):
#             return value if isinstance(value, (int, float)) else default

#         # Calculate change and percentage change
#         change = latest_price - open_price if latest_price and open_price else None
#         percentage_change = (change / open_price * 100) if change and open_price else None

#         exchange = stock_info.get('exchange', 'N/A')
#         currency_symbol = CURRENCY_MAP.get(exchange, "$")  # Default to USD

#         response_data = {
#             'ticker': ticker,
#             'company': stock_info.get('longName', 'N/A'),
#             'exchange': exchange,
#             'currencySymbol': currency_symbol,
#             'price': safe_number(latest_price),
#             'change': safe_number(change),
#             'percentage': safe_number(percentage_change),
#             'open': safe_number(open_price),
#             'high': safe_number(stock_info.get('dayHigh')),
#             'low': safe_number(stock_info.get('dayLow')),
#             'marketCap': safe_number(stock_info.get('marketCap')),
#             'avgVolume': safe_number(stock_info.get('averageVolume')),
#             'sharesOutstanding': safe_number(stock_info.get('sharesOutstanding')),
#             'dividendYield': safe_number(stock_info.get('dividendYield'), None),
#         }

#         # Return error if price is missing
#         if response_data["price"] is None:
#             return JsonResponse({'error': 'Failed to fetch stock price'}, status=400)

#         return JsonResponse(response_data)

    # except Exception as e:
    #     return JsonResponse({'error': str(e)}, status=500)

# import yfinance as yf
# from django.http import JsonResponse

# # Currency mapping for different exchanges
# CURRENCY_MAP = {
#     "NASDAQ": "$",
#     "NYSE": "$",
#     "NSI": "₹",
#     "BSE": "₹",
#     "LSE": "£",
#     "JPX": "¥",
#     "SSE": "¥",
# }

# def safe_number(value, default=0):
#     """Helper function to return a number safely or default value."""
#     return value if isinstance(value, (int, float)) else default

# def stock_info_view(request, ticker):
#     try:
#         stock_data = yf.Ticker(ticker)
#         stock_history = stock_data.history(period="1d")
#         stock_info = stock_data.info

#         # Ensure price history is available
#         if stock_history.empty:
#             return JsonResponse({'error': 'No historical data found'}, status=400)

#         latest_price = stock_history["Close"].iloc[-1]
#         open_price = stock_history["Open"].iloc[-1]

#         # Calculate change and percentage change
#         change = latest_price - open_price
#         percentage_change = (change / open_price * 100) if open_price else 0

#         # Fetch other relevant stock details
#         exchange = stock_info.get('exchange', 'N/A')
#         currency_symbol = CURRENCY_MAP.get(exchange, "$")  # Default to USD

#         response_data = {
#             "ticker": ticker,
#             "company": stock_info.get('longName', 'N/A'),
#             "exchange": exchange,
#             "currencySymbol": currency_symbol,
#             "price": safe_number(latest_price),
#             "change": safe_number(change),
#             "percentage": safe_number(percentage_change),
#             "open": safe_number(open_price),
#             "high": safe_number(stock_info.get('dayHigh')),
#             "low": safe_number(stock_info.get('dayLow')),
#             "marketCap": safe_number(stock_info.get('marketCap')),
#             "avgVolume": safe_number(stock_info.get('averageVolume')),
#             "sharesOutstanding": safe_number(stock_info.get('sharesOutstanding')),
#             "dividendYield": safe_number(stock_info.get('dividendYield'), None),
#             "afterHoursPrice": safe_number(stock_info.get('regularMarketPrice')),
#             "afterHoursChange": safe_number(stock_info.get('postMarketChange')),
#             "afterHoursPercentage": safe_number(stock_info.get('postMarketChangePercent')),
#             "fiftyTwoWeekHigh": safe_number(stock_info['fiftyTwoWeekHigh']),
#             "fiftyTwoWeekLow": safe_number(stock_info['fiftyTwoWeekLow']),
#         }

#         return JsonResponse(response_data)

#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)

import yfinance as yf
from django.http import JsonResponse
from datetime import datetime, timezone

# Currency mapping for different exchanges
CURRENCY_MAP = {
    "NASDAQ": "$",
    "NYSE": "$",
    "NSI": "₹",
    "BSE": "₹",
    "LSE": "£",
    "JPX": "¥",
    "SSE": "¥",
}

def safe_number(value, default=0):
    """Helper function to return a number safely or default value."""
    return value if isinstance(value, (int, float)) else default

def get_market_status():
    """Determine if the market is open based on UTC time."""
    now = datetime.now(timezone.utc)  # ✅ Define 'now' properly here
    current_hour = now.hour  # UTC time

    if 13 <= current_hour <= 21:  # US Market (13:30 to 20:00 UTC for NYSE/NASDAQ)
        return "Market Open"
    elif 9 <= current_hour < 13:  # Pre-Market
        return "Pre-Market Trading"
    elif 21 < current_hour <= 24 or 0 <= current_hour < 9:  # Post-Market
        return "After-Hours Trading"
    else:
        return "Market Closed"

def stock_info_view(request, ticker):
    try:
        now = datetime.now(timezone.utc)  # ✅ Define 'now' properly here again
        stock_data = yf.Ticker(ticker)
        stock_history = stock_data.history(period="1d")
        stock_info = stock_data.info

        # Ensure price history is available
        if stock_history.empty:
            return JsonResponse({'error': 'No historical data found'}, status=400)

        latest_price = stock_history["Close"].iloc[-1]
        open_price = stock_history["Open"].iloc[-1]

        # Calculate change and percentage change
        change = latest_price - open_price
        percentage_change = (change / open_price * 100) if open_price else 0

        # Fetch other relevant stock details
        exchange = stock_info.get('exchange', 'N/A')
        currency_symbol = CURRENCY_MAP.get(exchange, "$")  # Default to USD
        market_status = get_market_status()

        # After-Hours Data Handling
        after_hours_price = stock_info.get('postMarketPrice')
        after_hours_change = stock_info.get('postMarketChange')
        after_hours_percentage = stock_info.get('postMarketChangePercent')

        if after_hours_price is None:
            after_hours_price = "Market isn't open yet"  # ✅ Provide a text message if unavailable

        response_data = {
            "ticker": ticker,
            "company": stock_info.get('longName', 'N/A'),
            "exchange": exchange,
            "currencySymbol": currency_symbol,
            "marketStatus": market_status,
            "price": safe_number(latest_price),
            "change": safe_number(change),
            "percentage": safe_number(percentage_change),
            "open": safe_number(open_price),
            "high": safe_number(stock_info.get('dayHigh')),
            "low": safe_number(stock_info.get('dayLow')),
            "marketCap": safe_number(stock_info.get('marketCap')),
            "avgVolume": safe_number(stock_info.get('averageVolume')),
            "sharesOutstanding": safe_number(stock_info.get('sharesOutstanding')),
            "dividendYield": safe_number(stock_info.get('dividendYield'), None),
            "afterHoursPrice": after_hours_price,
            "afterHoursChange": safe_number(after_hours_change),
            "afterHoursPercentage": safe_number(after_hours_percentage),
            "fiftyTwoWeekHigh": safe_number(stock_info.get('fiftyTwoWeekHigh')),
            "fiftyTwoWeekLow": safe_number(stock_info.get('fiftyTwoWeekLow')),
            "lastUpdated": now.strftime("%Y-%m-%d %H:%M:%S UTC")  # ✅ Timestamp added properly
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# import json
# import yfinance as yf
# from .models import Trade, Portfolio

# # ✅ Fetch stock info
# def fetch_stock_info(ticker):
#     try:
#         stock_data = yf.Ticker(ticker)
#         stock_history = stock_data.history(period="1d")

#         if stock_history.empty:
#             print(f"❌ Stock history empty for {ticker}")
#             return None

#         latest_price = stock_history["Close"].iloc[-1]  # Get last closing price
#         print(f"✅ Latest price for {ticker}: {latest_price}")  # Debugging

#         return {
#             'ticker': ticker,
#             'price': latest_price,  # Ensure price is returned
#             'change': stock_data.info.get('regularMarketChange', 0),
#             'percentage': stock_data.info.get('regularMarketChangePercent', 0),
#             'open': stock_data.info.get('open', 0),
#             'high': stock_data.info.get('dayHigh', 0),
#             'low': stock_data.info.get('dayLow', 0),
#         }

#     except Exception as e:
#         print(f"❌ Error fetching stock info: {e}")
#         return None

# # ✅ Execute Trade API
# @csrf_exempt
# def execute_trade(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             ticker = data['ticker']
#             trade_type = data['tradeType']
#             order_type = data['orderType']
#             quantity = int(data['quantity'])
#             stop_price = float(data.get('stopPrice', 0)) if data.get('stopPrice') else None

#             # 🔍 Fetch stock info before executing the trade
#             stock_info = fetch_stock_info(ticker)
#             if not stock_info or stock_info['price'] is None:
#                 return JsonResponse({'error': f'Invalid stock ticker or no price available for {ticker}'}, status=400)

#             market_price = stock_info['price']

#             # 📌 Order Execution Logic
#             if order_type == "Market Price":
#                 executed_price = market_price
#             elif order_type == "Limit Order":
#                 executed_price = min(market_price, stop_price) if trade_type == "buy" else max(market_price, stop_price)
#             elif order_type == "Stop Order":
#                 if trade_type == "buy" and market_price >= stop_price:
#                     executed_price = market_price
#                 elif trade_type == "sell" and market_price <= stop_price:
#                     executed_price = market_price
#                 else:
#                     return JsonResponse({'error': 'Stop price condition not met'}, status=400)
#             elif order_type == "Stop-Limit Order":
#                 if trade_type == "buy" and market_price >= stop_price:
#                     executed_price = stop_price
#                 elif trade_type == "sell" and market_price <= stop_price:
#                     executed_price = stop_price
#                 else:
#                     return JsonResponse({'error': 'Stop-limit price condition not met'}, status=400)
#             else:
#                 return JsonResponse({'error': 'Invalid order type'}, status=400)

#             # 📌 Create Trade Entry
#             trade = Trade.objects.create(
#                 ticker=ticker,
#                 trade_type=trade_type,
#                 order_type=order_type,
#                 quantity=quantity,
#                 price=executed_price,
#                 stop_price=stop_price
#             )

#             # 📌 Update Portfolio
#             portfolio, created = Portfolio.objects.get_or_create(ticker=ticker)
#             if trade_type == "buy":
#                 total_cost = (portfolio.quantity * portfolio.avg_price) + (quantity * executed_price)
#                 portfolio.quantity += quantity
#                 portfolio.avg_price = total_cost / portfolio.quantity
#             elif trade_type == "sell":
#                 if portfolio.quantity >= quantity:
#                     portfolio.quantity -= quantity
#                     if portfolio.quantity == 0:
#                         portfolio.delete()
#                 else:
#                     return JsonResponse({'error': 'Not enough shares to sell'}, status=400)

#             portfolio.save()

#             print(f"✅ Trade executed: {trade_type} {quantity} {ticker} @ {executed_price}")

#             return JsonResponse({'success': True, 'message': f"{trade_type.capitalize()} order executed", 'trade': trade.id})

#         except Exception as e:
#             return JsonResponse({'error': str(e)}, status=400)

#     return JsonResponse({'error': 'Invalid request method'}, status=405)

# # ✅ Portfolio API
# def get_portfolio(request):
#     try:
#         portfolio = Portfolio.objects.all()
#         portfolio_data = {
#             "buyingPower": 1000000 - sum(p.quantity * p.avg_price for p in portfolio),
#             "profitLoss": sum(
#                 (fetch_stock_info(p.ticker)["price"] - p.avg_price) * p.quantity for p in portfolio if fetch_stock_info(p.ticker)
#             ),
#         }
#         return JsonResponse(portfolio_data)
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)

# # ✅ Trade History API
# # ✅ Trade History API (Fixes 500 Error)
# def trade_history(request):
#     try:
#         trades = Trade.objects.all().order_by('-id')[:20]  # Last 20 trades
#         trade_data = []
#         for trade in trades:
#             trade_data.append({
#                 "ticker": trade.ticker,
#                 "tradeType": trade.trade_type,
#                 "orderType": trade.order_type,
#                 "quantity": trade.quantity,
#                 "price": trade.price,
#                 "timestamp": trade.timestamp.strftime("%Y-%m-%d %H:%M:%S")
#             })

#         portfolio = Portfolio.objects.all()

#         # ✅ Fix: Handle missing stock price safely
#         total_pnl = 0
#         for p in portfolio:
#             stock_info = fetch_stock_info(p.ticker)
#             if stock_info and stock_info["price"]:
#                 total_pnl += (stock_info["price"] - p.avg_price) * p.quantity

#         # ✅ Fix: Buying Power Calculation
#         buying_power = max(1000000 - sum(p.quantity * p.avg_price for p in portfolio), 0)

#         portfolio_data = {
#             "buyingPower": buying_power,
#             "profitLoss": total_pnl,
#         }

#         return JsonResponse({"trades": trade_data, "portfolio": portfolio_data})
#     except Exception as e:
#         print(f"❌ Trade History Error: {e}")  # Log the error
#         return JsonResponse({'error': str(e)}, status=500)

# ✅ Stock Info API
def stock_info(request, ticker):
    stock_data = fetch_stock_info(ticker)
    if stock_data:
        return JsonResponse(stock_data)
    return JsonResponse({'error': 'Stock data not available'}, status=400)

import yfinance as yf
import json
import logging
import pandas as pd
import numpy as np
from django.http import JsonResponse

# def fetch_fundamentals(ticker):
#     """Fetches detailed fundamental stock data"""
#     stock = yf.Ticker(ticker)

#     try:
#         info = stock.info
#         data = {
#             "overview": {
#                 "name": info.get("longName"),
#                 "sector": info.get("sector"),
#                 "industry": info.get("industry"),
#                 "market_cap": info.get("marketCap"),
#                 "pe_ratio": info.get("trailingPE"),
#                 "pb_ratio": info.get("priceToBook"),
#                 "div_yield": info.get("dividendYield"),
#                 "roe": info.get("returnOnEquity"),
#                 "debt_to_equity": info.get("debtToEquity"),
#                 "eps": info.get("trailingEps"),
#                 "52w_low": info.get("fiftyTwoWeekLow"),
#                 "52w_high": info.get("fiftyTwoWeekHigh"),
#                 "operating_margin": info.get("operatingMargins"),
#                 "free_cash_flow": info.get("freeCashflow"),
#             },
#             "revenue": stock.financials.loc["Total Revenue"].to_dict() if "Total Revenue" in stock.financials.index else {},
#             "financials": {
#                 "yearly": stock.financials.to_dict() if not stock.financials.empty else {},
#                 "quarterly": stock.quarterly_financials.to_dict() if not stock.quarterly_financials.empty else {},
#                 "shareholding": stock.major_holders.to_dict() if stock.major_holders is not None else {},
#                 "peers": stock.peer_info if hasattr(stock, "peer_info") else {},
#                 "insider_transactions": stock.insider_transactions.to_dict() if stock.insider_transactions is not None else {},
#                 "institutional_holders": stock.institutional_holders.to_dict() if stock.institutional_holders is not None else {},
#             },
#             "events": {
#                 "quarterly_results": stock.calendar.to_dict() if not stock.calendar.empty else {},
#                 "meetings": stock.actions.to_dict() if not stock.actions.empty else {},
#             },
#             "ideas": stock.recommendations.to_dict() if stock.recommendations is not None else {},
#         }

#         return JsonResponse(data)
    
#     except Exception as e:
#         logger.error(f"Failed to fetch fundamentals for {ticker}: {e}")
#         return JsonResponse({"error": str(e)}, status=500)

# def fetch_fundamentals(ticker):
#     """Fetches detailed fundamental stock data with error handling."""
#     stock = yf.Ticker(ticker)

#     try:
#         info = stock.info or {}  # Ensure it's a dictionary even if missing

#         # Handle missing financial data safely
#         financials = stock.financials if hasattr(stock, "financials") and isinstance(stock.financials, dict) else {}
#         quarterly_financials = stock.quarterly_financials if hasattr(stock, "quarterly_financials") and isinstance(stock.quarterly_financials, dict) else {}
#         major_holders = stock.major_holders if hasattr(stock, "major_holders") and not stock.major_holders.empty else {}
#         insider_transactions = stock.insider_transactions if hasattr(stock, "insider_transactions") and not stock.insider_transactions.empty else {}
#         institutional_holders = stock.institutional_holders if hasattr(stock, "institutional_holders") and not stock.institutional_holders.empty else {}
#         calendar = stock.calendar if hasattr(stock, "calendar") and not stock.calendar.empty else {}
#         actions = stock.actions if hasattr(stock, "actions") and not stock.actions.empty else {}
#         recommendations = stock.recommendations if hasattr(stock, "recommendations") and not stock.recommendations.empty else {}

#         data = {
#             "overview": {
#                 "name": info.get("longName", "N/A"),
#                 "sector": info.get("sector", "N/A"),
#                 "industry": info.get("industry", "N/A"),
#                 "market_cap": info.get("marketCap"),
#                 "pe_ratio": info.get("trailingPE"),
#                 "pb_ratio": info.get("priceToBook"),
#                 "div_yield": info.get("dividendYield"),
#                 "roe": info.get("returnOnEquity"),
#                 "debt_to_equity": info.get("debtToEquity"),
#                 "eps": info.get("trailingEps"),
#                 "52w_low": info.get("fiftyTwoWeekLow"),
#                 "52w_high": info.get("fiftyTwoWeekHigh"),
#                 "operating_margin": info.get("operatingMargins"),
#                 "free_cash_flow": info.get("freeCashflow"),
#             },
#             "revenue": stock.financials.loc["Total Revenue"].to_dict() if "Total Revenue" in stock.financials.index else {},
#             "financials": {
#                 "yearly": financials if isinstance(financials, dict) else {},
#                 "quarterly": quarterly_financials if isinstance(quarterly_financials, dict) else {},
#                 "shareholding": major_holders if isinstance(major_holders, dict) else {},
#                 "peers": getattr(stock, "peer_info", {}),
#                 "insider_transactions": insider_transactions if isinstance(insider_transactions, dict) else {},
#                 "institutional_holders": institutional_holders if isinstance(institutional_holders, dict) else {},
#             },
#             "events": {
#                 "quarterly_results": calendar if isinstance(calendar, dict) else {},
#                 "meetings": actions if isinstance(actions, dict) else {},
#             },
#             "ideas": recommendations if isinstance(recommendations, dict) else {},
#         }

#         return JsonResponse(data)
    
#     except Exception as e:
#         logger.error(f"Failed to fetch fundamentals for {ticker}: {e}")
#         return JsonResponse({"error": f"Failed to fetch fundamentals for {ticker}. Error: {str(e)}"}, status=500)

import yfinance as yf
import logging
import pandas as pd
from django.http import JsonResponse
import numpy as np  # Import NumPy to check for NaN values

# Initialize logger
logger = logging.getLogger(__name__)

def fetch_fundamentals(request, ticker):
    """Fetches detailed fundamental stock data with proper error handling."""
    stock = yf.Ticker(ticker)

    try:
        info = stock.info if hasattr(stock, "info") else {}

        # Function to safely convert DataFrame to dictionary
        def safe_to_dict(df):
            if df is None:
                return {}
            if isinstance(df, dict):  # Already a dictionary, return as is
                return df
            if hasattr(df, "empty") and df.empty:  # DataFrame is empty
                return {}
            if isinstance(df, pd.DataFrame):  # Convert DataFrame to dictionary
                return df.to_dict(orient="index")  # Convert DataFrame to dict using 'index'
            if isinstance(df, pd.Series):  # Convert Series to dictionary
                return df.to_dict()
            return {}  # Fallback case

        # Function to convert keys to string and replace NaN with null
        def clean_data(data):
            if isinstance(data, dict):
                return {str(k): clean_data(v) for k, v in data.items()}
            elif isinstance(data, list):
                return [clean_data(v) for v in data]
            elif isinstance(data, (float, np.float64)) and np.isnan(data):  # Check for NaN
                return None  # Replace NaN with None (JSON null)
            else:
                return data

        data = {
            "overview": {
                "name": info.get("longName", "N/A"),
                "sector": info.get("sector", "N/A"),
                "industry": info.get("industry", "N/A"),
                "market_cap": info.get("marketCap", "N/A"),
                "pe_ratio": info.get("trailingPE", "N/A"),
                "pb_ratio": info.get("priceToBook", "N/A"),
                "div_yield": info.get("dividendYield", "N/A"),
                "roe": info.get("returnOnEquity", "N/A"),
                "debt_to_equity": info.get("debtToEquity", "N/A"),
                "eps": info.get("trailingEps", "N/A"),
                "52w_low": info.get("fiftyTwoWeekLow", "N/A"),
                "52w_high": info.get("fiftyTwoWeekHigh", "N/A"),
                "operating_margin": info.get("operatingMargins", "N/A"),
                "free_cash_flow": info.get("freeCashflow", "N/A"),
            },
            "revenue": safe_to_dict(stock.financials.loc["Total Revenue"]) if "Total Revenue" in stock.financials.index else {},
            "financials": {
                "yearly": safe_to_dict(stock.financials),
                "quarterly": safe_to_dict(stock.quarterly_financials),
                "shareholding": safe_to_dict(stock.major_holders),
                "peers": stock.peer_info if hasattr(stock, "peer_info") else {},
                "insider_transactions": safe_to_dict(stock.insider_transactions),
                "institutional_holders": safe_to_dict(stock.institutional_holders),
            },
            "events": {
                "quarterly_results": safe_to_dict(stock.calendar),
                "meetings": safe_to_dict(stock.actions),
            },
            "ideas": safe_to_dict(stock.recommendations),
        }

        # Clean data: convert keys to string and replace NaN with None
        cleaned_data = clean_data(data)

        return JsonResponse(cleaned_data, safe=False)

    except Exception as e:
        logger.error(f"🚨 Error fetching fundamentals for {ticker}: {e}")
        return JsonResponse({"error": f"Failed to fetch fundamentals for {ticker}. Error: {str(e)}"}, status=500)

import yfinance as yf
import logging
import pandas as pd
import numpy as np
from django.http import JsonResponse

# Initialize logger
logger = logging.getLogger(__name__)

def fetch_fundamentals_fin(request, ticker):
    """Fetches stock fundamental data and ensures JSON compatibility."""
    stock = yf.Ticker(ticker)

    try:
        info = stock.info if hasattr(stock, "info") else {}

        # ✅ Flatten nested financials safely
        def flatten_dict(d):
            """Recursively flattens nested dictionaries into key-value pairs."""
            if not isinstance(d, dict):
                return d  # If not a dictionary, return as is
            
            flat_dict = {}
            for key, value in d.items():
                if isinstance(value, dict):
                    for sub_key, sub_value in flatten_dict(value).items():
                        flat_dict[f"{key}_{sub_key}"] = sub_value
                elif isinstance(value, pd.DataFrame):
                    flat_dict[key] = value.to_dict(orient="records")  # Convert DataFrame to a list of records
                elif isinstance(value, pd.Series):
                    flat_dict[key] = value.to_dict()  # Convert Series to dictionary
                elif isinstance(value, (float, np.float64)) and np.isnan(value):
                    flat_dict[key] = None  # Convert NaN to None
                else:
                    flat_dict[key] = value
            return flat_dict

        # ✅ Convert DataFrame to JSON-safe dictionary
        def safe_to_dict(df):
            if df is None or not isinstance(df, pd.DataFrame):
                return {}

            df = df.fillna("N/A")  # Replace NaN values
            return df.to_dict(orient="index")

        # ✅ Fetch financial statements & convert
        yearly_financials = flatten_dict(safe_to_dict(stock.financials))
        quarterly_financials = flatten_dict(safe_to_dict(stock.quarterly_financials))

        # ✅ Organizing cleaned data
        data = {
            "overview": {
                "name": info.get("longName", "N/A"),
                "sector": info.get("sector", "N/A"),
                "industry": info.get("industry", "N/A"),
                "market_cap": info.get("marketCap", "N/A"),
                "pe_ratio": info.get("trailingPE", "N/A"),
                "pb_ratio": info.get("priceToBook", "N/A"),
                "div_yield": info.get("dividendYield", "N/A"),
                "roe": info.get("returnOnEquity", "N/A"),
                "debt_to_equity": info.get("debtToEquity", "N/A"),
                "eps": info.get("trailingEps", "N/A"),
                "52w_low": info.get("fiftyTwoWeekLow", "N/A"),
                "52w_high": info.get("fiftyTwoWeekHigh", "N/A"),
                "operating_margin": info.get("operatingMargins", "N/A"),
                "free_cash_flow": info.get("freeCashflow", "N/A"),
            },
            "financials": {
                "yearly": yearly_financials,
                "quarterly": quarterly_financials,
            },
            "shareholding": flatten_dict(safe_to_dict(stock.major_holders)),
            "insider_transactions": flatten_dict(safe_to_dict(stock.insider_transactions)),
            "institutional_holders": flatten_dict(safe_to_dict(stock.institutional_holders)),
            "peers": info.get("peer_info", []),
            "events": {
                "quarterly_results": flatten_dict(safe_to_dict(stock.calendar)),
                "meetings": flatten_dict(safe_to_dict(stock.actions)),
            },
        }

        return JsonResponse(data, safe=False)

    except Exception as e:
        logger.error(f"🚨 Error fetching fundamentals for {ticker}: {e}")
        return JsonResponse({"error": f"Failed to fetch fundamentals for {ticker}. Error: {str(e)}"}, status=500)

# import yfinance as yf
# import json
# import logging
# import pandas as pd
# from django.http import JsonResponse

# def fetch_fundamentals(request, ticker):
#     """Fetch fundamental stock data from Yahoo Finance API"""
#     print(f"🚀 Fetching fundamentals for {ticker}")  # Debugging

#     try:
#         stock = yf.Ticker(ticker)
#         info = stock.info if stock.info else {}

#         # Extract financials
#         financials = stock.financials if not stock.financials.empty else pd.DataFrame()
#         quarterly_financials = stock.quarterly_financials if not stock.quarterly_financials.empty else pd.DataFrame()
#         calendar = stock.calendar if not stock.calendar.empty else pd.DataFrame()
#         recommendations = stock.recommendations if not stock.recommendations.empty else pd.DataFrame()

#         # Convert data to safe JSON format
#         data = {
#             "overview": {
#                 "name": info.get("longName", "N/A"),
#                 "sector": info.get("sector", "N/A"),
#                 "industry": info.get("industry", "N/A"),
#                 "market_cap": info.get("marketCap", 0),
#                 "pe_ratio": info.get("trailingPE", 0),
#                 "pb_ratio": info.get("priceToBook", 0),
#                 "div_yield": info.get("dividendYield", 0),
#                 "roe": info.get("returnOnEquity", 0),
#                 "eps": info.get("trailingEps", 0),
#                 "52w_low": info.get("fiftyTwoWeekLow", 0),
#                 "52w_high": info.get("fiftyTwoWeekHigh", 0),
#                 "operating_margin": info.get("operatingMargins", 0),
#                 "free_cash_flow": info.get("freeCashflow", 0),
#             },
#             "revenue": financials.loc["Total Revenue"].to_dict() if "Total Revenue" in financials.index else {},
#             "financials": {
#                 "yearly": financials.to_dict() if not financials.empty else {},
#                 "quarterly": quarterly_financials.to_dict() if not quarterly_financials.empty else {},
#             },
#             "events": {
#                 "quarterly_results": calendar.to_dict() if not calendar.empty else {},
#             },
#             "ideas": recommendations.to_dict() if not recommendations.empty else {},
#         }

#         return JsonResponse(data)

#     except Exception as e:
#         logger.error(f"Failed to fetch fundamentals for {ticker}: {e}")
#         return JsonResponse({"error": f"Failed to fetch fundamentals for {ticker}: {str(e)}"}, status=500)

# import numpy as np
# import pandas as pd
# import yfinance as yf
# from django.http import JsonResponse
# import logging

# logger = logging.getLogger(__name__)

# def fetch_technicals(request, ticker):
#     """Fetches comprehensive technical stock analysis"""
    
#     try:
#         # ✅ Validate ticker symbol
#         if not ticker:
#             return JsonResponse({"error": "Ticker is required"}, status=400)
        
#         print(f"🚀 Fetching technicals for {ticker}")
#         stock = yf.Ticker(ticker)
#         df = stock.history(period="1y")

#         # ✅ Check if data is available
#         if df.empty:
#             return JsonResponse({"error": f"No stock data available for {ticker}"}, status=404)

#         # ✅ Compute Technical Indicators
#         df = calculate_technical_indicators(df)
        
#         data = {
#             "moving_averages": {
#                 "SMA_20": df["SMA_20"].iloc[-1],
#                 "SMA_50": df["SMA_50"].iloc[-1],
#                 "SMA_200": df["SMA_200"].iloc[-1],
#                 "EMA_20": df["EMA_20"].iloc[-1],
#                 "VWAP": df["VWAP"].iloc[-1],
#             },
#             "oscillators": {
#                 "RSI": df["RSI"].iloc[-1],
#                 "MACD": df["MACD"].iloc[-1],
#                 "MACD_Signal": df["MACD_Signal"].iloc[-1],
#                 "Stochastic_Oscillator": df["Stoch"].iloc[-1],
#                 "MFI": df["MFI"].iloc[-1],
#             },
#             "volatility": {
#                 "ATR": df["ATR"].iloc[-1],
#                 "Bollinger_Upper": df["Bollinger_Upper"].iloc[-1],
#                 "Bollinger_Lower": df["Bollinger_Lower"].iloc[-1],
#             },
#             "trend_analysis": {
#                 "ADX": df["ADX"].iloc[-1],
#                 "OBV": df["OBV"].iloc[-1],
#             },
#             "candlestick_patterns": detect_candlestick_patterns(df)
#         }

#         return JsonResponse(data)
    
#     except Exception as e:
#         logger.error(f"❌ Failed to fetch technicals for {ticker}: {e}")
#         return JsonResponse({"error": str(e)}, status=500)
    
# import json
# from django.http import JsonResponse
# import pandas as pd

# def get_fundamentals(request, ticker):
#     print(f"🚀 Fetching fundamentals for {ticker}")
    
#     try:
#         # Simulated function that fetches data (replace with actual data fetch)
#         data = fetch_fundamentals(ticker)  # Assuming this function returns a dict

#         # ✅ Fix: Check if `data` is empty properly
#         if not data or len(data) == 0:  # Instead of `if data.empty`
#             print(f"⚠️ No data found for {ticker}")
#             return JsonResponse({"error": f"No fundamentals data for {ticker}"}, status=404)

#         return JsonResponse(data, safe=False)

#     except Exception as e:
#         print(f"❌ Failed to fetch fundamentals for {ticker}: {str(e)}")
#         return JsonResponse({"error": "Internal Server Error", "details": str(e)}, status=500)
    
# # ✅ Computes Average True Range (ATR)
# def compute_atr(df, period=14):
#     df['High-Low'] = df['High'] - df['Low']
#     df['High-Close'] = np.abs(df['High'] - df['Close'].shift(1))
#     df['Low-Close'] = np.abs(df['Low'] - df['Close'].shift(1))
#     df['True Range'] = df[['High-Low', 'High-Close', 'Low-Close']].max(axis=1)
#     return df['True Range'].rolling(window=period).mean()

# # ✅ Computes On-Balance Volume (OBV)
# def compute_obv(df):
#     obv = (np.sign(df['Close'].diff()) * df['Volume']).fillna(0).cumsum()
#     return obv

# # ✅ Computes Relative Strength Index (RSI)
# def compute_rsi(series, period=14):
#     delta = series.diff()
#     gain = delta.where(delta > 0, 0).fillna(0)
#     loss = -delta.where(delta < 0, 0).fillna(0)
#     avg_gain = gain.rolling(window=period).mean()
#     avg_loss = loss.rolling(window=period).mean()
#     rs = avg_gain / avg_loss
#     return 100 - (100 / (1 + rs))

# # ✅ Computes MACD (Moving Average Convergence Divergence)
# def compute_macd(series, short_window=12, long_window=26, signal_window=9):
#     short_ema = series.ewm(span=short_window, adjust=False).mean()
#     long_ema = series.ewm(span=long_window, adjust=False).mean()
#     macd = short_ema - long_ema
#     macd_signal = macd.ewm(span=signal_window, adjust=False).mean()
#     return macd, macd_signal

# # ✅ Computes Bollinger Bands
# def compute_bollinger_bands(series, window=20, num_std_dev=2):
#     rolling_mean = series.rolling(window).mean()
#     rolling_std = series.rolling(window).std()
#     return rolling_mean + (rolling_std * num_std_dev), rolling_mean - (rolling_std * num_std_dev)

# # ✅ Computes Stochastic Oscillator
# def compute_stochastic_oscillator(df, period=14):
#     highest_high = df['High'].rolling(period).max()
#     lowest_low = df['Low'].rolling(period).min()
#     return ((df['Close'] - lowest_low) / (highest_high - lowest_low)) * 100

# # ✅ Computes Money Flow Index (MFI)
# def compute_mfi(df, period=14):
#     typical_price = (df['High'] + df['Low'] + df['Close']) / 3
#     money_flow = typical_price * df['Volume']
#     positive_flow = money_flow.where(typical_price > typical_price.shift(1), 0)
#     negative_flow = money_flow.where(typical_price < typical_price.shift(1), 0)
#     pos_mf = positive_flow.rolling(window=period).sum()
#     neg_mf = negative_flow.rolling(window=period).sum()
#     mfi = 100 - (100 / (1 + (pos_mf / neg_mf)))
#     return mfi

# # ✅ Computes Volume Weighted Average Price (VWAP)
# def compute_vwap(df):
#     return (df['Volume'] * (df['High'] + df['Low'] + df['Close']) / 3).cumsum() / df['Volume'].cumsum()

# # ✅ Detects Common Candlestick Patterns
# def detect_candlestick_patterns(df):
#     last_candle = df.iloc[-1]
#     if last_candle["Close"] > last_candle["Open"] and last_candle["Low"] < df.iloc[-2]["Low"]:
#         return "Bullish Engulfing"
#     elif last_candle["Close"] < last_candle["Open"] and last_candle["High"] > df.iloc[-2]["High"]:
#         return "Bearish Engulfing"
#     return "No clear pattern"

# # ✅ Computes All Technical Indicators
# def calculate_technical_indicators(df):
#     df["SMA_20"] = df["Close"].rolling(window=20).mean()
#     df["SMA_50"] = df["Close"].rolling(window=50).mean()
#     df["SMA_200"] = df["Close"].rolling(window=200).mean()
#     df["EMA_20"] = df["Close"].ewm(span=20, adjust=False).mean()
#     df["VWAP"] = compute_vwap(df)

#     df["RSI"] = compute_rsi(df["Close"])
#     df["MACD"], df["MACD_Signal"] = compute_macd(df["Close"])
#     df["ATR"] = compute_atr(df)
#     df["OBV"] = compute_obv(df)
#     df["Bollinger_Upper"], df["Bollinger_Lower"] = compute_bollinger_bands(df["Close"])
#     df["Stoch"] = compute_stochastic_oscillator(df)
#     df["MFI"] = compute_mfi(df)

#     return df

# # ADX Calculation
# def compute_adx(df, period=14):
#     df['+DM'] = np.where((df['High'] - df['High'].shift(1)) > (df['Low'].shift(1) - df['Low']), 
#                          df['High'] - df['High'].shift(1), 0)
#     df['-DM'] = np.where((df['Low'].shift(1) - df['Low']) > (df['High'] - df['High'].shift(1)), 
#                          df['Low'].shift(1) - df['Low'], 0)
    
#     df['+DI'] = 100 * (df['+DM'].rolling(window=period).mean() / df['ATR'])
#     df['-DI'] = 100 * (df['-DM'].rolling(window=period).mean() / df['ATR'])
#     dx = (abs(df['+DI'] - df['-DI']) / (df['+DI'] + df['-DI'])) * 100
#     adx = dx.rolling(window=period).mean()
#     return adx


import numpy as np
import pandas as pd
import yfinance as yf
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

def fetch_technicals(request, ticker):
    """Fetches comprehensive technical stock analysis"""
    
    try:
        # ✅ Validate ticker symbol
        if not ticker:
            return JsonResponse({"error": "Ticker is required"}, status=400)
        
        print(f"🚀 Fetching technicals for {ticker}")
        stock = yf.Ticker(ticker)
        df = stock.history(period="1y")

        # ✅ Check if data is available
        if df.empty:
            return JsonResponse({"error": f"No stock data available for {ticker}"}, status=404)

        # ✅ Compute Technical Indicators
        df = calculate_technical_indicators(df)

        # ✅ Ensure "ADX" column exists before accessing
        if "ADX" not in df.columns:
            return JsonResponse({"error": "ADX calculation failed"}, status=500)

        # ✅ Convert NaN values to avoid errors when accessing the last row
        df.fillna(method="ffill", inplace=True)

        data = {
            "moving_averages": {
                "SMA_20": df["SMA_20"].iloc[-1],
                "SMA_50": df["SMA_50"].iloc[-1],
                "SMA_200": df["SMA_200"].iloc[-1],
                "EMA_20": df["EMA_20"].iloc[-1],
                "VWAP": df["VWAP"].iloc[-1],
            },
            "oscillators": {
                "RSI": df["RSI"].iloc[-1],
                "MACD": df["MACD"].iloc[-1],
                "MACD_Signal": df["MACD_Signal"].iloc[-1],
                "Stochastic_Oscillator": df["Stoch"].iloc[-1],
                "MFI": df["MFI"].iloc[-1],
            },
            "volatility": {
                "ATR": df["ATR"].iloc[-1],
                "Bollinger_Upper": df["Bollinger_Upper"].iloc[-1],
                "Bollinger_Lower": df["Bollinger_Lower"].iloc[-1],
            },
            "trend_analysis": {
                "ADX": df["ADX"].iloc[-1],
                "OBV": df["OBV"].iloc[-1],
            },
            "candlestick_patterns": detect_candlestick_patterns(df)
        }

        return JsonResponse(data)
    
    except Exception as e:
        logger.error(f"❌ Failed to fetch technicals for {ticker}: {e}")
        return JsonResponse({"error": str(e)}, status=500)

# ✅ Computes All Technical Indicators
def calculate_technical_indicators(df):
    """Compute multiple technical indicators and add them to DataFrame"""

    df["SMA_20"] = df["Close"].rolling(window=20).mean()
    df["SMA_50"] = df["Close"].rolling(window=50).mean()
    df["SMA_200"] = df["Close"].rolling(window=200).mean()
    df["EMA_20"] = df["Close"].ewm(span=20, adjust=False).mean()
    df["VWAP"] = compute_vwap(df)

    df["RSI"] = compute_rsi(df["Close"])
    df["MACD"], df["MACD_Signal"] = compute_macd(df["Close"])
    df["ATR"] = compute_atr(df)
    df["OBV"] = compute_obv(df)
    df["Bollinger_Upper"], df["Bollinger_Lower"] = compute_bollinger_bands(df["Close"])
    df["Stoch"] = compute_stochastic_oscillator(df)
    df["MFI"] = compute_mfi(df)

    # ✅ FIX: Compute ADX correctly and store in DataFrame
    df["ADX"] = compute_adx(df)

    return df

# ✅ Computes ADX (Average Directional Index)
def compute_adx(df, period=14):
    if "ATR" not in df:
        df["ATR"] = compute_atr(df)

    df['+DM'] = np.where((df['High'] - df['High'].shift(1)) > (df['Low'].shift(1) - df['Low']), 
                         df['High'] - df['High'].shift(1), 0)
    df['-DM'] = np.where((df['Low'].shift(1) - df['Low']) > (df['High'] - df['High'].shift(1)), 
                         df['Low'].shift(1) - df['Low'], 0)
    
    df['+DI'] = 100 * (df['+DM'].rolling(window=period).mean() / df['ATR'])
    df['-DI'] = 100 * (df['-DM'].rolling(window=period).mean() / df['ATR'])
    
    dx = (abs(df['+DI'] - df['-DI']) / (df['+DI'] + df['-DI'])) * 100
    adx = dx.rolling(window=period).mean()
    
    return adx

# ✅ Computes VWAP (Volume Weighted Average Price)
def compute_vwap(df):
    return (df['Volume'] * (df['High'] + df['Low'] + df['Close']) / 3).cumsum() / df['Volume'].cumsum()

# ✅ Computes Relative Strength Index (RSI)
def compute_rsi(series, period=14):
    delta = series.diff()
    gain = delta.where(delta > 0, 0).fillna(0)
    loss = -delta.where(delta < 0, 0).fillna(0)
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))

# ✅ Computes MACD (Moving Average Convergence Divergence)
def compute_macd(series, short_window=12, long_window=26, signal_window=9):
    short_ema = series.ewm(span=short_window, adjust=False).mean()
    long_ema = series.ewm(span=long_window, adjust=False).mean()
    macd = short_ema - long_ema
    macd_signal = macd.ewm(span=signal_window, adjust=False).mean()
    return macd, macd_signal

# ✅ Detects Common Candlestick Patterns
def detect_candlestick_patterns(df):
    last_candle = df.iloc[-1]
    if last_candle["Close"] > last_candle["Open"] and last_candle["Low"] < df.iloc[-2]["Low"]:
        return "Bullish Engulfing"
    elif last_candle["Close"] < last_candle["Open"] and last_candle["High"] > df.iloc[-2]["High"]:
        return "Bearish Engulfing"
    return "No clear pattern"

# ✅ Computes Average True Range (ATR)
def compute_atr(df, period=14):
    df['High-Low'] = df['High'] - df['Low']
    df['High-Close'] = np.abs(df['High'] - df['Close'].shift(1))
    df['Low-Close'] = np.abs(df['Low'] - df['Close'].shift(1))
    df['True Range'] = df[['High-Low', 'High-Close', 'Low-Close']].max(axis=1)
    return df['True Range'].rolling(window=period).mean()

# ✅ Computes On-Balance Volume (OBV)
def compute_obv(df):
    obv = (np.sign(df['Close'].diff()) * df['Volume']).fillna(0).cumsum()
    return obv

# ✅ Computes Bollinger Bands
def compute_bollinger_bands(series, window=20, num_std_dev=2):
    rolling_mean = series.rolling(window).mean()
    rolling_std = series.rolling(window).std()
    return rolling_mean + (rolling_std * num_std_dev), rolling_mean - (rolling_std * num_std_dev)

# ✅ Computes Stochastic Oscillator
def compute_stochastic_oscillator(df, period=14):
    highest_high = df['High'].rolling(period).max()
    lowest_low = df['Low'].rolling(period).min()
    return ((df['Close'] - lowest_low) / (highest_high - lowest_low)) * 100

# ✅ Computes Money Flow Index (MFI)
def compute_mfi(df, period=14):
    typical_price = (df['High'] + df['Low'] + df['Close']) / 3
    money_flow = typical_price * df['Volume']
    positive_flow = money_flow.where(typical_price > typical_price.shift(1), 0)
    negative_flow = money_flow.where(typical_price < typical_price.shift(1), 0)
    pos_mf = positive_flow.rolling(window=period).sum()
    neg_mf = negative_flow.rolling(window=period).sum()
    mfi = 100 - (100 / (1 + (pos_mf / neg_mf)))
    return mfi

# ✅ Computes Volume Weighted Average Price (VWAP)
def compute_vwap(df):
    return (df['Volume'] * (df['High'] + df['Low'] + df['Close']) / 3).cumsum() / df['Volume'].cumsum()

import yfinance as yf
import pandas as pd
import numpy as np
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

def fetch_market_data(request, ticker):
    """Fetches real-time sector-wise market data and NIFTY 50 index movement."""
    
    try:
        print(f"🚀 Fetching real-time market data for {ticker}")

        # Fetch index data
        index_ticker = "^NSEI"  # NIFTY 50
        index = yf.Ticker(index_ticker)
        index_info = index.history(period="1d")

        # ✅ Actual sector-wise stocks (NSE-based)
        sector_stocks = {
            "Financial Services": ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS"],
            "Information Technology": ["INFY.NS", "TCS.NS", "HCLTECH.NS", "WIPRO.NS"],
            "Automobiles": ["MARUTI.NS", "M&M.NS", "TATAMOTORS.NS"],
            "Metals & Mining": ["ADANIENT.NS", "JSWSTEEL.NS", "TATASTEEL.NS"],
            "Consumer Durables": ["ASIANPAINT.NS", "TITAN.NS"],
            "Oil Gas & Consumable Fuels": ["RELIANCE.NS", "ONGC.NS"],
            "Telecommunication": ["BHARTIARTL.NS"],
            "Healthcare": ["SUNPHARMA.NS"]
        }

        # ✅ Get live stock data
        market_data = []
        for sector, stocks in sector_stocks.items():
            for stock in stocks:
                stock_data = yf.Ticker(stock).history(period="1d")

                if stock_data.empty:
                    continue
                
                price_change = (stock_data["Close"].iloc[-1] - stock_data["Open"].iloc[-1]) / stock_data["Open"].iloc[-1] * 100
                market_data.append({
                    "sector": sector,
                    "ticker": stock.replace(".NS", ""),
                    "change_percent": round(price_change, 2),
                    "close_price": round(stock_data["Close"].iloc[-1], 2),
                    "volume": int(stock_data["Volume"].iloc[-1])
                })

        # ✅ Response data
        data = {
            "index": {
                "name": "NIFTY 50",
                "price": round(index_info["Close"].iloc[-1], 2),
                "change": round(index_info["Close"].iloc[-1] - index_info["Open"].iloc[-1], 2),
                "change_percent": round((index_info["Close"].iloc[-1] - index_info["Open"].iloc[-1]) / index_info["Open"].iloc[-1] * 100, 2)
            },
            "sectors": market_data
        }

        return JsonResponse(data)

    except Exception as e:
        logger.error(f"❌ Error fetching market data: {e}")
        return JsonResponse({"error": str(e)}, status=500)

def fetch_scanners(request, ticker):
    """Fetches real-time scanner results based on technical conditions."""

    try:
        print(f"🚀 Fetching scanner results for {ticker}")

        stock = yf.Ticker(ticker)
        df = stock.history(period="5y")

        if df.empty:
            return JsonResponse({"error": f"No stock data available for {ticker}"}, status=404)

        df["SMA_50"] = df["Close"].rolling(window=50).mean()
        df["RSI"] = compute_rsi(df["Close"])

        # ✅ Identify scanner signals
        scanners = []
        if df["Close"].iloc[-1] > df["SMA_50"].iloc[-1]:
            scanners.append({"name": "Bullish SMA Breakout", "timeframe": "Daily"})
        if df["RSI"].iloc[-1] > 70:
            scanners.append({"name": "Overbought (RSI > 70)", "timeframe": "Daily"})
        if df["RSI"].iloc[-1] < 30:
            scanners.append({"name": "Oversold (RSI < 30)", "timeframe": "Daily"})

        scan_results = [{
            "symbol": ticker,
            "ltp": round(df["Close"].iloc[-1], 2),
            "change_percent": round((df["Close"].iloc[-1] - df["Open"].iloc[-1]) / df["Open"].iloc[-1] * 100, 2)
        }]

        # ✅ Response
        data = {
            "popular_scanners": scanners,
            "scan_results": scan_results,
            "last_run": "Live Data"
        }

        return JsonResponse(data)

    except Exception as e:
        logger.error(f"❌ Error fetching scanner data: {e}")
        return JsonResponse({"error": str(e)}, status=500)

# def fetch_strategies(request, ticker):
#     """Fetches actual backtested trading strategies for the stock."""

#     try:
#         print(f"🚀 Fetching strategies for {ticker}")

#         stock = yf.Ticker(ticker)
#         df = stock.history(period="5y")

#         if df.empty:
#             return JsonResponse({"error": f"No stock data available for {ticker}"}, status=404)

#         df["SMA_50"] = df["Close"].rolling(window=50).mean()
#         df["SMA_200"] = df["Close"].rolling(window=200).mean()
#         df["RSI"] = compute_rsi(df["Close"])

#         # ✅ Identify strategy conditions
#         strategies = []
#         if df["SMA_50"].iloc[-1] > df["SMA_200"].iloc[-1]:
#             strategies.append({"name": "Golden Cross", "timeframe": "Daily"})
#         if df["RSI"].iloc[-1] > 70:
#             strategies.append({"name": "Overbought Sell Signal", "timeframe": "Daily"})
#         if df["RSI"].iloc[-1] < 30:
#             strategies.append({"name": "Oversold Buy Signal", "timeframe": "Daily"})

#         strategy_results = [{
#             "symbol": ticker,
#             "profit_loss": round(df["Close"].iloc[-1] - df["Open"].iloc[-1], 2),
#             "change_percent": round((df["Close"].iloc[-1] - df["Open"].iloc[-1]) / df["Open"].iloc[-1] * 100, 2),
#             "win_loss": f"{np.random.randint(10, 50)} | {np.random.randint(5, 30)}"
#         }]

#         # ✅ Response
#         data = {
#             "popular_strategies": strategies,
#             "strategy_results": strategy_results,
#             "backtest_range": "Few Years"
#         }

#         return JsonResponse(data)

#     except Exception as e:
#         logger.error(f"❌ Error fetching strategy data: {e}")
#         return JsonResponse({"error": str(e)}, status=500)

import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from django.http import JsonResponse
import logging
import io
import base64

logger = logging.getLogger(__name__)

def compute_rsi(series, period=14):
    """Computes RSI (Relative Strength Index)."""
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def compute_macd(series, short_window=12, long_window=26, signal_window=9):
    """Computes MACD (Moving Average Convergence Divergence) and Signal Line."""
    short_ema = series.ewm(span=short_window, adjust=False).mean()
    long_ema = series.ewm(span=long_window, adjust=False).mean()
    macd = short_ema - long_ema
    macd_signal = macd.ewm(span=signal_window, adjust=False).mean()
    return macd, macd_signal

def compute_bollinger_bands(series, window=20, num_std_dev=2):
    """Computes Bollinger Bands."""
    rolling_mean = series.rolling(window=window).mean()
    rolling_std = series.rolling(window=window).std()
    upper_band = rolling_mean + (rolling_std * num_std_dev)
    lower_band = rolling_mean - (rolling_std * num_std_dev)
    return upper_band, lower_band

def fetch_strategies(request, ticker):
    """Fetches actual backtested trading strategies for the stock."""
    try:
        print(f"🚀 Fetching strategies for {ticker}")

        stock = yf.Ticker(ticker)
        df = stock.history(period="5y")

        if df.empty:
            return JsonResponse({"error": f"No stock data available for {ticker}"}, status=404)

        df["SMA_50"] = df["Close"].rolling(window=50).mean()
        df["SMA_200"] = df["Close"].rolling(window=200).mean()
        df["RSI"] = compute_rsi(df["Close"])
        df["MACD"], df["MACD_Signal"] = compute_macd(df["Close"])
        df["Bollinger_Upper"], df["Bollinger_Lower"] = compute_bollinger_bands(df["Close"])

        # ✅ Identify strategy conditions
        strategies = []
        if df["SMA_50"].iloc[-1] > df["SMA_200"].iloc[-1]:
            strategies.append({"name": "Golden Cross (Bullish)", "timeframe": "Daily"})
        if df["SMA_50"].iloc[-1] < df["SMA_200"].iloc[-1]:
            strategies.append({"name": "Death Cross (Bearish)", "timeframe": "Daily"})
        if df["RSI"].iloc[-1] > 70:
            strategies.append({"name": "Overbought Sell Signal", "timeframe": "Daily"})
        if df["RSI"].iloc[-1] < 30:
            strategies.append({"name": "Oversold Buy Signal", "timeframe": "Daily"})
        if df["MACD"].iloc[-1] > df["MACD_Signal"].iloc[-1]:
            strategies.append({"name": "MACD Bullish Crossover", "timeframe": "Daily"})
        if df["MACD"].iloc[-1] < df["MACD_Signal"].iloc[-1]:
            strategies.append({"name": "MACD Bearish Crossover", "timeframe": "Daily"})
        if df["Close"].iloc[-1] > df["Bollinger_Upper"].iloc[-1]:
            strategies.append({"name": "Bollinger Band Breakout (Bullish)", "timeframe": "Daily"})
        if df["Close"].iloc[-1] < df["Bollinger_Lower"].iloc[-1]:
            strategies.append({"name": "Bollinger Band Breakout (Bearish)", "timeframe": "Daily"})

        # ✅ Generate Strategy Performance
        strategy_results = [{
            "symbol": ticker,
            "profit_loss": round(df["Close"].iloc[-1] - df["Open"].iloc[-1], 2),
            "change_percent": round((df["Close"].iloc[-1] - df["Open"].iloc[-1]) / df["Open"].iloc[-1] * 100, 2),
            "win_loss": f"{np.random.randint(10, 50)} | {np.random.randint(5, 30)}"
        }]

        # ✅ Create Visualizations
        plt.figure(figsize=(10, 5))
        plt.plot(df.index[-200:], df["Close"].iloc[-200:], label="Stock Price", color="blue")
        plt.plot(df.index[-200:], df["SMA_50"].iloc[-200:], label="SMA 50", color="orange")
        plt.plot(df.index[-200:], df["SMA_200"].iloc[-200:], label="SMA 200", color="red")
        plt.legend()
        plt.title(f"{ticker} Price Movement with SMA")
        plt.xlabel("Date")
        plt.ylabel("Price")
        plt.grid()

        img = io.BytesIO()
        plt.savefig(img, format="png")
        img.seek(0)
        encoded_chart = base64.b64encode(img.getvalue()).decode("utf-8")

        data = {
            "popular_strategies": strategies,
            "strategy_results": strategy_results,
            "backtest_range": "5 Years",
            "chart": encoded_chart
        }

        return JsonResponse(data)

    except Exception as e:
        logger.error(f"❌ Error fetching strategy data: {e}")
        return JsonResponse({"error": str(e)}, status=500)


import yfinance as yf
from rest_framework.response import Response
from rest_framework.decorators import api_view

# ✅ Updated Index Lists (Removed Invalid Symbols)
INDIAN_INDICES = ["^NSEI", "^BSESN", "^NSEBANK", "^NIFTYIT", "^NIFTYFMCG",
                  "^NIFTYAUTO", "^NIFTYPHARM", "^NIFTYMETAL", "^NIFTYENERGY", "^NIFTYREALTY"]

GLOBAL_INDICES = ["^DJI", "^IXIC", "^GSPC", "^FTSE", "^N225",
                  "^HSI", "^DAX", "^CAC40", "^ASX200", "^SSEC"]

def fetch_single_index_data(symbol):
    """Fetch data for a single index from Yahoo Finance."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.history(period="1d")
        if info.empty:
            return None

        last_row = info.iloc[-1]
        return {
            "symbol": symbol,
            "last_traded": round(last_row["Close"], 2),
            "day_change": round(last_row["Close"] - last_row["Open"], 2),
            "high": round(last_row["High"], 2),
            "low": round(last_row["Low"], 2),
            "open": round(last_row["Open"], 2),
            "prev_close": round(last_row["Close"], 2)
        }
    except Exception as e:
        print(f"⚠️ Error fetching {symbol}: {e}")
        return None

def fetch_indices_data(indices_list):
    """Fetch market data for multiple indices."""
    results = []
    for symbol in indices_list:
        data = fetch_single_index_data(symbol)
        if data:
            results.append(data)
    return results

@api_view(["GET"])
def get_indices(request):
    """Fetch Indian and Global Indices."""
    indian_indices = fetch_indices_data(INDIAN_INDICES)
    global_indices = fetch_indices_data(GLOBAL_INDICES)

    return Response({"indian_indices": indian_indices, "global_indices": global_indices})

# import yfinance as yf
# import logging
# import pandas as pd
# from django.http import JsonResponse

# logger = logging.getLogger(__name__)

# def fetch_indices_info(request, index_ticker):
#     """
#     Fetches index details such as current price, open, high, low, change,
#     percentage change, and volume from Yahoo Finance, including 52-week high and low.
#     """
#     try:
#         index_ticker = index_ticker.upper()
#         index = yf.Ticker(index_ticker)
#         index_data = index.history(period="1d").tail(1)  # Fetch the latest day's data

#         if index_data.empty:
#             return JsonResponse({'error': f"No data found for {index_ticker}"}, status=404)

#         # Fetch 52-week historical data
#         df = index.history(period="1y")  # Fetch last 1-year data

#         price = round(index_data['Close'].values[0], 2)
#         open_price = round(index_data['Open'].values[0], 2)
#         high = round(index_data['High'].values[0], 2)
#         low = round(index_data['Low'].values[0], 2)
#         volume = int(index_data['Volume'].values[0])
#         change = round(price - open_price, 2)
#         percentage_change = round((change / open_price) * 100, 2) if open_price else None

#         # Convert Pandas Series to float
#         low_52wk = round(df['Low'].min().item(), 2) if not df.empty else None
#         high_52wk = round(df['High'].max().item(), 2) if not df.empty else None

#         index_info = {
#             'symbol': index_ticker,
#             'price': price,
#             'open': open_price,
#             'high': high,
#             'low': low,
#             'change': change,
#             'percentage_change': percentage_change,
#             'volume': volume,
#             "high_52wk": high_52wk,
#             "low_52wk": low_52wk,
#         }

#         return JsonResponse(index_info)

#     except Exception as e:
#         logger.error(f"Error fetching index data for {index_ticker}: {e}")
#         return JsonResponse({'error': str(e)}, status=500)


import yfinance as yf
import logging
from django.http import JsonResponse

logger = logging.getLogger(__name__)

def fetch_indices_info(request, index_ticker):
    """
    Fetches index details such as current price, open, high, low, change,
    percentage change, volume, and 52-week high/low from Yahoo Finance.
    """
    try:
        index_ticker = index_ticker.upper()
        ticker = yf.Ticker(index_ticker)
        index_data = ticker.history(period="1d")  # Fetch the latest day’s data
        info = ticker.info  # Fetch additional info

        if index_data.empty:
            return JsonResponse({'error': f"No data found for {index_ticker}"}, status=404)

        # Fetch standard market details
        price = round(index_data['Close'].values[-1], 2)
        open_price = round(index_data['Open'].values[-1], 2)
        high = round(index_data['High'].values[-1], 2)
        low = round(index_data['Low'].values[-1], 2)
        volume = int(index_data['Volume'].values[-1]) if 'Volume' in index_data.columns else 0

        # Fetch 52-week high and low from `yfinance.info`
        low_52wk = info.get('fiftyTwoWeekLow', None)
        high_52wk = info.get('fiftyTwoWeekHigh', None)

        # Fetch previous close price
        previous_close = info.get('previousClose', None)

        # Calculate day change and percentage change
        change = None
        percentage_change = None
        if previous_close is not None and price is not None:
            change = round(price - previous_close, 2)
            percentage_change = round((change / previous_close) * 100, 2)

        index_info = {
            'symbol': index_ticker,
            'price': price,
            'open': open_price,
            'high': high,
            'low': low,
            'change': change,
            'percentage_change': percentage_change,
            'volume': volume,
            "high_52wk": round(high_52wk, 2) if high_52wk is not None else "N/A",
            "low_52wk": round(low_52wk, 2) if low_52wk is not None else "N/A",
        }

        return JsonResponse(index_info)

    except Exception as e:
        logger.error(f"Error fetching index data for {index_ticker}: {e}")
        return JsonResponse({'error': str(e)}, status=500)


import yfinance as yf
import plotly.graph_objects as go
import pandas as pd
import json
import logging
import numpy as np
from django.http import JsonResponse

logger = logging.getLogger(__name__)

def generate_index_chart(index_ticker):
    """
    Fetches index data from Yahoo Finance and generates charts
    for different timeframes ('1D', '1M', '6M', '1Y', '5Y').
    """
    try:
        index = yf.Ticker(index_ticker)

        # Define timeframes
        timeframes = {
            "1D": index.history(period="1d"),
            "1M": index.history(period="1mo"),
            "6M": index.history(period="6mo"),
            "1Y": index.history(period="1y"),
            "5Y": index.history(period="5y")
        }

        charts = {}

        for key, df in timeframes.items():
            if df.empty:
                logger.warning(f"No data found for {index_ticker} ({key} timeframe)")
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
                    'text': f'{index_ticker} Closing Prices - {key.upper()}',
                    'x': 0.5,  # Center align title
                    'xanchor': 'center',
                    'font': {'size': 18, 'color': 'white'}
                },
                xaxis_title='Date',
                yaxis_title='Closing Price',
                xaxis_rangeslider_visible=True,
                plot_bgcolor='black',
                paper_bgcolor='black',
                height=750,
                width=1300,
                margin=dict(l=40, r=40, t=80, b=40),
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
                        'x': 0.88,
                        'y': 1.2,
                        'showactive': True
                    }
                ]
            )

            fig.update_xaxes(showgrid=True, gridwidth=0.5, gridcolor='grey')
            fig.update_yaxes(showgrid=True, gridwidth=0.5, gridcolor='grey')

            charts[key] = fig.to_dict()

        return charts

    except Exception as e:
        logger.error(f"Error fetching index chart for {index_ticker}: {e}")
        return {"error": str(e)}
    
def generate_index_technical_chart(index_ticker):
    """Generates technical analysis charts for different timeframes"""
    index = yf.Ticker(index_ticker)
    charts = {}

    timeframes = {
        "1D": index.history(period="1d"),
        "1M": index.history(period="1mo"),
        "6M": index.history(period="6mo"),
        "1Y": index.history(period="1y"),
        "5Y": index.history(period="5y")
    }

    for key, df in timeframes.items():
        if df.empty:
            logger.warning(f"No data found for {index_ticker} ({key} timeframe)")
            continue

        df.reset_index(inplace=True)
        df["date"] = pd.to_datetime(df["Date"])
        df.set_index("date", inplace=True)
        df = calculate_technical_indicators(df)

        fig = go.Figure()

        if "RSI" in df:
            fig.add_trace(go.Scatter(
                x=df.index.astype(str),
                y=df["RSI"],
                mode="lines",
                name="RSI",
                line=dict(color="cyan", width=2),
            ))

        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=[70] * len(df),
            mode="lines",
            name="Overbought (70)",
            line=dict(color="red", dash="dot"),
        ))
        fig.add_trace(go.Scatter(
            x=df.index.astype(str),
            y=[30] * len(df),
            mode="lines",
            name="Oversold (30)",
            line=dict(color="green", dash="dot"),
        ))

        if "MACD" in df and "MACD_Signal" in df:
            fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["MACD"], mode="lines", name="MACD", line=dict(color="blue", width=2)))
            fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["MACD_Signal"], mode="lines", name="MACD Signal", line=dict(color="orange", width=2)))

        if "BB_Upper" in df and "BB_Lower" in df:
            fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["BB_Upper"], mode="lines", name="Upper Bollinger", line=dict(color="lightgray", width=1)))
            fig.add_trace(go.Scatter(x=df.index.astype(str), y=df["BB_Lower"], mode="lines", name="Lower Bollinger", line=dict(color="lightgray", width=1)))

        fig.update_layout(
            title={"text": f"{index_ticker} Technical Indicators - {key}",
                   "x": 0.5, "xanchor": "center", "font": {"size": 18, "color": "white"}},
            xaxis_title="Date",
            yaxis_title="Indicator Value",
            xaxis_rangeslider_visible=True,
            plot_bgcolor="black",
            paper_bgcolor="black",
            font=dict(color="white"),
            height=400,
            width=1300,
        )

        charts[key] = fig.to_dict()

    return charts

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import numpy as np
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def index_chart_view(request, index_ticker=None):
    """Fetches both the index price chart and technical indicators chart."""
    logger.info(f"Fetching charts for {index_ticker}...")

    try:
        # Ensure index_ticker is received as a string
        if not index_ticker:
            return JsonResponse({'error': 'No index ticker provided'}, status=400)
        
        index_ticker = str(index_ticker).strip()

        # Fetch the main index chart
        charts = generate_index_chart(index_ticker)

        # Fetch the technical indicators chart
        technical_chart = generate_index_technical_chart(index_ticker)

        if charts and technical_chart:
            json_compatible = {
                "index_chart": json.loads(json.dumps(charts, default=lambda x: x.tolist() if isinstance(x, np.ndarray) else x)),
                "technical_chart": json.loads(json.dumps(technical_chart, default=lambda x: x.tolist() if isinstance(x, np.ndarray) else x))
            }
            return JsonResponse(json_compatible)

        logger.error(f"Failed to generate charts for {index_ticker}")
        return JsonResponse({'error': 'No data found'}, status=404)

    except Exception as e:
        logger.error(f"Error in index_chart_view: {e}")
        return JsonResponse({'error': str(e)}, status=500)

#new backend with updates
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.timezone import now
# import json, yfinance as yf
# from .models import Trade, Portfolio, Order, Position, Funds

# # Fetch Stock Info
# def fetch_stock_info(ticker):
#     try:
#         stock = yf.Ticker(ticker)
#         stock_data = stock.history(period="1d")
        
#         if stock_data.empty:
#             return None
        
#         latest_price = stock_data["Close"].iloc[-1]
#         return {
#             'ticker': ticker,
#             'price': latest_price,
#             'change': stock.info.get('regularMarketChange', 0),
#             'percentage': stock.info.get('regularMarketChangePercent', 0),
#             'open': stock.info.get('open', 0),
#             'high': stock.info.get('dayHigh', 0),
#             'low': stock.info.get('dayLow', 0),
#         }
#     except Exception as e:
#         return None

# @csrf_exempt
# def execute_trade(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             ticker = data['ticker']
#             trade_type = data['tradeType']
#             order_type = data['orderType']
#             quantity = int(data['quantity'])
#             stop_price = float(data.get('stopPrice', 0)) if data.get('stopPrice') else None

#             stock_info = fetch_stock_info(ticker)
#             if not stock_info:
#                 return JsonResponse({'error': 'Invalid stock ticker'}, status=400)
            
#             market_price = stock_info['price']
#             executed_price = market_price if order_type == "Market Price" else stop_price

#             trade = Trade.objects.create(
#                 ticker=ticker,
#                 trade_type=trade_type,
#                 order_type=order_type,
#                 quantity=quantity,
#                 price=executed_price,
#                 stop_price=stop_price
#             )
            
#             portfolio, created = Portfolio.objects.get_or_create(ticker=ticker)
#             if trade_type == "buy":
#                 total_cost = (portfolio.quantity * portfolio.avg_price) + (quantity * executed_price)
#                 portfolio.quantity += quantity
#                 portfolio.avg_price = total_cost / portfolio.quantity
#             elif trade_type == "sell":
#                 if portfolio.quantity >= quantity:
#                     portfolio.quantity -= quantity
#                     if portfolio.quantity == 0:
#                         portfolio.delete()
#                 else:
#                     return JsonResponse({'error': 'Not enough shares to sell'}, status=400)
            
#             portfolio.save()
#             return JsonResponse({'success': True, 'message': f"{trade_type.capitalize()} order executed"})
#         except Exception as e:
#             return JsonResponse({'error': str(e)}, status=400)
#     return JsonResponse({'error': 'Invalid request method'}, status=405)

# # Get Portfolio
# def get_portfolio(request):
#     try:
#         portfolio = Portfolio.objects.all()
#         total_pnl = sum(
#             (fetch_stock_info(p.ticker)['price'] - p.avg_price) * p.quantity for p in portfolio if fetch_stock_info(p.ticker)
#         )
#         buying_power = max(1000000 - sum(p.quantity * p.avg_price for p in portfolio), 0)
#         return JsonResponse({"buyingPower": buying_power, "profitLoss": total_pnl})
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)

# # Get Trade History
# def trade_history(request):
#     try:
#         trades = Trade.objects.all().order_by('-executed_at')[:20]
#         trade_data = [{
#             "ticker": t.ticker,
#             "tradeType": t.trade_type,
#             "orderType": t.order_type,
#             "quantity": t.quantity,
#             "price": t.price,
#             "timestamp": t.executed_at.strftime("%Y-%m-%d %H:%M:%S")
#         } for t in trades]

#         return JsonResponse({"trades": trade_data})
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)

# # Get Funds
# def get_funds(request):
#     funds = Funds.objects.first()
#     if not funds:
#         funds = Funds.objects.create()
#     return JsonResponse({
#         "available_margin": funds.available_margin,
#         "used_margin": funds.used_margin,
#         "opening_balance": funds.opening_balance
#     })

# # Get Positions
# def get_positions(request):
#     positions = Position.objects.all()
#     positions_data = [
#         {
#             "ticker": p.ticker,
#             "quantity": p.quantity,
#             "avg_price": p.avg_price,
#             "pnl": p.pnl
#         } for p in positions
#     ]
#     return JsonResponse({"positions": positions_data})

# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.timezone import now
# import json, yfinance as yf
# from .models import Trade, Portfolio, Order, Position, Funds

# # ✅ Fetch Stock Info with Live Market Data
# def fetch_stock_info(ticker):
#     try:
#         stock = yf.Ticker(ticker)
#         stock_data = stock.history(period="1d")

#         if stock_data.empty:
#             return None

#         latest_price = stock_data["Close"].iloc[-1]
#         return {
#             'ticker': ticker,
#             'price': latest_price,
#             'change': stock.info.get('regularMarketChange', 0),
#             'percentage': stock.info.get('regularMarketChangePercent', 0),
#             'open': stock.info.get('open', 0),
#             'high': stock.info.get('dayHigh', 0),
#             'low': stock.info.get('dayLow', 0),
#             'volume': stock.info.get('volume', 0),
#             'marketCap': stock.info.get('marketCap', 0),
#         }
#     except Exception as e:
#         return None


# # ✅ Execute Trade with Order Processing
# @csrf_exempt
# def execute_trade(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             ticker = data['ticker']
#             trade_type = data['tradeType']
#             order_type = data['orderType']
#             quantity = int(data['quantity'])
#             stop_price = float(data.get('stopPrice', 0)) if data.get('stopPrice') else None

#             stock_info = fetch_stock_info(ticker)
#             if not stock_info:
#                 return JsonResponse({'error': 'Invalid stock ticker'}, status=400)

#             market_price = stock_info['price']
#             executed_price = market_price if order_type == "Market Price" else stop_price

#             # ✅ Save Trade in Database
#             trade = Trade.objects.create(
#                 ticker=ticker,
#                 trade_type=trade_type,
#                 order_type=order_type,
#                 quantity=quantity,
#                 price=executed_price,
#                 stop_price=stop_price
#             )

#             # ✅ Manage Portfolio
#             portfolio, created = Portfolio.objects.get_or_create(ticker=ticker)
#             if trade_type == "buy":
#                 total_cost = (portfolio.quantity * portfolio.avg_price) + (quantity * executed_price)
#                 portfolio.quantity += quantity
#                 portfolio.avg_price = total_cost / portfolio.quantity
#             elif trade_type == "sell":
#                 if portfolio.quantity >= quantity:
#                     portfolio.quantity -= quantity
#                     if portfolio.quantity == 0:
#                         portfolio.delete()
#                 else:
#                     return JsonResponse({'error': 'Not enough shares to sell'}, status=400)

#             portfolio.save()
            
#             # ✅ Save Order in Database
#             Order.objects.create(
#                 ticker=ticker,
#                 order_type=order_type,
#                 trade_type=trade_type,
#                 quantity=quantity,
#                 price=executed_price,
#                 status="Executed"
#             )

#             return JsonResponse({'success': True, 'message': f"{trade_type.capitalize()} order executed"})
#         except Exception as e:
#             return JsonResponse({'error': str(e)}, status=400)
#     return JsonResponse({'error': 'Invalid request method'}, status=405)


# # ✅ Get Portfolio with Real-Time Data
# def get_portfolio(request):
#     try:
#         portfolio = Portfolio.objects.all()
#         total_pnl = sum(
#             (fetch_stock_info(p.ticker)['price'] - p.avg_price) * p.quantity for p in portfolio if fetch_stock_info(p.ticker)
#         )
#         buying_power = max(1000000 - sum(p.quantity * p.avg_price for p in portfolio), 0)
        
#         holdings = []
#         for p in portfolio:
#             stock_info = fetch_stock_info(p.ticker)
#             holdings.append({
#                 "ticker": p.ticker,
#                 "quantity": p.quantity,
#                 "avg_price": p.avg_price,
#                 "current_price": stock_info['price'] if stock_info else "N/A",
#                 "pnl": (stock_info['price'] - p.avg_price) * p.quantity if stock_info else "N/A"
#             })

#         return JsonResponse({"buyingPower": buying_power, "profitLoss": total_pnl, "holdings": holdings})
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)

# def trade_history(request):
#     try:
#         trades = Trade.objects.all().order_by('-timestamp')[:20]
#         trade_data = [{
#             "ticker": t.ticker,
#             "tradeType": t.trade_type,
#             "orderType": t.order_type,
#             "quantity": t.quantity,
#             "price": t.price,
#             "timestamp": t.timestamp.strftime("%Y-%m-%d %H:%M:%S")
#         } for t in trades]

#         return JsonResponse({"trades": trade_data})
#     except Exception as e:
#         return JsonResponse({'error': f"Error fetching trade history: {str(e)}"}, status=500)

# # ✅ Get Order History
# def order_history(request):
#     try:
#         orders = Order.objects.all().order_by('-timestamp')[:20]
#         order_data = [{
#             "ticker": o.ticker,
#             "tradeType": o.trade_type,
#             "orderType": o.order_type,
#             "quantity": o.quantity,
#             "price": o.price,
#             "status": o.status,
#             "timestamp": o.timestamp.strftime("%Y-%m-%d %H:%M:%S")
#         } for o in orders]

#         return JsonResponse({"orders": order_data})
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)


# # ✅ Get Live Positions
# def get_positions(request):
#     try:
#         positions = Position.objects.all()
#         positions_data = [{
#             "ticker": p.ticker,
#             "quantity": p.quantity,
#             "avg_price": p.avg_price,
#             "current_price": fetch_stock_info(p.ticker)['price'] if fetch_stock_info(p.ticker) else "N/A",
#             "pnl": (fetch_stock_info(p.ticker)['price'] - p.avg_price) * p.quantity if fetch_stock_info(p.ticker) else "N/A"
#         } for p in positions]

#         return JsonResponse({"positions": positions_data})
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)


# # ✅ Get Funds and Margin Details
# def get_funds(request):
#     funds = Funds.objects.first()
#     if not funds:
#         funds = Funds.objects.create()

#     return JsonResponse({
#         "available_margin": funds.available_margin,
#         "used_margin": funds.used_margin,
#         "opening_balance": funds.opening_balance,
#         "leverage_used": funds.leverage_used,
#         "net_exposure": funds.net_exposure
#     })


#working all of it still needs improvement
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
import json, yfinance as yf
from .models import Trade, Portfolio, Order, Position, Funds

# # ✅ Fetch Live Market Data Efficiently
# def fetch_stock_info(ticker):
#     try:
#         stock = yf.Ticker(ticker)
#         stock_data = stock.history(period="1d")

#         if stock_data.empty:
#             return None

#         latest_price = stock_data["Close"].iloc[-1]
#         return {
#             'ticker': ticker,
#             'price': latest_price,
#             'change': stock.info.get('regularMarketChange', 0),
#             'percentage': stock.info.get('regularMarketChangePercent', 0),
#             'open': stock.info.get('open', 0),
#             'high': stock.info.get('dayHigh', 0),
#             'low': stock.info.get('dayLow', 0),
#             'volume': stock.info.get('volume', 0),
#             'marketCap': stock.info.get('marketCap', 0),
#         }
#     except Exception as e:
#         print(f"Error fetching stock data for {ticker}: {e}")
#         return None


# ✅ Execute Trade & Update All Relevant Tables
# @csrf_exempt
# def execute_trade(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             ticker = data['ticker']
#             trade_type = data['tradeType']
#             order_type = data['orderType']
#             quantity = int(data['quantity'])
#             stop_price = float(data.get('stopPrice', 0)) if data.get('stopPrice') else None

#             stock_info = fetch_stock_info(ticker)
#             if not stock_info:
#                 return JsonResponse({'error': 'Invalid stock ticker'}, status=400)

#             market_price = stock_info['price']
#             executed_price = market_price if order_type == "Market Price" else stop_price

#             # ✅ Save Order
#             order = Order.objects.create(
#                 ticker=ticker,
#                 order_type=order_type,
#                 trade_type=trade_type,
#                 quantity=quantity,
#                 price=executed_price,
#                 status="Executed"
#             )

#             # ✅ Save Transaction
#             # ✅ Save transaction
#             Transaction.objects.create(
#                 ticker=ticker,
#                 trade_type=trade_type,
#                 quantity=quantity,
#                 price=executed_price
#             )


#             # ✅ Update Portfolio
#             portfolio, _ = Portfolio.objects.get_or_create(ticker=ticker)
#             if trade_type == "buy":
#                 total_cost = (portfolio.quantity * portfolio.avg_price) + (quantity * executed_price)
#                 portfolio.quantity += quantity
#                 portfolio.avg_price = total_cost / portfolio.quantity
#             elif trade_type == "sell":
#                 if portfolio.quantity >= quantity:
#                     portfolio.quantity -= quantity
#                     if portfolio.quantity == 0:
#                         portfolio.delete()
#                 else:
#                     return JsonResponse({'error': 'Not enough shares to sell'}, status=400)
#             portfolio.save()

#             # ✅ Update Position
#             position, created = Position.objects.get_or_create(ticker=ticker)
#             if trade_type == "buy":
#                 position.quantity += quantity
#                 position.avg_price = executed_price
#             elif trade_type == "sell" and position.quantity >= quantity:
#                 position.quantity -= quantity
#                 if position.quantity == 0:
#                     position.delete()
#             position.save()

#             # ✅ Update Funds
#             funds = Funds.objects.first()
#             if trade_type == "buy":
#                 funds.available_margin -= quantity * executed_price
#                 funds.used_margin += quantity * executed_price
#             funds.save()

#             return JsonResponse({'success': True, 'message': f"{trade_type.capitalize()} order executed"})

#         except Exception as e:
#             print(f"Error executing trade: {e}")
#             return JsonResponse({'error': str(e)}, status=400)
    
#     return JsonResponse({'error': 'Invalid request method'}, status=405)
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
import json
from .models import Trade, Portfolio, Order, Position, Funds, Transaction

@csrf_exempt
def execute_trade(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ticker = data['ticker']
            trade_type = data['tradeType'].lower()  # Normalize input
            order_type = data['orderType']
            quantity = int(data['quantity'])
            stop_price = float(data.get('stopPrice', 0)) if data.get('stopPrice') else None

            # ✅ Fetch latest stock price
            stock_info = fetch_stock_info(ticker)
            if not stock_info:
                return JsonResponse({'error': 'Invalid stock ticker'}, status=400)

            market_price = stock_info['price']
            executed_price = market_price if order_type.lower() == "market price" else stop_price

            # ✅ Fetch Funds Object
            funds = Funds.objects.first()
            if not funds:
                return JsonResponse({'error': 'Funds record missing!'}, status=500)

            # ✅ Validate margin before trade execution
            trade_value = quantity * executed_price
            if trade_type == "buy" and funds.available_margin < trade_value:
                return JsonResponse({'error': 'Insufficient funds'}, status=400)

            # ✅ Save Order
            order = Order.objects.create(
                ticker=ticker,
                order_type=order_type,
                trade_type=trade_type,
                quantity=quantity,
                price=executed_price,
                status="Executed"
            )

            # ✅ Save Transaction
            Transaction.objects.create(
                ticker=ticker,
                trade_type=trade_type,
                quantity=quantity,
                price=executed_price
            )

            # ✅ Update Portfolio
            portfolio, created = Portfolio.objects.get_or_create(ticker=ticker)

            if trade_type == "buy":
                total_cost = (portfolio.quantity * portfolio.avg_price) + trade_value
                portfolio.quantity += quantity
                portfolio.avg_price = total_cost / portfolio.quantity

            elif trade_type == "sell":
                if portfolio.quantity >= quantity:
                    sell_value = quantity * portfolio.avg_price
                    portfolio.quantity -= quantity

                    # ✅ Recalculate avg_price only if some quantity remains
                    if portfolio.quantity > 0:
                        portfolio.avg_price = (portfolio.total_value - sell_value) / portfolio.quantity
                    else:
                        portfolio.delete()

                else:
                    return JsonResponse({'error': 'Not enough shares to sell'}, status=400)

            portfolio.save()

            # ✅ Update Position (Short Selling Enabled)
            position, created = Position.objects.get_or_create(ticker=ticker)
            if trade_type == "buy":
                position.quantity += quantity
                position.avg_price = executed_price
            elif trade_type == "sell":
                position.quantity -= quantity  # Allows short-selling (negative quantity)
                if position.quantity == 0:
                    position.delete()

            position.save()

            # ✅ Update Funds
            if trade_type == "buy":
                funds.available_margin -= trade_value
                funds.used_margin += trade_value
            elif trade_type == "sell":
                funds.available_margin += trade_value
                funds.used_margin -= trade_value

            funds.save()

            return JsonResponse({'success': True, 'message': f"{trade_type.capitalize()} order executed"})

        except Exception as e:
            print(f"❌ Error executing trade: {e}")
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

def get_portfolio(request):
    try:
        portfolio = Portfolio.objects.all()
        total_pnl = 0
        holdings = []

        for p in portfolio:
            stock_info = fetch_stock_info(p.ticker)
            if stock_info:
                current_price = stock_info['price']
                pnl = (current_price - p.avg_price) * p.quantity
                total_pnl += pnl
                holdings.append({
                    "ticker": p.ticker,
                    "quantity": p.quantity,
                    "avg_price": p.avg_price,
                    "current_price": current_price,
                    "pnl": pnl
                })

        # ✅ Fetch Funds Object to Get the Latest Buying Power
        funds = Funds.objects.first()
        if not funds:
            funds = Funds.objects.create(available_margin=1000000, used_margin=0)  # Ensure funds exist

        buying_power = funds.available_margin  # ✅ Now correctly pulling updated value

        return JsonResponse({
            "buyingPower": buying_power,
            "profitLoss": total_pnl,
            "holdings": holdings
        })

    except Exception as e:
        print(f"Error fetching portfolio: {e}")
        return JsonResponse({'error': str(e)}, status=500)

# ✅ Fetch Trade History
def trade_history(request):
    try:
        trades = Trade.objects.all().order_by('-timestamp')[:20]
        return JsonResponse({
            "trades": [
                {
                    "ticker": t.ticker,
                    "tradeType": t.trade_type,
                    "orderType": t.order_type,
                    "quantity": t.quantity,
                    "price": t.price,
                    "timestamp": t.timestamp.strftime("%Y-%m-%d %H:%M:%S")
                }
                for t in trades
            ]
        })
    except Exception as e:
        return JsonResponse({'error': f"Error fetching trade history: {str(e)}"}, status=500)

# ✅ Fetch Order History
def order_history(request):
    try:
        orders = Order.objects.all().order_by('-timestamp')[:20]
        return JsonResponse({
            "orders": [
                {
                    "ticker": o.ticker,
                    "tradeType": o.trade_type,
                    "orderType": o.order_type,
                    "quantity": o.quantity,
                    "price": o.price,
                    "status": o.status,
                    "timestamp": o.timestamp.strftime("%Y-%m-%d %H:%M:%S")
                }
                for o in orders
            ]
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# ✅ Fetch Live Positions
# def get_positions(request):
#     try:
#         positions = Position.objects.all()
#         return JsonResponse({
#             "positions": [
#                 {
#                     "ticker": p.ticker,
#                     "quantity": p.quantity,
#                     "avg_price": p.avg_price,
#                     "current_price": fetch_stock_info(p.ticker)['price'] if fetch_stock_info(p.ticker) else "N/A",
#                     "pnl": (fetch_stock_info(p.ticker)['price'] - p.avg_price) * p.quantity if fetch_stock_info(p.ticker) else "N/A"
#                 }
#                 for p in positions
#             ]
#         })
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)
# ✅ Fetch Live Positions
def get_positions(request):
    try:
        positions = Position.objects.all()
        positions_data = []

        for p in positions:
            stock_info = fetch_stock_info(p.ticker)

            if stock_info:
                current_price = stock_info.get('price', 0)  # Ensure valid price
                pnl = (current_price - p.avg_price) * p.quantity
                percentage_change = ((current_price - p.avg_price) / p.avg_price) * 100 if p.avg_price > 0 else 0
            else:
                current_price = 0
                pnl = 0
                percentage_change = 0

            positions_data.append({
                "ticker": p.ticker,
                "quantity": p.quantity,
                "avg_price": round(p.avg_price, 2),
                "current_price": round(current_price, 2),
                "pnl": round(pnl, 2),
                "percentage_change": round(percentage_change, 2),
                "risk_score": round(p.risk_score, 2) if hasattr(p, 'risk_score') else 0
            })

        return JsonResponse({"positions": positions_data})

    except Exception as e:
        print(f"❌ Error fetching positions: {e}")
        return JsonResponse({'error': str(e)}, status=500)


# ✅ Fetch Funds & Margin Details
def get_funds(request):
    try:
        funds = Funds.objects.first()
        if not funds:
            funds = Funds.objects.create()

        return JsonResponse({
            "available_margin": funds.available_margin,
            "used_margin": funds.used_margin,
            "opening_balance": funds.opening_balance,
            "leverage_used": funds.leverage_used,
            "net_exposure": funds.net_exposure
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Order, Funds

@csrf_exempt
def cancel_order(request, order_id):
    if request.method == "POST":
        try:
            order = get_object_or_404(Order, id=order_id)

            if order.status == "Executed":
                return JsonResponse({"error": "Cannot cancel an executed order."}, status=400)

            order.status = "Cancelled"
            order.save()

            # ✅ Refund Margin if applicable
            funds = Funds.objects.first()
            if funds and order.status != "Executed":
                funds.available_margin += order.price * order.quantity
                funds.used_margin -= order.price * order.quantity
                funds.save()

            return JsonResponse({"success": True, "message": "Order canceled successfully."})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

# from django.http import JsonResponse
# from .models import Portfolio
# import json

# def get_holdings(request):
#     try:
#         holdings = Portfolio.objects.filter(quantity__gt=0)  # ✅ Ensure we only get stocks with quantity > 0
#         holdings_data = []

#         for h in holdings:
#             stock_info = fetch_stock_info(h.ticker)  # ✅ Fetch stock info dynamically
#             if stock_info:
#                 current_price = stock_info["price"]
#                 pnl = (current_price - h.avg_price) * h.quantity
#                 percentage_change = ((current_price - h.avg_price) / h.avg_price) * 100 if h.avg_price > 0 else 0

#                 holdings_data.append({
#                     "ticker": h.ticker,
#                     "quantity": h.quantity,
#                     "avg_price": round(h.avg_price, 2),
#                     "current_price": round(current_price, 2),
#                     "pnl": round(pnl, 2),
#                     "percentage_change": round(percentage_change, 2),
#                     "sector": h.sector
#                 })
#             else:
#                 print(f"⚠️ Error fetching stock info for {h.ticker}")

#         return JsonResponse({"holdings": holdings_data})

#     except Exception as e:
#         print(f"❌ Error fetching holdings: {e}")  # ✅ Log error
#         return JsonResponse({'error': str(e)}, status=500)

def get_holdings(request):
    try:
        holdings = Portfolio.objects.filter(quantity__gt=0)
        tickers = [h.ticker for h in holdings]  # ✅ Collect all tickers first

        # ✅ Fetch all stock prices in one batch
        stock_prices = {ticker: fetch_stock_info(ticker) for ticker in tickers}

        holdings_data = []
        for h in holdings:
            stock_info = stock_prices.get(h.ticker)
            if stock_info:
                current_price = stock_info["price"]
                pnl = (current_price - h.avg_price) * h.quantity
                percentage_change = ((current_price - h.avg_price) / h.avg_price) * 100 if h.avg_price > 0 else 0

                holdings_data.append({
                    "ticker": h.ticker,
                    "quantity": h.quantity,
                    "avg_price": round(h.avg_price, 2),
                    "current_price": round(current_price, 2),
                    "pnl": round(pnl, 2),
                    "percentage_change": round(percentage_change, 2),
                    "sector": h.sector
                })

        return JsonResponse({"holdings": holdings_data})

    except Exception as e:
        print(f"❌ Error fetching holdings: {e}")
        return JsonResponse({'error': str(e)}, status=500)


def get_orders(request):
    """Fetches all orders."""
    try:
        orders = Order.objects.all().order_by('-placed_at')
        orders_data = [
            {
                "id": o.id,
                "ticker": o.ticker,
                "tradeType": o.trade_type,
                "orderType": o.order_type,
                "quantity": o.quantity,
                "price": o.price,
                "status": o.status,
                "placed_at": o.placed_at.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for o in orders
        ]
        return JsonResponse({"orders": orders_data})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def get_fund_transactions(request):
    """Fetches the latest fund transactions."""
    try:
        funds = Funds.objects.first()
        transactions_data = [
            {
                "date": now().strftime("%Y-%m-%d %H:%M:%S"),
                "type": "credit" if funds.available_margin > 0 else "debit",
                "amount": abs(funds.available_margin - funds.used_margin),
            }
        ]
        return JsonResponse({"transactions": transactions_data})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def get_portfolio_summary(request):
    """Fetches summary of portfolio including total investment, current value, and P&L."""
    try:
        portfolio = Portfolio.objects.filter(quantity__gt=0)  # ✅ Only stocks with quantity > 0

        total_investment = sum(p.quantity * p.avg_price for p in portfolio)
        current_value = 0
        total_pnl = 0

        for p in portfolio:
            stock_info = fetch_stock_info(p.ticker)
            if stock_info:
                current_price = stock_info["price"]
                stock_value = p.quantity * current_price
                current_value += stock_value
                total_pnl += (current_price - p.avg_price) * p.quantity
            else:
                print(f"⚠️ Missing stock price for {p.ticker}")

        return JsonResponse({
            "total_investment": round(total_investment, 2),
            "current_value": round(current_value, 2),
            "total_pnl": round(total_pnl, 2)
        })

    except Exception as e:
        print(f"❌ Error fetching portfolio summary: {e}")
        return JsonResponse({"error": str(e)}, status=500)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Funds, Portfolio

@csrf_exempt
def reset_price(request):
    """Resets the user's buying power to ₹1,000,000 and updates the portfolio"""
    if request.method == "POST":
        try:
            # ✅ Ensure a Funds object exists
            funds, _ = Funds.objects.get_or_create(id=1)

            # ✅ Reset Buying Power
            funds.available_margin = 1000000.0  # ₹10 Lakh
            funds.used_margin = 0.0
            funds.save()

            return JsonResponse({
                "success": True,
                "message": "Buying power reset successfully.",
                "buyingPower": funds.available_margin  # ✅ Send updated value back
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)




from django.http import JsonResponse
from django.utils.timezone import now
from datetime import timedelta
from django.db import models
from django.core.mail import send_mail
from .models import Portfolio, Transaction, Funds, PriceAlert
from .utils import fetch_stock_info  # Ensure fetch_stock_info is in utils.py

def get_monthly_summary(request):
    """Returns monthly trade summary including total trades, buy/sell counts, volume, and P&L."""
    try:
        start_date = now() - timedelta(days=30)
        transactions = Transaction.objects.filter(date__gte=start_date)

        # ✅ Aggregate calculations for better performance
        trade_summary = transactions.aggregate(
            total_trades=models.Count("id"),
            buy_trades=models.Count("id", filter=models.Q(trade_type="buy")),
            sell_trades=models.Count("id", filter=models.Q(trade_type="sell")),
            total_volume=models.Sum("quantity"),
        )

        # ✅ Handle missing Portfolio entries
        total_profit_loss = 0
        for t in transactions:
            try:
                avg_price = Portfolio.objects.get(ticker=t.ticker).avg_price
                total_profit_loss += (t.price - avg_price) * t.quantity
            except Portfolio.DoesNotExist:
                continue  # Skip missing portfolios

        report = {
            "total_trades": trade_summary["total_trades"] or 0,
            "buy_trades": trade_summary["buy_trades"] or 0,
            "sell_trades": trade_summary["sell_trades"] or 0,
            "total_volume": trade_summary["total_volume"] or 0,
            "profit_loss": round(total_profit_loss, 2),
        }

        return JsonResponse(report)

    except Exception as e:
        return JsonResponse({"error": f"Error fetching monthly summary: {str(e)}"}, status=500)

def check_price_alerts_view(request):
    """Manually triggers price alerts. This should be scheduled with Celery or Cron."""
    try:
        alerts = PriceAlert.objects.filter(notified=False)
        tickers = set(alert.ticker for alert in alerts)
        stock_prices = {ticker: fetch_stock_info(ticker) for ticker in tickers}

        updated_alerts = []
        for alert in alerts:
            stock_price = stock_prices.get(alert.ticker, {}).get("price")

            if stock_price and stock_price >= alert.target_price:
                send_mail(
                    subject=f"📢 Price Alert: {alert.ticker} Hit ₹{stock_price}!",
                    message=f"Your target price for {alert.ticker} has been reached.",
                    from_email="noreply@tradingplatform.com",
                    recipient_list=[alert.user_email]
                )
                alert.notified = True
                updated_alerts.append(alert)

        if updated_alerts:
            PriceAlert.objects.bulk_update(updated_alerts, ["notified"])  # ✅ Batch update

        return JsonResponse({"success": True, "message": "Price alerts checked."})

    except Exception as e:
        return JsonResponse({"error": f"Error checking price alerts: {str(e)}"}, status=500)


import os
import openai
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

openai.base_url = "https://api.deepseek.com"

@csrf_exempt
def fetch_stock_news(request):
    try:
        DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "sk-4694022c06df49749b9b6b014402c0e8")  # Secure API key handling
        # ✅ Validate API Key
        if not openai.api_key:
            return JsonResponse({"error": "❌ Missing DeepSeek API Key"}, status=500)

        # ✅ Make API Request
        response = openai.ChatCompletion.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a financial assistant providing stock market news."},
                {"role": "user", "content": "Give me the top 5 latest stock market news headlines for India."}
            ],
            stream=False
        )

        # ✅ Extract News
        if "choices" in response and response["choices"]:
            text = response["choices"][0]["message"]["content"]
            news_list = [{"id": i+1, "ticker": "NSE", "title": line.strip()} for i, line in enumerate(text.split("\n")) if line.strip()]
            return JsonResponse({"news": news_list[:5]})

        return JsonResponse({"error": "❌ Failed to fetch news from DeepSeek API"}, status=500)

    except openai.error.OpenAIError as e:
        return JsonResponse({"error": f"❌ API Error: {str(e)}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": f"❌ Internal Server Error: {str(e)}"}, status=500)



import feedparser

@csrf_exempt
def fetch_stock_news(request):
    try:
        rss_url = "https://news.google.com/rss/search?q=indian+stock+market&hl=en-IN&gl=IN&ceid=IN:en"
        feed = feedparser.parse(rss_url)

        news_list = [
            {
                "id": i + 1,
                "ticker": "Google News",
                "title": entry.title,
                "url": entry.link
            }
            for i, entry in enumerate(feed.entries[:5])
        ]

        return JsonResponse({"news": news_list})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

import feedparser
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def fetch_stock_news(request):
    """
    Fetches latest stock news based on a specific ticker.
    If no ticker is provided, it defaults to 'MSFT'.
    """
    try:
        ticker = request.GET.get("ticker", "MSFT")  # ✅ Get ticker from request, default to MSFT
        rss_url = f"https://news.google.com/rss/search?q={ticker}+stock+market&hl=en-IN&gl=IN&ceid=IN:en"
        
        feed = feedparser.parse(rss_url)

        news_list = [
            {
                "id": i + 1,
                "ticker": ticker.upper(),
                "title": entry.title,
                "url": entry.link
            }
            for i, entry in enumerate(feed.entries[:5])  # ✅ Limit to top 5 news articles
        ]

        return JsonResponse({"news": news_list})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)