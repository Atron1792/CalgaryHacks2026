import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS
from utils.dbManager import adminCreateStartingDatabase, getSpecificData, getAllData, startUpDataValidation, getCSVDataSourceHeaders


# App setup
app = Flask(__name__)

# Allow frontend (Next.js) to call Flask during dev
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Health check
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.get("/api/barData")
def barData():
    outputValues = []
    barData = getSpecificData("traffic_acquisition","googleAnalytics4", ["Channel", "Sessions"], [False, False], "analytics")
    for row in barData:
        outputValues.append({row[0]:row[1]})
    
    return jsonify(outputValues)

# filterType = none or Marketing contact or Non-marketing contact
@app.route("/api/contactData", methods=['POST','GET'])
def contactData():
    outputValues = []
    if request.method == 'POST' or request.method == 'GET':
        filterType = request.form['filterType']
        if filterType == "none":
            outputValues = getAllData("contacts","hubSpot", "" ,"CRM")
        else:
            outputValues = getAllData("contacts","hubSpot", "'Marketing contact status' = '" + filterType + "'" ,"CRM")
        
    return jsonify(outputValues)

@app.route("/")
def index():
    notifications = startUpDataValidation()
    if notifications != True:
        numberOfNotifications = len(notifications)
        
        print("hello world")
        #send notification here

@app.route("/api/companies")
def companyData():
    outputValues = getSpecificData("companies","hubSpot", ["'Company name'"], [False], "CRM")
    return jsonify(outputValues)
    
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)