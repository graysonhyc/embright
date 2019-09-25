// Require necessary npm modules
var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var fs = require('fs-extra');
var path = require('path');
var formidable = require('formidable');
var multer = require('multer');
var azure = require('azure-storage');



var app = express();

// Set up session store redis client
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));

// Load config file for FaceBook App
var config = require('./configuration/config');

// Load all essential modules for manipulating user system
var users = require('./users');

// Load all essential modules for manipulating project system
var plans = require('./plans');

// Load all essential modules for manipulating logs system
var logs = require('./logs');

var storageAccount = 'embrightweb';
var accessKey = '9sBqlsSlUYQ9AxvkkXipUIoXbhENgf3oN4V4xd9RsxR0hItplvNQG3l9qr/z54tGFInGyFsKulB9/VAbELhRsA==';
var blobSvc = azure.createBlobService(storageAccount, accessKey);


// Functions for checking empty object fetched from Database
function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}

function isEmptyObject(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
           return false;
        }
    }
    return true;
}

// Function for processing file upload
function FileUpload (req,res,foldername,username,callback) {
    var form = new formidable.IncomingForm();
        // //Formidable uploads to operating systems tmp dir by default
        // form.uploadDir = "./public/uploads/"+username+"/"+foldername+"/";   //set upload directory    
        // console.log(form.uploadDir);
        // if (!fs.existsSync(form.uploadDir)){
        //     fs.ensureDirSync(form.uploadDir);
        // }
        form.keepExtensions = true;     //keep file extension

        form.parse(req, function(err, fields, files) {
            // console.log("form.bytesReceived");
            // //TESTING
            // console.log("file size: "+JSON.stringify(files.fileUploaded.size));
            // console.log("file path: "+JSON.stringify(files.fileUploaded.path));
            // console.log("file name: "+JSON.stringify(files.fileUploaded.name));
            // console.log("file type: "+JSON.stringify(files.fileUploaded.type));
            // console.log("astModifiedDate: "+JSON.stringify(files.fileUploaded.lastModifiedDate)); 
            // var fullpath = "/uploads/"+username+"/"+foldername+"/" + files.fileUploaded.name;      
            // console.log("This is the path to be stored in DB is " + fullpath);
            

            //Formidable changes the name of the uploaded file
            //Rename the file to its original name
            // fs.rename(files.fileUploaded.path, form.uploadDir + files.fileUploaded.name, function(err) {
            // if (err)
            //     throw err;
            //     console.log('renamed complete');  
            // });
            // callback(fullpath);

            var options = {
                contentType: files.fileUploaded.type,
                metadata: { fileName: files.fileUploaded.name }
            };
            blobSvc.createBlockBlobFromLocalFile(username, files.fileUploaded.name, files.fileUploaded.path, options, function(error, result, response) {
                if(!error){
                    // file uploaded
                }
            });
            var fullpath = "https://embrightweb.blob.core.windows.net/"+username+"/"+files.fileUploaded.name;
            callback(fullpath);
    });   
}

// Setup middleware
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser({defer: true}));

// Passport session setup.
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.authenticate('facebook', { scope: [ 'email' ] });

// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret,
    callbackURL: config.callback_url,
    profileFields: ['id', 'displayName', 'photos', 'emails', 'gender', 'name', 'profileUrl']
},
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {         
            //Check User Existence and Inseet NewUser from Facebook  
            users.fbUserExist(profile.id, profile.emails[0].value, profile.displayName, profile.gender, profile.photos[0].value, users.InsertNewfbRecord); 
            return done(null, profile);
        });
    }
));

// Start engine for rendering ejs files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use for parsing post request data
var urlencodedParser = bodyParser.urlencoded({ extended: false });


app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

// Using middleware to transfer session data to all ejs files
app.use(function(req, res, next) {
  app.locals.localuser = req.session.localuser;
  next();
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });

// Delete all sessions after logging out
app.get('/logout', function (req, res) {
    req.logout();
    delete req.session.localuser;
    res.redirect('/');
});

// Render Index.ejs (Home page) by default
app.get('/', function (req, res) {
    res.render('index', { user: req.user });
});

// Rendering Login pages
app.get('/login', function (req, res) {
    res.render('login');
});

// Handling Login Process
app.post('/loginhandle', urlencodedParser, function (req, res) {
    users.LoginSuccess(req.body, function (fetcheduser) {
        console.log(fetcheduser);
        // If a user is returned, login is successful
        if (!isEmptyObject(fetcheduser)) { 
            // Set the session for the user
            req.session.localuser = fetcheduser;
            res.render('profile', {localuser : fetcheduser});
        } else {
            res.render('login' , {err : 'Wrong Username or Password'});
        }
    });
});

// Rendering Registration pages
app.get('/registration', function (req, res) {
    res.render('registration');
});

