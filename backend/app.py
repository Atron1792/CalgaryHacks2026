import sqlite3
from flask import Flask, jsonify
from flask_cors import CORS
from utils.dbManager import adminCreateStartingDatabase, getSpecificData
import json


# App setup
app = Flask(__name__)

# Allow frontend (Next.js) to call Flask during dev
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Health check
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

@app.route("/api/barData")
def barData():
    outputValues = []
    barData = getSpecificData("traffic_acquisition","googleAnalytics4", ["Channel", "Sessions"], [False, False], "analytics")
    for row in barData:
        outputValues.append({row[0]:row[1]})
        
    return json.dumps(outputValues)