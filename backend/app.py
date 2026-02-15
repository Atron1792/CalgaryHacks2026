from flask import Flask, jsonify
from flask_cors import CORS

import os

app = Flask(__name__)

# This allows the Next.js frontend (localhost:3000) to call Flask (localhost:5000)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})

# Simple health check route
@app.get("/api/health")
def health():
    return jsonify(
        status="ok",
        service="flask-backend"
    )

# This is what the frontend will fetch
@app.get("/api/hello")
def hello():
    return jsonify(
        message="Hello from Flask!"
    )

# Only run this block if the file is executed directly
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    # Start the Flask development server
    app.run(
        host="0.0.0.0",  
        port=port,
        debug=True       # Auto-reload + better error messages
    )