// Handling Registration Process (Only one validation which is checking duplicate username is implemented)
app.post('/registrationhandle', urlencodedParser, function (req, res) {
    users.UserExist(req.body, function (newuser) {
        console.log(newuser);
        if(!isEmptyObject(newuser)) {
            users.InsertNewRecord(newuser, function (NEWuser) {
                users.LoginSuccess(NEWuser, function (fetcheduser) {
                    req.session.localuser = fetcheduser;
                    blobSvc.createContainerIfNotExists(fetcheduser[0].Username, {publicAccessLevel : 'container'}, function(error, result, response){
                        if(!error){
                            console.log("UserFolder is created!");
                            res.render('profile', {localuser : fetcheduser} );
                        }
                    });
                });
            });
        } else {
            res.render('registration', {err : 'This Username exists already!'});
        }
    });
});

// Rendering the chatbot (most important component)
app.get('/iframe/bot', function (req, res) {
    res.render('./iframe/bot');
});


// Rendering Profile pages
app.get('/profile', function (req, res) {
    // Check if the user is logged in
    if (req.session.localuser ||  req.user) {   
        res.render('profile', { user: req.user });
    } else {
        res.render('login', {err : 'Please login first!'});
    }
});

// Rendering Saved Projects
app.get('/iframe/savedplans', function (req, res) {
    plans.LoadEnrollmentRecord(req.session.localuser[0].UserID, function (fetchedenrollment) {
        //console.log(fetchedenrollment);
        plans.LoadAllPlans(function (fetchedplans) {
            //console.log(fetchedplans);
            res.render('./iframe/savedplans', {enrollment : fetchedenrollment , plans: fetchedplans}); 
        });
    });    
});

// Rendering Owned Projects
app.get('/iframe/ownedplans', function (req, res) {
    plans.LoadAllOwnedPlans(req.session.localuser[0].UserID, function (fetchedownedplans) {
        console.log(fetchedownedplans);
        res.render('./iframe/ownedplans', {plans: fetchedownedplans});
    });
});

// Handling Enroll Projects process
app.get('/enrollplanhandle', function (req, res) {
    console.log('The planID is ' + req.query.ID);
    plans.CheckDuplicateEnrollment(req.query.ID,req.session.localuser[0].UserID, function (fetehedenrollment) {
        if (isEmptyObject(fetehedenrollment)) {
            console.log("No duplicate enrollment. Good to go");
            plans.EnrollPlan(req.query.ID,req.session.localuser[0].UserID);
            res.render('profile');
        } else {
            req.session.enrollerr = "You have already enrolled the course!";
            res.render('profile');
        }
    });
});

// Render Create plan page
app.get('/createplan', function (req, res) {
    res.render('createplan');
});

// Handling create plan process
app.post('/createplanhandle', urlencodedParser, function (req, res) {
    console.log(req.body);
    plans.CreatePlan(req.body,req.session.localuser[0].UserID,req.session.localuser[0].DisplayName,req.session.localuser[0].Email, function () {
        res.render('addthumbnail', {PlanTitle: req.body.PlanTitle});
    });
});

// Rendering add thumbnail page
// app.get('/addthumbnail', function (req,res) {
//     res.render('addthumbnail', {PlanTitle : req.session.createdPlan});
// });

app.post('/uploadthumbnail',  function (req, res, next) {
    FileUpload(req,res,"Projects",req.session.localuser[0].Username, function (FullPath) {
        plans.UpdatePlanThumbnail(req.query.Title,FullPath, function () {
            res.redirect('plansuccess');
        });
    });
});

app.get('/plansuccess', function (req, res) {
    res.render('plansuccess');
});


// Rendering Logs page
app.get('/showresources', function (req, res) {
    res.render('showresources');
});

app.get('/iframe/resources_show', function (req, res) {
    console.log('The planID is ' + req.query.ID);
    plans.LoadSpecificPlanByID(req.query.ID, function (fetchedplans) {
        logs.LoadSinglePlanLog(req.query.ID, function (fetchedlogs) {
            res.render('./iframe/resources_show', {logs : fetchedlogs, plans: fetchedplans});
        });
    }); 
});

app.get('/iframe/resources_showplain', function (req, res) {
    console.log('The planID is ' + req.query.ID);
    plans.LoadSpecificPlanByID(req.query.ID, function (fetchedplans) {
        logs.LoadSinglePlanLog(req.query.ID, function (fetchedlogs) {
            res.render('./iframe/resources_showplain', {logs : fetchedlogs, plans: fetchedplans});
        });
    }); 
});

// Delete Plan and Delete Enrollment 
app.get('/deleteplan', function (req, res) {
    plans.DeleteEnrollment(req.query.ID, function () {
        resources.DeleteResources(req.query.ID, function () {
            plans.DeleteSpecificPlan(req.query.ID, function() {
                plans.LoadAllPlans(function (fetchedplans) {
                    if (req.session.enrollerr) {
                        res.render('./iframe/directory', {plans: fetchedplans, err:req.session.enrollerr});
                    } else {
                        res.render('./iframe/directory', {plans: fetchedplans});
                    }
                });
            });
        });
    });  
});

