import sqlite3
from flask import Flask, jsonify
from flask_cors import CORS
from utils.dbManager import adminCreateStartingDatabase

# App setup
app = Flask(__name__)

adminCreateStartingDatabase()

# Allow frontend (Next.js) to call Flask during dev
CORS(app, resources={r"/api/*": {"origins": "*"}})

conn = sqlite3.connect("app.db", check_same_thread=False)
dbCursor = conn.cursor()

# Health check
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)



