var Constants = require("./Constants.js");
var DataBaseManager = require("./MongoDBManager.js");
var AppError = require("./AppError.js");
var MailService = require("./MailService.js");
var ObjectID = require('mongodb').ObjectID;



exports.createTask = function (req, callback) {
    var user = req._user;
    var task = trimValue(req.param(Constants.Task.TASK));
    if (!task) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, ["Task"]));
        return;
    }

    var description = trimValue(req.param(Constants.Task.DESCRIPTION));
    var priority = validatePriority(trimValue(req.param(Constants.Task.PRIORITY)));
    var owner = trimValue(req.param(Constants.Task.OWNER));


    var index = getPriorityIndex(priority);

    if (!owner) {
        owner = user;
    }
    owner = owner.trim().toLowerCase();

    var watches = [owner];
    if (owner != user) {
        watches.push(user);
    }

    var newTask= {};
    newTask[Constants.Task.TASK] = task;
    newTask[Constants.Task.DESCRIPTION] = description;
    newTask[Constants.Task.CREATOR] = user;
    newTask[Constants.Task.OWNER] = owner;
    newTask[Constants.Task.STATUS] = Constants.Task.Status.NEW;
    newTask[Constants.Task.PRIORITY] = priority;
    newTask[Constants.Task.INDEX] = index;
    newTask[Constants.Task.WATCHES] = watches;
    newTask[Constants.Task.COMMENTS] = [];
    newTask[Constants.Task.CREATEDON] = new Date();

    DataBaseManager.insert(Constants.Task.COLLECTION, newTask, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
//        if (owner != user) {
//            var mailOptions = {};
//            mailOptions[Constants.MailService.Options.TO] = owner;
//            mailOptions[Constants.MailService.Options.SUBJECT] = Constants.MailTemplates.TaskAssignedMail.SUBJECT;
//            mailOptions[Constants.MailService.Options.TEMPLATE] = Constants.MailTemplates.TaskAssignedMail.TEMPLATE;
//            mailOptions[Constants.MailService.Options.TEMPLATE_DATA] = task;
//            MailService.sendMail(mailOptions);
//        }
        callback(null, result[0]);
    });
};


exports.getTasks = function (req, callback) {
    var user = req._user;
    var query = {};
    query[Constants.Task.WATCHES] = user;
    DataBaseManager.find(Constants.Task.COLLECTION, query, callback);

}

exports.addComment = function (req, callback) {
    var user = req._user;
    var taskId = req.param(Constants.ServiceParams.TASK_ID);
    if (!taskId) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, [Constants.ServiceParams.TASK_ID]));
        return;
    }
    var comment = trimValue(req.param(Constants.Task.Comments.COMMENT));
    if (!comment) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, [Constants.Task.Comments.COMMENT]));
        return;
    }


    $push = {};
    $push[Constants.Task.COMMENTS] = {_id : DataBaseManager.getUniqueKey().toString()};
    $push[Constants.Task.COMMENTS][Constants.Task.Comments.COMMENT] = comment;
    $push[Constants.Task.COMMENTS][Constants.Task.Comments.DATE] = new Date();
    $push[Constants.Task.COMMENTS][Constants.Task.Comments.CREATOR] = user

    var update = {}
    update.$push = $push;

    var query = {_id:new ObjectID(taskId)};
    DataBaseManager.update(Constants.Task.COLLECTION, query, update, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, result);
    });


}
exports.removeComment = function (req, callback) {
    var user = req._user;
    var taskId = req.param(Constants.ServiceParams.TASK_ID);
    if (!taskId) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, [Constants.ServiceParams.TASK_ID]));
        return;
    }


    var commentId = req.param(Constants.ServiceParams.COMMENT_ID);
    if (!commentId) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, [Constants.ServiceParams.COMMENT_ID]));
        return;
    }

    $pull = {};
    $pull[Constants.Task.COMMENTS] = {_id:commentId};


    var update = {}
    update.$pull = $pull;

    var query = {_id:new ObjectID(taskId)};
    DataBaseManager.update(Constants.Task.COLLECTION, query, update, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, result);
    });
}


