var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Item', {
    restaurant: {type: Schema.Types.ObjectId, ref: 'Restaurant', required: true},
    name : {type: String, required: true},
    calories: {type: Number, required: true, min: [0, "Calories cannot be negative"]},
    protein: {type: Number, required: true, min: [0, "Protein cannot be negative"]},
    fat: {type: Number, required: true, min: [0, "Fat cannot be negative"]},
    carbs: {type: Number, required: true, min: [0, "Carbs cannot be negative"]}
});