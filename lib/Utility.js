exports.isEmailId = function(email) {
    var exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return new RegExp(exp).test(email)
}