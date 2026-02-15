import sqlite3
import os

orderedDataPath = "../../Data/orderedData"
rawDataPath = "../../Data/rawData"

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
    
    # dbConnection = ""../../Data/orderedData/{{techItem}}/{{techItem}}.db"
    # ps: if db file doesn't exist, it will create a new one.
    dbConnection = sqlite3.connect(newFolderPath + "/" + techItem + ".db")
    dbCursor = dbConnection.cursor()
    
    # get all of the headers and data type into an sql string
    sqlHeaderString = ""
    for i in range(len(tHeaders)):
        if(i == len(tHeaders)):
            sqlHeaderString += tHeaders[i] + " " + tHeadersType
        else:
            sqlHeaderString += tHeaders[i] + " " + tHeadersType + ","
            
    # execute the sql create table using table name and header string
    dbCursor.execute("CREATE TABLE " + tName + " (" + sqlHeaderString + ");")
    
    # get all of the data into an sql string
    sqlDataString = ""
    for i in range(len(tData)):
        
        sqlDataString += "("
        
        for h in range(len(tData[i])):
            if(h == len(tData[i])):
                sqlDataString += tData[i][h]
                break
            sqlDataString += tData[i][h] + ","
            
        sqlDataString += ")"                        
        
        if(i != len(tData)):
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
#   [Tech stack item name, Table name, [header1, header2, etc], case 1 or 2]
def startUpDataValidation():
    rawDataTechStackItem = os.listdir(rawDataPath)
    
# tName: table name
# techStackItemName: also the same as the database name
# attributes: the list of attributes that you want
# conditions: the list of equal conditions 
# tType: analytics or CRM
def getSpecificData(tName, techStackItemName, attributes, conditions, tType):
    dbLocalPath = orderedDataPath + "/" + tType + "/" + techStackItemName + ".db"
    
    dbConnection = sqlite3.connect(dbLocalPath)
    dbCursor = dbConnection.cursor()
    
    # get sql string of attributes wanted. 
    
    sqlAttributes = ""
    
    for i in range(len(attributes)):
        if (i == len(attributes)):
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
                if(sqlConditions == ""):
                    sqlConditions += attributes[i] + " = '" + conditions[i] + "'" 
                    continue
                sqlConditions += "AND " + attributes[i] + " = '" + conditions[i] + "'" 
    
    dbCursor.execute("SELECT " + sqlAttributes + " FROM " + tName + sqlConditions)
    result = dbCursor.fetchall()
    dbCursor.close()
    dbConnection.close()
    return result