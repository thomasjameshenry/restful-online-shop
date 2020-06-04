const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const customerRoutes = require('./api/routes/customers');
const phoneRoutes = require('./api/routes/phones');


mongoose.connect('MONGODB CONNECTION URL', {
  useMongoClient : true, useUnifiedTopology: true, useNewUrlParser: true
});
//https://stackoverflow.com/questions/51862570/mongoose-why-we-make-mongoose-promise-global-promise-when-setting-a-mongoo
mongoose.Promise = global.Promise;
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Account for cors errors/ prevent cors errors - Postman is for testing so it doesn't care
//* allows access to all
//https://expressjs.com/en/resources/middleware/cors.html
//https://www.youtube.com/watch?v=UVAMha41dwo&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q&index=4
app.use((req,res,next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if(req.method === 'OPTIONS'){
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  //The next() method returns an object with two properties done and value. You can also provide a parameter to the next method to send a value to the generator.
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator/next
  next();
});
app.use('/customers', customerRoutes);
app.use('/phones', phoneRoutes);

//error handling
app.use((req,res,next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
})

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});
module.exports = app;

/*Customers collection uses phonesId to reference items in phones collection to create orders*/
