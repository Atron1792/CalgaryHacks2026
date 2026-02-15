import sqlite3
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from utils.dbManager import adminResetDemo, getSpecificData, getAllData, startUpDataValidation, getCSVDataSourceHeaders
import requests


# App setup
app = Flask(__name__)

# Allow frontend (Next.js) to call Flask during dev
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Health check
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

adminResetDemo()

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
    validation_result = startUpDataValidation()
    if validation_result != True:
        # Send error notification for each missing data source
        for missing_data in validation_result:
            tech_stack = missing_data[0]
            table_name = missing_data[1].replace(".csv", "")
            message = f"Error: {tech_stack}-{table_name} isn't setup in {tech_stack}.db. Check Data Validation page."
            
            # Send notification to frontend
            try:
                requests.post(
                    "http://localhost:3000/api/Notification",
                    json={
                        "message": message,
                        "type": "error",
                        "duration": 10000
                    },
                    timeout=2
                )
            except:
                print(f"Failed to send notification: {message}")
    
    return jsonify({"status": "ok", "validation": validation_result})

@app.route("/api/companies")
def companyData():
    outputValues = getSpecificData("companies","hubSpot", ["'Company name'"], [False], "CRM")
    return jsonify(outputValues)

@app.route("/api/validation/raw-data")
def get_raw_data_sources():
    """Returns list of all raw CSV data sources available"""
    raw_data_path = os.path.join(os.path.dirname(__file__), "../Data/rawData")
    raw_data_list = []
    
    for tech_stack in os.listdir(raw_data_path):
        tech_path = os.path.join(raw_data_path, tech_stack)
        if os.path.isdir(tech_path):
            for csv_file in os.listdir(tech_path):
                if csv_file.endswith(".csv"):
                    # Parse "hubSpot-contacts.csv" -> {techStack: "hubSpot", table: "contacts"}
                    parts = csv_file.replace(".csv", "").split("-", 1)
                    if len(parts) == 2:
                        raw_data_list.append({
                            "techStack": parts[0],
                            "table": parts[1],
                            "fileName": csv_file
                        })
    
    return jsonify(raw_data_list)

@app.route("/api/validation/ordered-data")
def get_ordered_data_sources():
    """Returns list of all integrated data sources in orderedData"""
    ordered_data_path = os.path.join(os.path.dirname(__file__), "../Data/orderedData")
    ordered_data_list = []
    
    for data_type in os.listdir(ordered_data_path):
        type_path = os.path.join(ordered_data_path, data_type)
        if os.path.isdir(type_path):
            for tech_stack in os.listdir(type_path):
                tech_path = os.path.join(type_path, tech_stack)
                if os.path.isdir(tech_path):
                    db_file = os.path.join(tech_path, f"{tech_stack}.db")
                    if os.path.exists(db_file):
                        conn = sqlite3.connect(db_file)
                        cursor = conn.cursor()
                        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                        tables = cursor.fetchall()
                        for table in tables:
                            ordered_data_list.append({
                                "techStack": tech_stack,
                                "table": table[0],
                                "dataType": data_type
                            })
                        cursor.close()
                        conn.close()
    
    return jsonify(ordered_data_list)

@app.route("/api/validation/status")
def get_validation_status():
    """Returns current validation status and missing integrations"""
    validation_result = startUpDataValidation()
    
    if validation_result == True:
        return jsonify({
            "allIntegrated": True,
            "missing": []
        })
    else:
        missing = []
        for item in validation_result:
            missing.append({
                "techStack": item[0],
                "table": item[1].replace(".csv", "")
            })
        return jsonify({
            "allIntegrated": False,
            "missing": missing
        })

@app.route("/api/validation/integrate", methods=["POST"])
def integrate_data_source():
    """Integrates a raw data source into orderedData"""
    data = request.get_json()
    tech_stack = data.get("techStack")
    table_name = data.get("table")
    data_type = data.get("dataType", "CRM")  # Default to CRM
    
    try:
        # Get CSV data
        csv_data = getCSVDataBreakDown(table_name, tech_stack)
        headers = csv_data[0]
        rows = csv_data[1]
        
        # Determine column types
        header_types = []
        for i in range(len(headers)):
            column_data = [row[i] for row in rows]
            header_types.append(checkAttributeType(column_data))
        
        # Create the table
        createNewTable(table_name, tech_stack, headers, header_types, rows, data_type)
        
        # Send success notification
        try:
            requests.post(
                "http://localhost:3000/api/Notification",
                json={
                    "message": f"Successfully integrated {tech_stack}-{table_name}",
                    "type": "success",
                    "duration": 5000
                },
                timeout=2
            )
        except:
            pass
        
        return jsonify({"success": True, "message": "Data source integrated successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

from utils.dbManager import getCSVDataBreakDown, createNewTable, checkAttributeType
    
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)