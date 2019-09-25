module.exports = {

    CreatePlan : function (newPlan , UserID, DisplayName, Email, callback) {
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
            req.query("INSERT INTO dbo.Plans (PlanTitle, PlanTopic, OwnerID, OwnerName, PlanDetails, TargetLearners, OwnerContact) VALUES ('" + newPlan.PlanTitle + "', '" + newPlan.PlanTopic + "', '" + UserID + "', '" + DisplayName + "', '" + newPlan.PlanDetails + "', '" + newPlan.TargetLearners + "', '" +Email+ "');", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Added one new learning plan");
                    console.log("The new plan title is " + newPlan.PlanTitle);
                    callback();
                }
                conn.close();
            });
        });
    },

    DeleteSpecificPlan : function (PlanID , callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("DELETE FROM dbo.Plans WHERE PlanID = '" + PlanID + "';", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Deleted One Plan");

                    callback();
                }
                conn.close();
            });
        });
    },

    UpdatePlanThumbnail : function (PlanTitle, PicturePath, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("UPDATE dbo.Plans SET PlanPicture = '" +PicturePath+ "' WHERE PlanTitle = '" +PlanTitle+ "';", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Updated Project Picture");
                    callback();
                }
                conn.close();
            });
        });
    },


    LoadAllPlans : function (callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("SELECT * FROM dbo.Plans;", function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Retrieved Plan Data");
                    callback(recordset);
                }
                conn.close();
            });
        });
    },

    LoadOwnedPlan : function (UserID, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("SELECT * FROM dbo.Plans WHERE OwnerID = '" + UserID + "';", function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Retrieved User Owned Plans");
                    callback(recordset);
                }
                conn.close();
            });
        });
    },

    LoadSpecificPlan : function (PlanTitle, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("SELECT * FROM dbo.Plans WHERE PlanTitle = '" + PlanTitle + "';", function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Retrieved Specific Plan with Title " + PlanTitle);
                    callback(recordset);
                }
                conn.close();
            });
        });
    },

    LoadSpecificPlanByID : function (PlanID, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("SELECT * FROM dbo.Plans WHERE PlanID = '" + PlanID + "';", function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Retrieved Specific Plan with ID = " + PlanID);
                    callback(recordset);
                }
                conn.close();
            });
        });
    },

    LoadAllPlansByTopics : function (UserID, PlanTopic, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("SELECT * FROM dbo.Plans WHERE PlanTopic = '" + PlanTopic + "' AND OwnerID <> '" +UserID+ "';", function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Retrieved Plans with Topic " + PlanTopic);
                    callback(recordset);
                }
                conn.close();
            });
        });
    },

    EnrollPlan : function (PlanID , UserID) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            console.log('Attempting to Insert new plan enrollment record...');
            req.query("INSERT INTO dbo.PlanEnrollment (PlanID, UserID) VALUES ('" + PlanID + "', '" + UserID + "');", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Added one new enrollment record");
                }
                conn.close();
            });
        });
    },

    LoadEnrollmentRecord : function (UserID, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("SELECT dbo.PlanEnrollment.* , dbo.Plans.* FROM dbo.PlanEnrollment LEFT JOIN dbo.Plans ON dbo.PlanEnrollment.PlanID = dbo.Plans.PlanID WHERE UserID = "+UserID+" AND dbo.PlanEnrollment.Deleted = 0 ORDER BY dbo.PlanEnrollment.PlanID;", function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Retrieved Enrollment Data and PlanData");
                    callback(recordset);
                }
                conn.close();
            });
        });
    },

    CheckDuplicateEnrollment : function (PlanID, UserID, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("SELECT * FROM dbo.PlanEnrollment WHERE UserID = '" + UserID + "' AND PlanID = '" + PlanID + "';", function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Retrieved Enrollment Data for checking duplication");
                    callback(recordset);
                }
                conn.close();
            });
        });
    },
    DeleteSpecificEnrollment : function (PlanID, UserID) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("DELETE FROM dbo.Plans WHERE PlanID = '" + PlanID + "' AND UserID = '" + UserID +"';", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Deleted One Enrollment Record.");
                }
                conn.close();
            });
        });
    },

    DeleteEnrollment : function (PlanID, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("DELETE FROM dbo.PlanEnrollment WHERE PlanID = '" + PlanID + "';", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Deleted the Enrollments of an entire plan.");
                    callback();
                }
                conn.close();
            });
        }); 
    },

    EditSpecificPlan : function (PlanID, newCHANGE, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("UPDATE dbo.Plans SET PlanTitle = '" +newCHANGE.PlanTitle+ "', PlanDetails = '" +newCHANGE.PlanDetails+ "', TargetLearners = '" +newCHANGE.TargetLearners+ "' WHERE PlanID = '" +PlanID+ "';", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Updated the Plan");
                    callback();
                }
                conn.close();
            });
        }); 
    },

    UpdatePlanBackground : function (PlanID, PicturePath, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("UPDATE dbo.Plans SET PlanBackground = '" +PicturePath+ "' WHERE PlanID = '" +PlanID+ "';", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Updated Project Background");
                    callback();
                }
                conn.close();
            });
        });
    },

    LoadAllOwnedPlans : function (OwnerID, callback) {
        var sql = require('mssql');
        var config = require('./configuration/sqlconfig');
        var conn = new sql.Connection(config);
        var req = new sql.Request(conn);
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return;
            } 
            req.query("SELECT * FROM dbo.Plans WHERE OwnerID = '" + OwnerID + "';", function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Retrieved Plans with OwnerID = " + OwnerID);
                    callback(recordset);
                }
                conn.close();
            });
        });       
    }
}