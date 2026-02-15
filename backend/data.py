# In-memory mock data (replace with a real DB later)
ADS = [
    {"id": 1, "advertiser": "Acme Marketing", "campaign": "Holiday Push", "platform": "display", "region": "US"},
    {"id": 2, "advertiser": "Nova Ads", "campaign": "Spring Refresh", "platform": "video", "region": "EU"},
]

METRICS = [
    {"ad_id": 1, "date": "2024-01-01", "impressions": 1000, "clicks": 50, "spend": 10.0, "revenue": 12.0},
    {"ad_id": 1, "date": "2024-01-02", "impressions": 1100, "clicks": 55, "spend": 11.0, "revenue": 13.0},
    {"ad_id": 2, "date": "2024-01-01", "impressions": 800, "clicks": 40, "spend": 8.0, "revenue": 9.5},
    {"ad_id": 2, "date": "2024-01-02", "impressions": 850, "clicks": 42, "spend": 8.5, "revenue": 10.0},
]