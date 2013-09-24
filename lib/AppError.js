var util = require('util')
var vm = require('vm');

var AppError = function (code, params) {
    Error.captureStackTrace(this, this);
    var msg = params ? vm.runInNewContext(code.message, {params:params}) : code.message;
    this.message = msg || 'Error';
    this.code = code.code;
}
util.inherits(AppError, Error)
AppError.prototype.name = 'App Error'



module.exports = AppError
