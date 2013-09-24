/**
 * Created with IntelliJ IDEA.
 * User: munish
 * Date: 22/8/13
 * Time: 3:52 PM
 * To change this template use File | Settings | File Templates.
 */
var nodemailer = require("nodemailer");
var ejs = require('ejs');
var Constants = require('./Constants.js');
var BaasError = require("./AppError.js");

exports.sendMail = function (mailContent, credential, callback) {
    if ('function' === typeof credential) callback = credential, credential = null;
    /*Resolve Template if Exist*/
    var mailTemplate = mailContent[Constants.MailService.Options.TEMPLATE];
    if (mailTemplate) {
        var templateData = mailContent[Constants.MailService.Options.TEMPLATE_DATA];
        /*Replace tags from html with actual value from JSON if templateData exists*/
        var html = templateData ? ejs.render(mailTemplate, templateData) : mailTemplate;
        delete mailContent[Constants.MailService.Options.TEMPLATE];
        delete mailContent[Constants.MailService.Options.TEMPLATE_DATA];
        mailContent[Constants.MailService.Options.HTML] = html;
    }
    /*Now send Mail*/
    var transport = nodemailer.createTransport("SMTP", getCredentials(credential));
    transport.sendMail(mailContent, callback);
}

function getCredentials(credentail) {
    /*Default Email id to send mail*/
    var auth = {};
    auth[Constants.MailService.Credential.USER_NAME] = "admin@tasks.com";
    auth[Constants.MailService.Credential.PASSWORD] = "121212121";
    var fullCredentail = {};
    fullCredentail[Constants.MailService.Credential.SERVICE] = "Gmail";
    fullCredentail.auth = auth;

    if (credentail) {
        var userName = credentail[Constants.MailService.Credential.USER_NAME];
        if (!credentail) {
            throw new BaasError(Constants.ErrorCode.FIELDS_BLANK, [Constants.MailService.Credential.USER_NAME]);
        }
        var password = credentail[Constants.MailService.Credential.PASSWORD];
        if (password) {
            throw new BaasError(Constants.ErrorCode.FIELDS_BLANK, [Constants.MailService.Credential.PASSWORD]);
        }
        var service = credentail[Constants.MailService.Credential.SERVICE];
        if (service) {
            fullCredentail.service = service;
        }
        auth[Constants.MailService.Credential.USER_NAME] = userName;
        auth[Constants.MailService.Credential.PASSWORD] = password;
    }
    return fullCredentail;
}
