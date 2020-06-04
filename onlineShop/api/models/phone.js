const mongoose = require('mongoose');

//schema for phones collection
//https://mongoosejs.com/docs/validation.html
const phoneSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  manufacturer: {type:String, required: true},
  model: {type: String, required: true},
  price: {type: String, required: true}
});

module.exports = mongoose.model('Phone', phoneSchema);
