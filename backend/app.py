import sqlite3
import csv
import os
from flask import Flask, jsonify
from flask_cors import CORS


# App setup
app = Flask(__name__)

# Allow frontend (Next.js) to call Flask during dev
CORS(app, resources={r"/api/*": {"origins": "*"}})

conn = sqlite3.connect("app.db", check_same_thread=False)
dbCursor = conn.cursor()

# Initialize Google Analytics data
def init_google_analytics_data():
    """Load Google Analytics CSV into SQLite database"""
    try:
        # Check if table already exists
        dbCursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='traffic_acquisition'")
        if dbCursor.fetchone():
            print("✓ Table already exists")
            return
        
        # Create table
        dbCursor.execute("""
            CREATE TABLE traffic_acquisition (
                channel TEXT,
                sessions INTEGER,
                engaged_sessions INTEGER,
                event_count INTEGER
            )
        """)
        
        # Load CSV data
        csv_path = os.path.join(os.path.dirname(__file__), "..", "Data", "rawData", "googleAnalytics4", "googleAnalytics4-traffic_acquisition.csv")
        
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Skip Total row
                if row['Channel'] == 'Total':
                    continue
                    
                dbCursor.execute("""
                    INSERT INTO traffic_acquisition (channel, sessions, engaged_sessions, event_count)
                    VALUES (?, ?, ?, ?)
                """, (
                    row['Channel'],
                    int(row['Sessions'].replace(',', '')),
                    int(row['Engaged Sessions'].replace(',', '')),
                    int(row['Event Count'].replace(',', ''))
                ))
        
        conn.commit()
        print("✓ Google Analytics data loaded successfully")
    except Exception as e:
        print(f"Error loading data: {e}")

# Load data on startup
init_google_analytics_data()

# API endpoint for bar chart data
@app.get("/api/bar-data")
def get_bar_data():
    try:
        dbCursor.execute("""
            SELECT channel, sessions 
            FROM traffic_acquisition 
            ORDER BY sessions DESC
        """)
        rows = dbCursor.fetchall()
        
        # Format for frontend
        data = [{"label": row[0], "value": row[1]} for row in rows]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)



