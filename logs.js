module.exports = {

    CreateLog : function (newLog, UserID, DisplayName, PlanID, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            console.log('Attempting to Insert new log...');
            req.query("INSERT INTO dbo.Logs (LogTitle, LogTagline, LogDetails, OwnerID, OwnerName, PlanID) VALUES ('" + newLog.LogTitle + "', '" + newLog.LogTagline + "', '" + newLog.LogDetails + "', '" + UserID + "', '" + DisplayName + "', '" + PlanID + "');", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Added one new project log");
                    callback();
                }
                conn.close();
            });
        });
    },

    LoadAllLogs : function (PlanID, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            console.log('Attempting to Insert new learning plan...');
            req.query("SELECT * FROM dbo.Logs WHERE PlanID = '" +PlanID+ "';", function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Added one new project log");
                    callback(recordset);
                }
                conn.close();
            });
        });
    },

    CheckLogFileStatus : function (LogTitle, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            console.log('Attempting to search for log files number');
            req.query("SELECT LogFileNumber FROM dbo.Logs WHERE LogTitle = '" +LogTitle+ "';", function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Checked log file number of a particular log");
                    callback(recordset);
                }
                conn.close();
            });
        });
    },

    AddLogFile : function (LogFilePath, LogTitle, LogNumber, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            console.log('Attempting to add new log file');
            req.query("UPDATE dbo.Logs SET LogFile_"+LogNumber+" = '"+LogFilePath+"' WHERE LogTitle = '"+LogTitle+"';", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Added one new project log");
                    callback();
                }
                conn.close();
            });
        });
    },

    LoadSinglePlanLog : function (PlanID, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            console.log('Fetching log items');
            req.query("SELECT * FROM dbo.Logs WHERE PlanID = '" +PlanID+ "';", function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Fetched logs from one entire plan");
                    callback(recordset);
                }
                conn.close();
            });
        });
    },

    UpdateLogFileStatus : function (LogTitle, Lognumber, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            var newLognumber = Lognumber + 1;
            console.log('Attempting to add new log file');
            req.query("UPDATE dbo.Logs SET LogFileNumber = '"+newLognumber+"' WHERE LogTitle = '"+LogTitle+"';", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Updated log number");
                    callback();
                }
                conn.close();
            });
        });       
    },

    UpdateLogContents : function (LogID, newLog, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            console.log('Attempting to update log content');
            req.query("UPDATE dbo.Logs SET LogTitle = '"+newLog.LogTitle+"', LogDetails = '"+newLog.LogDetails+"', LogTagline = '"+newLog.LogTagline+"' WHERE LogID = '"+LogID+"';", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Updated log content with LogID = " + LogID);
                    callback();
                }
                conn.close();
            });
        });  
    }
}