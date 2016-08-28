var mongoose = require('mongoose');

module.exports = mongoose.model('Restaurant', {
    _id: {type : String, default: ''},
    name : {type : String, default: ''},
    website : {type : String, default: ''}
});