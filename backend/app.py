import os
import time
import threading
import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from utils.dbManager import (
    adminResetDemo, 
    getSpecificData, 
    getAllData, 
    startUpDataValidation, 
    getCSVDataSourceHeaders,
    getCSVDataBreakDown,
    createNewTable,
    checkAttributeType,
    getTableHeaders
)


# App setup
app = Flask(__name__)

# Allow frontend (Next.js) to call Flask during dev
CORS(app, resources={r"/api/*": {"origins": "*"}})

def check_and_notify_validation():
    """Check for unintegrated data sources on startup and send notifications"""
    # Wait a bit for the frontend to be ready before sending notifications
    time.sleep(3)
    
    validation_result = startUpDataValidation()
    if validation_result != True:
        # Send error notification for each missing data source
        for missing_data in validation_result:
            tech_stack = missing_data[0]
            table_name = missing_data[1].replace(".csv", "")
            message = f"Error: {tech_stack}-{table_name} isn't setup. Check Data Validation page."
            
            # Send notification to frontend
            try:
                requests.post(
                    "http://localhost:3000/api/Notification",
                    json={
                        "message": message,
                        "type": "error",
                        "duration": 15000
                    },
                    timeout=2
                )
                print(f"Sent validation notification: {message}")
            except Exception as e:
                print(f"Failed to send notification: {message} - {e}")
        
        print(f"⚠ Found {len(validation_result)} unintegrated data source(s)")

# Health check
@app.route("/")
def index():
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
    # Handle both GET and POST requests
    filterType = request.args.get('filterType') or request.form.get('filterType') or "none"
    columns = getTableHeaders("contacts", "hubSpot", "CRM")
    
    if filterType == "none":
        outputValues = getAllData("contacts", "hubSpot", "", "CRM")
    else:
        # Use parameterized query approach for safety
        outputValues = getAllData(
            "contacts",
            "hubSpot",
            f"\"Marketing contact status\" = '{filterType}'",
            "CRM",
        )
        
    return jsonify({"columns": columns, "rows": outputValues})

@app.route("/api/companies")
def companyData():
    outputValues = getSpecificData("companies","hubSpot", ["Company name"], [False], "CRM")
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
                    # Use folder name (tech_stack) for correct casing, extract table from filename
                    # Example: folder="hubSpot", file="hubspot-contacts.csv" -> table="contacts"
                    if "-" in csv_file:
                        table_name = csv_file.split("-", 1)[1].replace(".csv", "")
                        raw_data_list.append({
                            "techStack": tech_stack,  # Use folder name, not filename
                            "table": table_name,
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
    
    
if __name__ == "__main__":
    # Reset databases to demo state (removes companies, keeps contacts & traffic_acquisition)
    adminResetDemo()
    
    # Check validation status on startup in a background thread
    validation_thread = threading.Thread(target=check_and_notify_validation, daemon=True)
    validation_thread.start()
    
    app.run(host="0.0.0.0", port=5000, debug=True)