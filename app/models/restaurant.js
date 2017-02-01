var mongoose = require('mongoose');

module.exports = mongoose.model('Restaurant', {
    name : {type : String, required: true},
    website : {type : String, required: true}
});