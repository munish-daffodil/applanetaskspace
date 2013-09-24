exports.ErrorCode = new function () {
    this.UNKNOWN_ERROR = {code:17, message:"Unknown error took place."};
    this.EMAIL_NOT_VALID = {code:8, message:"'Please provide valid emailid['+params[0]+']'"};
    this.FIELDS_BLANK = {code:5, message:"'Please provide values of mandatory parameters['+params[0]+']'"};
    this.TASK_DOES_NOT_EXISTS = {code:7, message:"'Task does not exist['+params[0]+']'"};
    this.INVALID_ACCESS_TOKEN = {code:6, message:"Invalid access_token"};
    this.FIELDS_BLANK_IN_OBJECT = {code:29, message:"'Please provide values of mandatory parameters['+params[0]+'] in '+params[1]+'['+params[2]+']'"};
    this.DATABASE_NOT_FOUND = {code:25, message:"Database not found"};

    this.User = new function () {
        this.USER_NOT_FOUND = {code:1, message:"User Not Found."};
        this.CREDENTIAL_MISSMATCH = {code:3, message:"EmailId/Password did not match."};
        this.UNABLE_TO_SIGNUP = {code:4, message:"Unable to signup."};


    }
}
exports.User = new function () {
    this.COLLECTION = "users";
    this.ACCESS_TOKEN = "access_token";
    this.EMAIL_ID = "emailid";
    this.PASSWORD = "password";
    this._ID = "_id";
    this.NAME = "name";
}

exports.Task = new function () {
    this.COLLECTION = "tasks";
    this._ID = "_id";
    this.TASK = "task";
    this.DESCRIPTION = "description";
    this.PRIORITY = "priority";
    this.Priority = new function () {
        this.BLOCKER = "Blocker";
        this.LOW = "Low";
    }
    this.PriorityIndex = {"Blocker":5, "Low":1};
    this.INDEX = "index";
    this.OWNER = "owner";
    this.CREATOR = "creator";
    this.CREATEDON = "createdon";
    this.COMPLETEDON = "completedon";
    this.WATCHES = "watches";
    this.STATUS = "status";
    this.Status = new function () {
        this.NEW = "new";
        this.IN_PROGRESS = "inprogress";
        this.COMPLETED = "completed";
        this.REJECTED = "rejected";
    }


    this.COMMENTS = "comments";
    this.Comments = new function () {
        this.COMMENT = "comment";
        this.DATE = "date";
        this.CREATOR = "creator";
    }


}

exports.ServiceParams = new function(){
    this.COMMENT_ID = "commentid";
    this.TASK_ID = "taskid";
}

exports.DataBase = new function () {
    this.DB = "tasks";

}

exports.MailService = new function () {
    this.Credential = new function () {
        this.USER_NAME = "user";
        this.PASSWORD = "pass";
        this.SERVICE = "service";
    };
    this.Options = new function () {
        this.FROM = "from";
        this.TO = "to";
        this.CC = "cc";
        this.BCC = "bcc";
        this.SUBJECT = "subject";
        this.TEXT = "text";
        this.HTML = "html"
        this.TEMPLATE = "template";
        this.TEMPLATE_DATA = "templatedata";
        this.ATTACHMENTS = "attachments";
        this.AttachmentOptions = new function () {
            this.FILE_NAME = "fileName";
            this.CONTENTS = "contents";
            this.CONTENT_TYPE = "contentType";
            this.CID = "cid";
        };
    };
}

exports.MailTemplates = new function () {
    this.TaskAssignedMail = new function () {
        var SUBJECT = "New Task Assigned";
        var TEMPLATE = "";
    };
}