app.get('/deleteenrollment', function (req, res) {
    plans.DeleteEnrollment(req.query.ID, req.session,localuser[0].UserID);
    res.render('profile');
});

// Showing Directory for project
app.get('/show_directory', function (req, res) {
    res.render('show_directory');
});

app.get('/iframe/directory', function (req, res) {
    res.render('./iframe/directory');
});

// Media Production
app.get('/showmediaproductionplans', function (req, res) {
    res.render('showmediaproductionplans');
});

app.get('/iframe/mediaproductionplans', function (req, res) {
    plans.LoadAllPlansByTopics(req.session.localuser[0].UserID, "Media Production", function (fetchedplans) {
        res.render('./iframe/mediaproductionplans', { plans: fetchedplans });
    });
});

// Graphic Design
app.get('/showgraphicdesignplans', function (req, res) {
    res.render('showgraphicdesignplans');
});

app.get('/iframe/graphicdesignplans', function (req, res) {
    plans.LoadAllPlansByTopics(req.session.localuser[0].UserID, "Graphic Design", function (fetchedplans) {
        res.render('./iframe/graphicdesignplans', { plans: fetchedplans });
    });
});

// Photography
app.get('/showphotographyplans', function (req, res) {
    res.render('showphotographyplans');
});

app.get('/iframe/photographyplans', function (req, res) {
    plans.LoadAllPlansByTopics(req.session.localuser[0].UserID, "Photography", function (fetchedplans) {
        res.render('./iframe/photographyplans', { plans: fetchedplans });
    });
});

// Garage
app.get('/showgarageplans', function (req, res) {
    res.render('showgarageplans');
});

app.get('/iframe/garageplans', function (req, res) {
    plans.LoadAllPlansByTopics(req.session.localuser[0].UserID, "Garage", function (fetchedplans) {
        res.render('./iframe/garageplans', { plans: fetchedplans });
    });
});

// Handling log processing
app.get('/addlog', function (req, res) {
    plans.LoadSpecificPlan(req.query.Title, function (fetchedplans) {
            res.render('addlog', {plans : fetchedplans});
    });
});

app.post('/addloghandle', function (req, res) {
    logs.CreateLog(req.body, req.session.localuser[0].UserID, req.session.localuser[0].DisplayName, req.query.ID, function () {
        res.render('logsuccess');
    });
});

app.get('/addlogfile', function (req, res) {
    res.render('addlogfile', {LogTitle : req.query.Title});
});

app.post('/addlogfilehandle', function (req, res) {
    logs.CheckLogFileStatus(req.query.Title, function (Lognumber) {
        console.log(req.query.Title);
        console.log(Lognumber[0].LogFileNumber);
        console.log("Logfile_"+Lognumber[0].LogFileNumber);
        FileUpload(req,res,"LogFiles",req.session.localuser[0].Username, function (Fullpath) {
            logs.AddLogFile(Fullpath, req.query.Title, Lognumber[0].LogFileNumber, function () {
                logs.UpdateLogFileStatus(req.query.Title,Lognumber[0].LogFileNumber, function (){
                    res.render('filesuccess');
                });
            });
        });
    });
});

app.get('/filesuccess', function (req, res) {
    res.render('filesuccess');
});

// Rendering edit log page
app.get('/editlog', function (req, res) {
    res.render('editlog', 
    {LogID : req.query.ID, OriginalTitle: req.query.OriginalTitle, OriginalTagline: req.query.OriginalTagline, OriginalDetails : req.query.OriginalDetails});
});

app.post('/editloghandle', function (req, res) {
    logs.UpdateLogContents(req.query.ID, req.body, function () {
        res.render('profile');
    });
});

// Rendering edit plan page
app.get('/editplan', function (req, res) {
    res.render('editplan', 
    {PlanID : req.query.ID, OriginalTitle: req.query.OriginalTitle,  OriginalDetails : req.query.OriginalDetails,  OriginalTargetLearners : req.query.OriginalTargetLearners});
});

app.post('/editplanhandle', function (req, res) {
    plans.EditSpecificPlan(req.query.ID, req.body, function () {
        res.render('profile');
    });
});

app.get('/addbackground', function (req, res) {
    res.render('addbackground', {PlanID : req.query.ID});
});

// Add background image page
app.post('/addbackgroundhandle', function (req, res, next) {
    FileUpload(req,res,"Projects",req.session.localuser[0].Username, function (FullPath) {
        plans.UpdatePlanBackground(req.query.ID,FullPath, function () {
            res.redirect('profile');
        });
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

app.listen(1337);
module.exports = app;