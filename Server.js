var jsonResponseType = {"Content Type":"application/json", "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"GET, POST, OPTIONS", "Access-Control-Allow-Credentials":true, "SET-COOKIE":"rohit=bansal"};
var express = require('express');
var app = express();
var urlParser = require('url');
var Constants = require("./lib/Constants.js");
var DataBaseManager = require("./lib/MongoDBManager.js");
var UserService = require("./lib/UserService.js");
var TaskService = require("./lib/TaskService.js");
var AppError = require("./lib/AppError.js");


process.on('uncaughtException', function (err) {
    //TODO handling pending
    console.log("Uncaught Exception : " + err.stack);
});

// filters
//add express body parser
app.use(express.bodyParser());

//check if user is login
app.use(function (req, res, next) {
    var url = urlParser.parse(req.url, true);
    if (url.pathname == "/login" || url.pathname == "/signup") {
        next();
    } else {
        var accessToken = req.param(Constants.User.ACCESS_TOKEN);
        if (!accessToken) {
            writeJSONResponse(res, new AppError(Constants.ErrorCode.User.USER_NOT_FOUND));
            return;
        }
        UserService.getUser(accessToken, function (err, user) {
            if (!user) {
                writeJSONResponse(res, new AppError(Constants.ErrorCode.User.USER_NOT_FOUND));
                return;
            }
            req._user = user;
            next();
        });
    }
});

app.all("/login", function (req, res) {
    UserService.login(req, function (err, data) {
        writeJSONResponse(res, (err || data));
    });
});

app.all("/signup", function (req, res) {
    UserService.signUp(req, function (err, data) {
        writeJSONResponse(res, (err || data));
    });
});

app.all("/logout", function (req, res) {
    UserService.logout(req.param(Constants.User.ACCESS_TOKEN), function (err, data) {
        writeJSONResponse(res, (err || data));
    })
});

app.all("/createtask", function (req, res) {
    TaskService.createTask(req, function (err, task) {
        writeJSONResponse(res, (err || task));
    })
});

app.all("/updatetask", function (req, res) {
    TaskService.updateTask(req, function (err, task) {
        writeJSONResponse(res, (err || task));
    })
});

app.all("/tasks", function (req, res) {
    TaskService.getTasks(req, function (err, task) {
        writeJSONResponse(res, (err || task));
    })
});

app.all("/addcomment", function (req, res) {
    TaskService.addComment(req, function (err, task) {
        writeJSONResponse(res, (err || task));
    })
});

app.all("/removecomment", function (req, res) {
    TaskService.removeComment(req, function (err, task) {
        writeJSONResponse(res, (err || task));
    })
});


app.all("/addwatch", function (req, res) {
    TaskService.addWatch(req, function (err, task) {
        writeJSONResponse(res, (err || task));
    })
});

app.all("/removewatch", function (req, res) {
    TaskService.removeWatch(req, function (err, task) {
        writeJSONResponse(res, (err || task));
    })
});


app.listen(8089);

function writeJSONResponse(res, result) {
    if (result instanceof AppError) {
        res.writeHead(417, jsonResponseType);
        res.write(JSON.stringify({response:result.message, status:"error", code:result.code}));
    } else if (result instanceof Error) {
        res.writeHead(417, jsonResponseType);
        res.write(JSON.stringify({response:Constants.ErrorCode.UNKNOWN_ERROR.message, status:"error", code:Constants.ErrorCode.UNKNOWN_ERROR.code}));
    } else {
        res.writeHead(200, jsonResponseType);
        res.write(JSON.stringify({response:result, status:"ok", code:200}));
    }
    res.end();
}

