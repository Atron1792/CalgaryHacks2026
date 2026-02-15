import sqlite3
import os
import pandas as pd

# Get the directory of the current file and construct absolute paths
currentDir = os.path.dirname(os.path.abspath(__file__))
orderedDataPath = os.path.join(currentDir, "../../Data/orderedData")
rawDataPath = os.path.join(currentDir, "../../Data/rawData")

# checks if a csv attribute can be converted to integer
# returns "INTEGER" if all values can be converted, "TEXT" otherwise
def checkAttributeType(columnData):
    try:
        for value in columnData:
            int(value)
        return "INTEGER"
    except (ValueError, TypeError):
        return "TEXT"

def adminCreateStartingDatabase():
    # Process hubSpot-contacts.csv
    hubspotData = getCSVDataBreakDown("contacts", "hubSpot")
    hubspotHeaders = hubspotData[0]
    hubspotRows = hubspotData[1]
    hubspotHeaderTypes = []
    
    for i in range(len(hubspotHeaders)):
        columnData = [row[i] for row in hubspotRows]
        hubspotHeaderTypes.append(checkAttributeType(columnData))
    
    createNewTable("contacts", "hubSpot", hubspotHeaders, hubspotHeaderTypes, hubspotRows, "CRM")
    
    # Process googleAnalytics4-traffic_acquisition.csv
    ga4Data = getCSVDataBreakDown("traffic_acquisition", "googleAnalytics4")
    ga4Headers = ga4Data[0]
    ga4Rows = ga4Data[1]
    ga4HeaderTypes = []
    
    for i in range(len(ga4Headers)):
        columnData = [row[i] for row in ga4Rows]
        ga4HeaderTypes.append(checkAttributeType(columnData))
    
    createNewTable("traffic_acquisition", "googleAnalytics4", ga4Headers, ga4HeaderTypes, ga4Rows, "analytics")

# gets the list of headers and the row data list (- headers)
def getCSVDataBreakDown(tName, techStackItemName):
    
    localCSVPath = rawDataPath + "/" + techStackItemName + "/" + techStackItemName + "-" + tName + ".csv"
    
    df = pd.read_csv(localCSVPath)
    
    columns = list(df.columns)
    
    data = df.values.tolist()
    return [columns, data]

# tName: table name
# techStackItemName: software name
# tHeaders: table headers
# tData: table data
# tHeadersType: table headers data type
# tType: analytics or CRM
def createNewTable(tName, techStackItemName, tHeaders, tHeadersType, tData, tType):
    orderedDataContents = ""
    
    if(tType == "analytics"):
        orderedDataContents = os.listdir(orderedDataPath + "/analytics")
    else:
        orderedDataContents = os.listdir(orderedDataPath + "/CRM")
    
    # checks to see if database for tech item exists
    # if no: create folder 
    tableExist = False
    for techItem in orderedDataContents:
        if(techItem == techStackItemName):
            tableExist = True
            break
    
    newFolderPath = orderedDataPath + "/"+ tType +"/"+ techStackItemName
    
    if(tableExist == False):
        os.makedirs(newFolderPath, exist_ok=True)
    
    # dbConnection = ""../../Data/orderedData/{{techStackItemName}}/{{techStackItemName}}.db"
    # ps: if db file doesn't exist, it will create a new one.
    dbConnection = sqlite3.connect(newFolderPath + "/" + techStackItemName + ".db")
    dbCursor = dbConnection.cursor()
    
    # get all of the headers and data type into an sql string
    sqlHeaderString = ""
    for i in range(len(tHeaders)):
        # Quote column names to handle spaces and special characters
        quotedHeader = '"' + tHeaders[i] + '"'
        if(i == len(tHeaders)-1):
            sqlHeaderString += quotedHeader + " " + tHeadersType[i]
        else:
            sqlHeaderString += quotedHeader + " " + tHeadersType[i] + ", "
            
    # execute the sql create table using table name and header string
    dbCursor.execute("DROP TABLE IF EXISTS " + tName + ";")
    dbCursor.execute("CREATE TABLE IF NOT EXISTS " + tName + " (" + sqlHeaderString + ");")
    
    # get all of the data into an sql string
    sqlDataString = ""
    for i in range(len(tData)):
        
        sqlDataString += "("
        
        for h in range(len(tData[i])):
            # Convert value to string and handle proper SQL formatting
            value = str(tData[i][h])
            
            # If this column is TEXT type, wrap in quotes and escape single quotes
            if tHeadersType[h] == "TEXT":
                value = "'" + value.replace("'", "''") + "'"
            
            if(h == len(tData[i])-1):
                sqlDataString += value
                break
            sqlDataString += value + ","
            
        sqlDataString += ")"                        
        
        if(i != len(tData)-1):
            sqlDataString += ","
        else:
            sqlDataString += ";"
    
    # add data to new table
    dbCursor.execute("INSERT INTO " + tName + " VALUES " + sqlDataString)
    
    # commit and close the connections
    dbConnection.commit()
    dbCursor.close()
    dbConnection.close()
    

