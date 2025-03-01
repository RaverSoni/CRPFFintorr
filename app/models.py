# from django.db import models

# from django.db import models

# class Trade(models.Model):
#     ticker = models.CharField(max_length=10)
#     trade_type = models.CharField(max_length=4, choices=[("buy", "Buy"), ("sell", "Sell")])
#     order_type = models.CharField(max_length=20)
#     quantity = models.IntegerField()
#     price = models.FloatField()
#     stop_price = models.FloatField(null=True, blank=True)
#     timestamp = models.DateTimeField(auto_now_add=True)  # ✅ Fix: Add timestamp

#     def __str__(self):
#         return f"{self.trade_type.upper()} {self.quantity} {self.ticker} @ {self.price}"

# class Portfolio(models.Model):
#     id = models.BigAutoField(primary_key=True)  # Explicitly define a primary key
#     ticker = models.CharField(max_length=10, unique=True)
#     quantity = models.PositiveIntegerField(default=0)
#     avg_price = models.FloatField(default=0)

# from django.db import models
# from django.utils.timezone import now

# class Trade(models.Model):
#     ticker = models.CharField(max_length=10)
#     trade_type = models.CharField(max_length=4, choices=[("buy", "Buy"), ("sell", "Sell")])
#     order_type = models.CharField(max_length=20)
#     quantity = models.IntegerField()
#     price = models.FloatField()
#     stop_price = models.FloatField(null=True, blank=True)
#     timestamp = models.DateTimeField(default=now)  # ✅ Fix applied

#     def __str__(self):
#         return f"{self.trade_type.upper()} {self.quantity} {self.ticker} @ {self.price}"

# class Portfolio(models.Model):
#     ticker = models.CharField(max_length=10, unique=True)
#     quantity = models.PositiveIntegerField(default=0)
#     avg_price = models.FloatField(default=0)
#     total_value = models.FloatField(default=0)
    
#     def update_value(self, current_price):
#         self.total_value = self.quantity * current_price
#         self.save()

# class Order(models.Model):
#     ticker = models.CharField(max_length=10)
#     trade_type = models.CharField(max_length=4, choices=[("buy", "Buy"), ("sell", "Sell")])
#     order_type = models.CharField(max_length=20)
#     quantity = models.IntegerField()
#     price = models.FloatField()
#     status = models.CharField(max_length=20, default="pending")
#     placed_at = models.DateTimeField(default=now)

# class Position(models.Model):
#     ticker = models.CharField(max_length=10, unique=True)
#     quantity = models.IntegerField(default=0)
#     avg_price = models.FloatField(default=0)
#     pnl = models.FloatField(default=0)
    
#     def update_pnl(self, current_price):
#         self.pnl = (current_price - self.avg_price) * self.quantity
#         self.save()

# class Funds(models.Model):
#     available_margin = models.FloatField(default=100000.0)
#     used_margin = models.FloatField(default=0.0)
#     opening_balance = models.FloatField(default=100000.0)
    
#     def update_funds(self, amount, is_credit=True):
#         if is_credit:
#             self.available_margin += amount
#         else:
#             self.available_margin -= amount
#             self.used_margin += amount
#         self.save()


# from django.db import models
# from django.utils.timezone import now

# # ✅ Trade Model - Handles Buy/Sell orders with Stop-Loss, Take-Profit & Execution Time
# class Trade(models.Model):
#     TRADE_TYPE_CHOICES = [("buy", "Buy"), ("sell", "Sell")]
#     ORDER_TYPE_CHOICES = [
#         ("market", "Market Price"),
#         ("limit", "Limit Order"),
#         ("stop", "Stop Order"),
#         ("stop-limit", "Stop-Limit Order"),
#     ]

#     ticker = models.CharField(max_length=10)
#     trade_type = models.CharField(max_length=4, choices=TRADE_TYPE_CHOICES)
#     order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES)
#     quantity = models.IntegerField()
#     price = models.FloatField()
#     stop_price = models.FloatField(null=True, blank=True)  # Used for Stop & Stop-Limit Orders
#     take_profit_price = models.FloatField(null=True, blank=True)  # Optional Take-Profit Level
#     status = models.CharField(max_length=20, default="Pending")  # Pending, Executed, Cancelled
#     timestamp = models.DateTimeField(default=now)  # ✅ Fix applied

