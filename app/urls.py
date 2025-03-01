# app/urls.py

from django.urls import path
from .views import get_index_data

# app/urls.py
from django.urls import path
from . import views
from .views import stock_data_view
from .views import stock_chart_view
from .views import stock_info_view
from .views import (
    stock_data_view, stock_chart_view, stock_info_view,
    execute_trade, get_portfolio, trade_history, stock_info,
    fetch_fundamentals, fetch_technicals 
)

from .views import fetch_fundamentals, fetch_fundamentals_fin, fetch_technicals
from .views import fetch_market_data, fetch_scanners, fetch_strategies
from .views import get_indices
from .views import fetch_indices_info, generate_index_chart
from .views import index_chart_view, fetch_indices_info
from .views import get_funds, get_positions, get_portfolio, trade_history, execute_trade
from .views import (
    get_monthly_summary,
    check_price_alerts_view,  # ✅ Fixed function name
)
from .views import fetch_stock_news
from .views import fetch_stock_news  # ✅ Import the function from views.py
from . import views

urlpatterns = [
   path('', views.home, name='home'),  # Root path
   path('index-data/<str:ticker_symbol>/', views.get_index_data, name='get_index_data'),
   path('', views.fetch_stock_data_and_compute_gainers_losers, name='dashboard'),
   path('api/update_gainers_losers/', views.api_update_gainers_losers, name='update_gainers_losers'),
   path('api/stock_data/', stock_data_view, name='stock_data'),
   path('api/stock_chart/<str:ticker>/', stock_chart_view, name='stock_chart'),
   path('api/stock_info/<str:ticker>/', stock_info_view, name='stock_info'),
   # path('api/execute_trade/', execute_trade, name='execute_trade'),
   # path('api/portfolio/', get_portfolio, name='get_portfolio'),
   # path('api/trade_history/', trade_history, name='trade_history'),
   # path('api/stock_info/<str:ticker>/', stock_info, name='stock_info'),
   # ✅ Fix: Add API routes correctly
   path('api/fundamentals/<str:ticker>/', fetch_fundamentals, name='fetch_fundamentals'),
   path('api/fundamentals_fin/<str:ticker>/', fetch_fundamentals_fin, name='fetch_fundamentals_fin'),
   path('api/technicals/<str:ticker>/', fetch_technicals, name='fetch_technicals'),
   path('api/market/<str:ticker>/', fetch_market_data, name='fetch_market_data'),
   path('api/scanners/<str:ticker>/', fetch_scanners, name='fetch_scanners'),
   path('api/strategies/<str:ticker>/', fetch_strategies, name='fetch_strategies'),
   path("api/indices/", get_indices, name='get_indices'),
   path('api/indices_info/<str:index_ticker>/', fetch_indices_info, name='indices_info'),
   path('api/indices_chart/<str:index_ticker>/', index_chart_view, name='indices_chart'),
   path("api/execute_trade/", views.execute_trade, name="execute_trade"),
   path("api/cancel-order/<int:order_id>/", views.cancel_order, name="cancel_order"),

    # ✅ Data Fetching Endpoints
   path("api/trade_history/", views.trade_history, name="trade_history"),
   path("api/order_history/", views.order_history, name="order_history"),
   path("api/positions/", views.get_positions, name="get_positions"),
   path("api/funds/", views.get_funds, name="get_funds"),
   path("api/holdings/", views.get_holdings, name="get_holdings"),
   path("api/portfolio/", views.get_portfolio, name="get_portfolio"),
   path("api/orders/", views.get_orders, name="get_orders"),
   path("api/fund-transactions/", views.get_fund_transactions, name="get_fund_transactions"),
   path("api/portfolio-summary/", views.get_portfolio_summary, name="get_portfolio_summary"),
   # 📌 Market Data API (For Resetting Prices)
   path("api/reset-price/", views.reset_price, name="reset_price"),
   path("api/monthly-summary/", get_monthly_summary, name="monthly-summary"),
   path("api/check-price-alerts/", check_price_alerts_view, name="check-price-alerts"),
   path("api/stock-news/", fetch_stock_news, name="fetch_stock_news"),
   path("api/news/", fetch_stock_news, name="fetch_stock_news"),  # ✅ API endpoint for stock news
]


# urlpatterns = [
#     path('api/index-data/<str:symbol>/', views.get_index_data, name='get_index_data'),
# ]

