var Constants = require("./Constants.js");
var DataBaseManager = require("./MongoDBManager.js");
var AppError = require("./AppError.js");
var CACHE = {"1":"rohit"};

exports.login = function (req, callback) {
    var emailId = req.param(Constants.User.EMAIL_ID);
    var password = req.param(Constants.User.PASSWORD);
    if (!emailId || !password) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, ["EmailId and Password"]));
        return;
    }
    var query = {};
    query[Constants.User.EMAIL_ID] = emailId.trim().toLowerCase();
    query[Constants.User.PASSWORD] = password;
    var options = {};
    options[Constants.User.EMAIL_ID] = 1;
    options[Constants.User.NAME] = 1;

    DataBaseManager.findOne(Constants.User.COLLECTION, query, options, function (err, user) {
        if (err) {
            callback(err);
        } else if (!user) {
            callback(new AppError(Constants.ErrorCode.User.CREDENTIAL_MISSMATCH));
        } else {
            user.login = true;
            var accessToken = DataBaseManager.getUniqueKey();
            CACHE[accessToken] = user[Constants.User.EMAIL_ID];
            user.access_token = accessToken;
            callback(null, user);
        }

    })

};


exports.signUp = function (req, callback) {
    var emailId = req.param(Constants.User.EMAIL_ID);
    var password = req.param(Constants.User.PASSWORD);
    var name = req.param(Constants.User.NAME);
    if (!emailId || !password) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, ["EmailId and Password"]));
        return;
    }
    if (!name) {
        name = emailId;
    }
    emailId = emailId.trim().toLowerCase();
    name = name.trim();
    var insert = {};
    insert[Constants.User.EMAIL_ID] = emailId;
    insert[Constants.User.PASSWORD] = password;
    insert[Constants.User.NAME] = name;
    DataBaseManager.insert(Constants.User.COLLECTION, insert, function (err, data) {
        if (err) {
            callback(err);
        } else {
            var dataCount = data ? data.length : 0;
            if (dataCount == 0) {
                var user = data[0];
                delete user[Constants.User.PASSWORD];
                delete user[Constants.User._ID];
                user.signup = true;
                callback(user);

            } else {
                callback(new AppError(Constants.ErrorCode.User.CREDENTIAL_MISSMATCH));
            }

        }

    })

};

exports.getUser = function (accessToken, callback) {
    if (!accessToken) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, [Constants.User.ACCESS_TOKEN]));
        return;
    }
    var currentUser = CACHE[accessToken];
    if (!currentUser) {
        callback(new AppError(Constants.ErrorCode.INVALID_ACCESS_TOKEN));
        return;
    }
    callback(null, currentUser);
}

exports.logout = function (accessToken, callback) {
    if (!accessToken) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, [Constants.User.ACCESS_TOKEN]));
        return;
    }
    delete CACHE[accessToken];
    callback(null, {logout:true});
}
