var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Item', {
    restaurant: {type: Schema.Types.ObjectId, ref: 'Restaurant'},
    name : {type: String, default: ''},
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number
});