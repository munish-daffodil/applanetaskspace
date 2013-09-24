var Constants = require("./Constants.js");
var DataBaseManager = require("./MongoDBManager.js");
var AppError = require("./AppError.js");
var Utility = require("./Utility.js");
var SESSION = {};   // Later on we can persist session in database


exports.login = function (req, callback) {
    var emailId = req.param(Constants.User.EMAIL_ID);
    var password = req.param(Constants.User.PASSWORD);
    if (!emailId || !password) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, ["Email and Password"]));
        return;
    }
    var query = {};
    query[Constants.User.EMAIL_ID] = emailId.trim().toLowerCase();
    //TODO password should be in ecrypted form
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
            //session handling
            var accessToken = DataBaseManager.getUniqueKey();
            SESSION[accessToken] = user[Constants.User.EMAIL_ID];
            user.access_token = accessToken;
            callback(null, user);
        }

    })

};


exports.signUp = function (req, callback) {
    var emailId = req.param(Constants.User.EMAIL_ID);
    var password = req.param(Constants.User.PASSWORD);
    //TODO password should be in ecrypted form
    var name = req.param(Constants.User.NAME);
    if (!emailId || !password) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, ["Email and Password"]));
        return;
    }
    if (!name) {
        name = emailId;
    }
    emailId = emailId.trim().toLowerCase();
    var validEmail = Utility.isEmailId(emailId);
    if(!validEmail){
        callback(new AppError(Constants.ErrorCode.EMAIL_NOT_VALID, [emailId]));
        return;
    }
    name = name.trim();
    var newUser = {};
    newUser[Constants.User.EMAIL_ID] = emailId;
    newUser[Constants.User.PASSWORD] = password;
    newUser[Constants.User.NAME] = name;
    DataBaseManager.insert(Constants.User.COLLECTION, newUser, function (err, data) {
        if (err) {
            callback(err);
        } else {

                var user = data[0];
                delete user[Constants.User.PASSWORD];
                delete user[Constants.User._ID];
                user.signup = true;
                callback(null,user);


        }

    })

};

exports.getUser = function (accessToken, callback) {
    if (!accessToken) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, [Constants.User.ACCESS_TOKEN]));
        return;
    }
    var currentUser = SESSION[accessToken];
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
    delete SESSION[accessToken];
    callback(null, {logout:true});
}
