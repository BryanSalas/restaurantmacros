var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Secret', {
    type: String,
    secrets: Schema.Types.Mixed
});