#     def __str__(self):
#         return f"{self.trade_type.upper()} {self.quantity} {self.ticker} @ {self.price}"


# # ✅ Portfolio Model - Track Holdings, Real-Time Updates & Dividends
# class Portfolio(models.Model):
#     ticker = models.CharField(max_length=10, unique=True)
#     quantity = models.PositiveIntegerField(default=0)
#     avg_price = models.FloatField(default=0)
#     total_value = models.FloatField(default=0)
#     dividends_received = models.FloatField(default=0)  # Passive income tracking
#     sector = models.CharField(max_length=50, default="General")  # Tech, Healthcare, Energy, etc.

#     def update_value(self, current_price):
#         self.total_value = self.quantity * current_price
#         self.save()

#     def update_dividends(self, amount):
#         self.dividends_received += amount
#         self.save()

#     def __str__(self):
#         return f"{self.ticker} - {self.quantity} Shares @ {self.avg_price}"


# # ✅ Order Model - Track Order Execution History
# class Order(models.Model):
#     STATUS_CHOICES = [
#         ("Pending", "Pending"),
#         ("Executed", "Executed"),
#         ("Cancelled", "Cancelled"),
#     ]

#     ticker = models.CharField(max_length=10)
#     trade_type = models.CharField(max_length=4, choices=[("buy", "Buy"), ("sell", "Sell")])
#     order_type = models.CharField(max_length=20)
#     quantity = models.IntegerField()
#     price = models.FloatField()
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
#     placed_at = models.DateTimeField(default=now)

#     def __str__(self):
#         return f"{self.status.upper()} - {self.ticker} ({self.quantity} @ {self.price})"


# # ✅ Position Model - Track Live Market P&L & Carry-Forward Trades
# class Position(models.Model):
#     ticker = models.CharField(max_length=10, unique=True)
#     quantity = models.IntegerField(default=0)
#     avg_price = models.FloatField(default=0)
#     pnl = models.FloatField(default=0)  # Profit/Loss calculation
#     leverage = models.FloatField(default=1.0)  # Used for margin trading
#     risk_score = models.FloatField(default=0)  # Risk analytics (calculated dynamically)
#     carry_forward = models.BooleanField(default=False)  # If position continues to next day

#     def update_pnl(self, current_price):
#         self.pnl = (current_price - self.avg_price) * self.quantity
#         self.save()

#     def calculate_risk(self):
#         self.risk_score = abs((self.pnl / (self.avg_price * self.quantity)) * 100)
#         self.save()

#     def __str__(self):
#         return f"{self.ticker} Position - {self.quantity} @ {self.avg_price}"


# # ✅ Funds Model - Track Margins, Leverage, & Available Cash
# class Funds(models.Model):
#     available_margin = models.FloatField(default=100000.0)
#     used_margin = models.FloatField(default=0.0)
#     opening_balance = models.FloatField(default=100000.0)
#     leverage_used = models.FloatField(default=0.0)  # Leverage factor applied
#     net_exposure = models.FloatField(default=0.0)  # Total risk exposure

#     def update_funds(self, amount, is_credit=True):
#         if is_credit:
#             self.available_margin += amount
#         else:
#             self.available_margin -= amount
#             self.used_margin += amount
#         self.save()

#     def apply_leverage(self, leverage_factor):
#         self.leverage_used = leverage_factor
#         self.net_exposure = self.available_margin * leverage_factor
#         self.save()

#     def __str__(self):
#         return f"Margin: {self.available_margin}, Used: {self.used_margin}"


# # ✅ Market Data Model (Future-Proofing for Live Updates)
# class MarketData(models.Model):
#     ticker = models.CharField(max_length=10, unique=True)
#     current_price = models.FloatField()
#     day_high = models.FloatField()
#     day_low = models.FloatField()
#     volume = models.BigIntegerField()
#     last_updated = models.DateTimeField(auto_now=True)

