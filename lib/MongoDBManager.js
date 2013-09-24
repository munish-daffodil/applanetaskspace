/**
 * Created with IntelliJ IDEA. User: Administrator Date: 7/16/13 Time: 1:19 PM To change this template use File | Settings | File Templates.
 */

var MongoDB = require('mongodb');
var MongoClient = MongoDB.MongoClient;
var ObjectID = MongoDB.ObjectID;

var AppError = require("./AppError.js");
var Constants = require('./Constants.js');


var Formidable = require("formidable");

var DATABASE_URL = "mongodb://127.0.0.1:27017/tasks";
var DB;

exports.find = function (collection, query, options, callback) {
    if ('function' === typeof options)
        callback = options, options = {};
    if (!options) {
        options = {};
    }
    connect(function (err, db) {
        if (err) {
            callback(err);
            return;
        }
        var collectionObject = db.collection(collection);
        collectionObject.find(query, options).toArray(callback);
    })
};

exports.findOne = function (collection, query, options, callback) {
    if ('function' === typeof options)
        callback = options, options = {};

    connect(function (err, db) {
        if (err) {
            callback(err);
            return;
        }
        var collectionObject = db.collection(collection);
        collectionObject.findOne(query, options, callback);
    })
};

exports.insert = function (collection, inserts, callback) {
    connect(function (err, db) {
        if (err) {
            callback(err);
            return;
        }
        var collectionObject = db.collection(collection);
        collectionObject.insert(inserts, {
            w:1
        }, callback);
    })
};

exports.update = function (collection, query, updates, options, callback) {
    if ('function' === typeof options)
        callback = options, options = {};
    options.w = 1;
    connect(function (err, db) {
        if (err) {
            callback(err);
            return;
        }
        var collectionObject = db.collection(collection);
        collectionObject.update(query, updates, options, callback);
    })
};

exports.remove = function (collection, query, options, callback) {
    if ('function' === typeof options)
        callback = options, options = {};
    connect(function (err, db) {
        if (err) {
            callback(err);
            return;
        }
        var collectionObject = db.collection(collection);
        collectionObject.remove(query, {
            w:1
        }, callback);
    });
};

exports.uploadFile = function (fileName, dataArray, callback) {
    connect(ApplaneCallback(callback, function (db) {
        var objectId = new ObjectID();
        var gridStore = new GridStore(db, objectId, fileName, "w");
        gridStore.open(ApplaneCallback(callback, function () {
            Utils.iterateArray(dataArray, ApplaneCallback(callback, function () {
                gridStore.close(ApplaneCallback(callback, function () {
                    callback(null, objectId.toString());
                }));
            }), function (buffer, callback) {
                gridStore.write(buffer, callback);
            });
        }));
    }));
};

exports.downloadFile = function (fileKey, callback) {
    fileKey = new ObjectID(fileKey.toString());
    connect(ApplaneCallback(callback, function (db) {
        var gridStore = new GridStore(db, fileKey, "r");
        gridStore.open(ApplaneCallback(callback, function () {
            gridStore.seek(0, ApplaneCallback(callback, function () {
                gridStore.read(ApplaneCallback(callback, function (data) {
                    callback(null, {metadata:{filename:gridStore.filename, contentType:gridStore.contentType}, data:data});
                }));
            }));
        }));
    }));
};

exports.deleteFle = function (fileKey, callback) {
    fileKey = new ObjectID(fileKey.toString());
    connect(ApplaneCallback(callback, function (db) {
        var gridStore = new GridStore(db, fileKey, "w");
        gridStore.open(ApplaneCallback(callback, function () {
            gridStore.unlink(callback);
        }));
    }));
};


function connect(callback) {

    if (DB) {
        callback(null, DB)
    } else {
        MongoClient.connect(DATABASE_URL, function (err, db) {
            if (err) {
                callback(err);
                return;
            }
            DB = db;
            callback(null, DB);

        })
    }
}

exports.getUniqueKey = function () {
//    return new ObjectID().toString();
    return "1";
}