exports.addWatch = function (req, callback) {
    var user = req._user;
    var taskId = req.param(Constants.ServiceParams.TASK_ID);
    if (!taskId) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, [Constants.ServiceParams.TASK_ID]));
        return;
    }
    var $addToSet = {};
    $addToSet[Constants.Task.WATCHES] = user;

    var update = {}
    update.$addToSet = $addToSet;

    var query = {_id:new ObjectID(taskId)};
    DataBaseManager.update(Constants.Task.COLLECTION, query, update, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, result);
    });


}

exports.removeWatch = function (req, callback) {
    var user = req._user;
    var taskId = req.param(Constants.ServiceParams.TASK_ID);
    if (!taskId) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, [Constants.ServiceParams.TASK_ID]));
        return;
    }


    $pull = {};
    $pull[Constants.Task.WATCHES] = user;


    var update = {}
    update.$pull = $pull;

    var query = {_id:new ObjectID(taskId)};
    DataBaseManager.update(Constants.Task.COLLECTION, query, update, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, result);
    });


}
exports.updateTask = function (req, callback) {
    var user = req._user;
    var taskId = req.param(Constants.ServiceParams.TASK_ID);
    if (!taskId) {
        callback(new AppError(Constants.ErrorCode.FIELDS_BLANK, [Constants.ServiceParams.TASK_ID]));
        return;
    }

    var query = {_id:new ObjectID(taskId)};

    DataBaseManager.findOne(Constants.Task.COLLECTION, query, function (err, taskInfo) {
        if (!taskInfo) {
            callback(new AppError(Constants.ErrorCode.TASK_DOES_NOT_EXISTS, [taskId]));
            return;
        }
        var $set = {};
        var $addToSet = {};
        var task = trimValue(req.param(Constants.Task.TASK));
        if (task) {
            $set[Constants.Task.TASK] = task;
        }

        var description = trimValue(req.param(Constants.Task.DESCRIPTION));
        if (description) {
            $set[Constants.Task.DESCRIPTION] = description;
        }

        var status = validateStatus(trimValue(req.param(Constants.Task.STATUS)));
        if (status) {
            $set[Constants.Task.STATUS] = status;
            if (status == Constants.Task.Status.COMPLETED) {
                $set[Constants.Task.COMPLETEDON] = new Date();
            }
        }
        var priority = (trimValue(req.param(Constants.Task.PRIORITY)));
        if (priority) {
            priority = validatePriority(priority);
            $set[Constants.Task.PRIORITY] = priority;
            $set[Constants.Task.PriorityIndex] = getPriorityIndex(priority);
        }
        var owner = trimValue(req.param(Constants.Task.OWNER));
        var oldOwner = taskInfo[Constants.Task.OWNER];

        if (owner && owner != oldOwner) {
            //create user if not exists
//            createUser(owner);
            $set[Constants.Task.OWNER] = owner;

            $addToSet[Constants.Task.WATCHES] = owner;
        }

        if (Object.keys($set) == 0) {
            callback(null, $set);
            return;
        }

        var update = {};
        update.$set = $set;
        if (Object.keys($addToSet).length > 0) {
            update.$addToSet = $addToSet;
        }

        console.log("Updates>>>" + JSON.stringify(update));
        DataBaseManager.update(Constants.Task.COLLECTION, query, update, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, result);
        });

    });


};

validatePriority = function (priority) {
    //TODO we can add more priority later
    if (!priority) {
        return Constants.Task.Priority.LOW;
    } else if (Constants.Task.Priority.BLOCKER == priority) {
        return Constants.Task.Priority.BLOCKER;
    }  else if (Constants.Task.Priority.MEDIUM == priority) {
        return Constants.Task.Priority.MEDIUM;
    } else {
        return Constants.Task.Priority.LOW;
    }
}

validateStatus = function (status) {
    if (!status) {
        return;
    } else if (Constants.Task.Status.IN_PROGRESS == status) {
        return Constants.Task.Status.IN_PROGRESS;
    } else if (Constants.Task.Status.NEW == status) {
        return Constants.Task.Status.NEW;
    } else if (Constants.Task.Status.COMPLETED == status) {
        return Constants.Task.Status.COMPLETED;
    }
}

getPriorityIndex = function (priority) {
    return Constants.Task.PriorityIndex[priority];
}
trimValue = function (value) {
    return value ? value.trim() : value;
}