#     def update_market_data(self, price, high, low, volume):
#         self.current_price = price
#         self.day_high = high
#         self.day_low = low
#         self.volume = volume
#         self.save()

#     def __str__(self):
#         return f"{self.ticker} - {self.current_price}"

from django.db import models
from django.utils.timezone import now
import yfinance as yf
from .utils import fetch_stock_info  # Ensure fetch_stock_info is in utils.py


# ✅ Trade Model - Handles Buy/Sell orders with Stop-Loss, Take-Profit & Execution Time
class Trade(models.Model):
    TRADE_TYPE_CHOICES = [("buy", "Buy"), ("sell", "Sell")]
    ORDER_TYPE_CHOICES = [
        ("market", "Market Price"),
        ("limit", "Limit Order"),
        ("stop", "Stop Order"),
        ("stop-limit", "Stop-Limit Order"),
    ]

    ticker = models.CharField(max_length=10)
    trade_type = models.CharField(max_length=4, choices=TRADE_TYPE_CHOICES)
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES)
    quantity = models.PositiveIntegerField()
    price = models.FloatField()
    stop_price = models.FloatField(null=True, blank=True)  # Used for Stop & Stop-Limit Orders
    take_profit_price = models.FloatField(null=True, blank=True)  # Optional Take-Profit Level
    status = models.CharField(max_length=20, default="Pending", choices=[("Pending", "Pending"), ("Executed", "Executed"), ("Cancelled", "Cancelled")])
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.trade_type.upper()} {self.quantity} {self.ticker} @ {self.price}"

    def execute_trade(self):
        """Handles the execution of a trade"""
        stock_price = fetch_stock_info(self.ticker)
        if not stock_price:
            return False  # Stock data unavailable

        executed_price = stock_price if self.order_type == "market" else self.stop_price

        # ✅ Update Order Status
        self.price = executed_price
        self.status = "Executed"
        self.save()

        # ✅ Update Portfolio
        portfolio, _ = Portfolio.objects.get_or_create(ticker=self.ticker)
        if self.trade_type == "buy":
            total_cost = (portfolio.quantity * portfolio.avg_price) + (self.quantity * executed_price)
            portfolio.quantity += self.quantity
            portfolio.avg_price = total_cost / portfolio.quantity
        elif self.trade_type == "sell":
            if portfolio.quantity >= self.quantity:
                portfolio.quantity -= self.quantity
                if portfolio.quantity == 0:
                    portfolio.delete()
        portfolio.save()

        # ✅ Update Position
        position, _ = Position.objects.get_or_create(ticker=self.ticker)
        if self.trade_type == "buy":
            position.quantity += self.quantity
            position.avg_price = executed_price
        elif self.trade_type == "sell":
            if position.quantity >= self.quantity:
                position.quantity -= self.quantity
                if position.quantity == 0:
                    position.delete()
        position.save()

        # ✅ Update Funds
        funds = Funds.objects.first()
        if self.trade_type == "buy":
            funds.available_margin -= self.quantity * executed_price
            funds.used_margin += self.quantity * executed_price
        funds.save()

        return True

# ✅ Portfolio Model - Track Holdings, Real-Time Updates & Dividends
class Portfolio(models.Model):
    ticker = models.CharField(max_length=10, unique=True)
    quantity = models.PositiveIntegerField(default=0)
    avg_price = models.FloatField(default=0)
    total_value = models.FloatField(default=0)
    dividends_received = models.FloatField(default=0)  # Passive income tracking
    sector = models.CharField(max_length=50, default="General")  # Tech, Healthcare, Energy, etc.

    def update_dividends():
        tickers = Portfolio.objects.values_list('ticker', flat=True)

        for ticker in tickers:
            stock = yf.Ticker(ticker)
            dividends = stock.dividends

            if not dividends.empty:
                last_dividend_date = dividends.index[-1].date()
                last_dividend_value = dividends[-1]

                # ✅ Store in DB
                Dividend.objects.get_or_create(
                    ticker=ticker,
                    amount=last_dividend_value,
                    date=last_dividend_date
                )


    def update_dividends(self, amount):
        self.dividends_received += amount
        self.save()

    def __str__(self):
        return f"{self.ticker} - {self.quantity} Shares @ {self.avg_price}"

