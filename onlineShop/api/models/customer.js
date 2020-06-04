const mongoose = require('mongoose');

//schema for customers collection
//https://mongoosejs.com/docs/validation.html
const customerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  Title: {type:String, required: true},
  fname: {type: String, required: true},
  lname: {type: String, required: true},
  email: {type: String, required: true},
  mobile: {type: String, required: true},
  //referencing _id in phones collection
  phone: {type: mongoose.Schema.Types.ObjectId, ref: 'Phone', required: true},
  homeAdd:  {type: String, required: true},
  shipAdd: {type: String, required: true}
});

module.exports = mongoose.model('Customer', customerSchema);