# returns true if no new data source detected 
# if new data source detected, return:
#   [[Tech stack item name, Table name], etc]
def startUpDataValidation():
    # list each folder name in raw data (tech stack name in this case)
    rawDataPathList = os.listdir(rawDataPath)
    
    # list of csv names of each raw data csv
    rawDataCSVList = []
    
    # for each tech stack item in tech stack list
    for techStackItem in rawDataPathList:
        # get the list of csv files of the tech stack item
        techStackItemTables = os.listdir(rawDataPath + "/" + techStackItem)
        
        # for each csv file
        for techStackItemTableCSV in techStackItemTables:
            # add the csv file name to the CSV List
            rawDataCSVList.append(techStackItemTableCSV)
    
    rawDataCSVList2 = []
    
    # output ex: "hubSpot-contacts.csv" -> [hubSpot, contacts]
    for rawDataCSV in rawDataCSVList:
        rawDataCSV = rawDataCSV.split("-")
        rawDataCSV[1].replace(".csv", "")
        rawDataCSVList2.append(rawDataCSV)
    
    orderedDataPathList = os.listdir(orderedDataPath)
    
    # [[Tech Item Name, table name], [Tech Item Name, table name]]
    # output ex: [hubSpot, contacts]
    orderedDataActiveList = []
    
    # for every ordered data type (analytics or CRM)
    for orderedDataType in orderedDataPathList:
        
        # get the list of folders (tech items) in that folder
        orderedDataTypeList = os.listdir(orderedDataPath + "/" + orderedDataType)
        
        # for every tech item
        for orderedDataTechItem in orderedDataTypeList:
            # ex: ../../Data/orderedData/analytics/googleAnalytics4/googleAnalytics4.db
            dbConnection = sqlite3.connect(orderedDataPath + "/" + orderedDataType + "/" + orderedDataTechItem + "/" + orderedDataTechItem + ".db")
            dbCursor = dbConnection.cursor()
            dbCursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = dbCursor.fetchall()
            if tables:
                for table_name in tables:
                    tempOutput = [orderedDataTechItem, table_name]
                    orderedDataActiveList.append(tempOutput)
                
            dbCursor.close()
            dbConnection.close()
    
    functionOutput = []
    
    for rawDataCSVItem in rawDataCSVList2:
        CSVtoDBFound = False
        for orderedDataActive in orderedDataActiveList:
            if (orderedDataActive[0] == rawDataCSVItem[0] and orderedDataActive[1] == rawDataCSVItem[1]):
                CSVtoDBFound = True
                break
            
        if CSVtoDBFound == False:
            functionOutput.append(rawDataCSVItem)
    
    if (len(functionOutput) == 0):
        return False
    
    return functionOutput
    
# tName: table name
# techStackItemName: also the same as the database name
# attributes: the list of attributes that you want
# conditions: the list of equal conditions 
# tType: analytics or CRM
def getSpecificData(tName, techStackItemName, attributes, conditions, tType):
    dbLocalPath = orderedDataPath + "/" + tType + "/" + techStackItemName +"/" + techStackItemName + ".db"
    
    dbConnection = sqlite3.connect(dbLocalPath)
    dbCursor = dbConnection.cursor()
    
    # get sql string of attributes wanted. 
    
    sqlAttributes = ""
    
    for i in range(len(attributes)):
        if (i == len(attributes)-1):
            sqlAttributes += attributes[i]
            break
        sqlAttributes += attributes[i] + ", "
    
    # get sql string of conditions set. 
    
    sqlConditions = ""
    sqlConditionsExist = False
    for condition in conditions:
        if(condition != False):
            sqlConditionsExist = True
            break
    
    if(sqlConditionsExist == True):
        sqlConditions += " WHERE "
        for i in range(len(conditions)):
            if(conditions[i] != False):
                if(sqlConditions == " WHERE "):
                    sqlConditions += attributes[i] + " = '" + conditions[i] + "'" 
                    continue
                sqlConditions += " AND " + attributes[i] + " = '" + conditions[i] + "'" 
    
    dbCursor.execute("SELECT " + sqlAttributes + " FROM " + tName + sqlConditions)
    result = dbCursor.fetchall()
    dbCursor.close()
    dbConnection.close()
    return result