# ✅ Order Model - Track Order Execution History
class Order(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Executed", "Executed"),
        ("Cancelled", "Cancelled"),
    ]

    ticker = models.CharField(max_length=10)
    trade_type = models.CharField(max_length=4, choices=[("buy", "Buy"), ("sell", "Sell")])
    order_type = models.CharField(max_length=20)
    quantity = models.IntegerField()
    price = models.FloatField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    placed_at = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.status.upper()} - {self.ticker} ({self.quantity} @ {self.price})"

# ✅ Position Model - Track Live Market P&L & Carry-Forward Trades
class Position(models.Model):
    ticker = models.CharField(max_length=10, unique=True)
    quantity = models.IntegerField(default=0)
    avg_price = models.FloatField(default=0)
    pnl = models.FloatField(default=0)  # Profit/Loss calculation
    leverage = models.FloatField(default=1.0)  # Used for margin trading
    risk_score = models.FloatField(default=0)  # Risk analytics (calculated dynamically)
    carry_forward = models.BooleanField(default=False)  # If position continues to next day

    def update_pnl(self):
        """Calculates profit/loss dynamically"""
        current_price = fetch_stock_info(self.ticker)
        if current_price:
            self.pnl = (current_price - self.avg_price) * self.quantity
            self.save()

    def calculate_risk(self):
        self.risk_score = abs((self.pnl / (self.avg_price * self.quantity)) * 100) if self.quantity else 0
        self.save()

    def __str__(self):
        return f"{self.ticker} Position - {self.quantity} @ {self.avg_price}"

# ✅ Funds Model - Track Margins, Leverage, & Available Cash
class Funds(models.Model):
    available_margin = models.FloatField(default=100000.0)
    used_margin = models.FloatField(default=0.0)
    opening_balance = models.FloatField(default=100000.0)
    leverage_used = models.FloatField(default=0.0)  # Leverage factor applied
    net_exposure = models.FloatField(default=0.0)  # Total risk exposure

    def update_funds(self, amount, is_credit=True):
        if is_credit:
            self.available_margin += amount
        else:
            self.available_margin -= amount
            self.used_margin += amount
        self.save()

    def apply_leverage(self, leverage_factor):
        self.leverage_used = leverage_factor
        self.net_exposure = self.available_margin * leverage_factor
        self.save()

    def __str__(self):
        return f"Margin: {self.available_margin}, Used: {self.used_margin}"

# ✅ Market Data Model (Future-Proofing for Live Updates)
class MarketData(models.Model):
    ticker = models.CharField(max_length=10, unique=True)
    current_price = models.FloatField()
    day_high = models.FloatField()
    day_low = models.FloatField()
    volume = models.BigIntegerField()
    last_updated = models.DateTimeField(auto_now=True)

    def update_market_data(self, price, high, low, volume):
        self.current_price = price
        self.day_high = high
        self.day_low = low
        self.volume = volume
        self.save()

    def __str__(self):
        return f"{self.ticker} - {self.current_price}"

class Dividend(models.Model):
    ticker = models.CharField(max_length=10)
    amount = models.FloatField()
    date = models.DateField(default=now)

    def __str__(self):
        return f"{self.ticker} - ₹{self.amount} on {self.date}"

class Transaction(models.Model):
    ticker = models.CharField(max_length=10)
    trade_type = models.CharField(max_length=4, choices=[("buy", "Buy"), ("sell", "Sell")])
    quantity = models.IntegerField()
    price = models.FloatField()
    date = models.DateTimeField(default=now)

    def __str__(self):
        return f"{self.trade_type.upper()} {self.quantity} {self.ticker} @ {self.price}"

class PriceAlert(models.Model):
    ticker = models.CharField(max_length=10)
    target_price = models.FloatField()
    user_email = models.EmailField()
    notified = models.BooleanField(default=False)

    def __str__(self):
        return f"Alert for {self.ticker} at ₹{self.target_price}"