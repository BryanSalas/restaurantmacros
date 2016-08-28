// grab the mongoose module
var mongoose = require('mongoose');

module.exports = mongoose.model('ApiKey', {
    _id : {type : String, default: ''},
    appKey: {type : String, default: ''}
});