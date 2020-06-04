const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Phone = require('../models/phone');

//show all phone documents
router.get('/', (req, res, next) => {
  //.limit or .where to perform filtered select statements
  Phone.find()
//stating which records to display
  .select('manufacturer model price _id')
//https://stackoverflow.com/questions/31549857/mongoose-what-does-the-exec-function-do
//mongoose API method
  .exec().then(docs => {
    const response = {
      count: docs.length,
      phones: docs.map(doc => {
        return {
          manufacturer: doc.manufacturer,
          model: doc.model,
          price: doc.price,
          _id: doc._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/proucts/' + doc._id
          }
        }
      })
    };
    if(docs.length >= 0){
      res.status(200).json(response);
    }
    else{
      //if result is empty
      //404 Not Found	The server can not find the requested page.
      res.status(404).json({
        message: 'Collection is empty'
      });
    }
  }).catch(err => {
    console.log(err);
    //500 Internal Server Error	The request was not completed. The server met an unexpected condition.
    res.status(500).json({
      error: err
    })
  })
});

//Insert phone into the database
router.post('/', (req, res, next) => {
  const phone = new Phone({
    //creating a phone object to be saved into the database using bodyParser
    _id : new mongoose.Types.ObjectId(),
    manufacturer: req.body.manufacturer,
    model: req.body.model,
    price: req.body.price
  });
  //stores in database|| .exec turns into promise ||.then into a callback
  phone
    .save()
    .then(result => {
    res.status(201).json({
      //201 Created	The request is complete, and a new resource is created .
      //returning inputted phone details
      message: 'Created Phone Item successfully',
      createdPhone: {
        manufacturer: result.manufacturer,
        model: result.model,
        price: result.price,
        _id: result._id,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/proucts/' + result._id
        }
      }
    });
  })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//Find phone by ID
router.get('/:phoneId', (req, res, next) => {
  const id = req.params.phoneId;
  Phone.findById(id).select('manufacturer model price _id')
  .exec()
  .then(doc =>{
    console.log("From Database: "+doc);
    if(doc){
      res.status(200).json({
        phone: doc,
        request:{
          type: 'GET',
          url: 'http://localhost:3000/proucts/' + doc._id
        }
      });
    }
    else {
      res.status(500).json({message: 'No valid entry found for provided Id'});
    }
  })
  .catch(err => {
    console.log(err);
  res.status(500).json({error: err});
  });
});

//Update phone item
router.patch('/:phoneId', (req, res, next) => {
  //parse id from url
  const id = req.params.phoneId;
  //empty array to fill with propManufacturer (cover all term for any key) and value
  const updateOps = {};
  for(const ops of req.body){
    updateOps[ops.propManufacturer] = ops.value;
  }
  //$set contents of update to specified phone item by id
  Phone.update({_id: id}, {$set: updateOps})
  .exec()
  .then(result => {
    res.status(200).json({
      message: 'Phone updated',
      request:{
        type: 'GET',
        url: 'http://localhost:3000/proucts/' + result._id
      }
    });
  }).catch(err =>{
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

//remove phone by specific ID
router.delete('/:phoneId', (req, res, next) => {
  const id = req.params.phoneId;
  Phone.remove({_id: id})
  .exec()
  .then(result => {
    res.status(200).json({
      message: 'Phone Deleted',
      request: {
        type: 'POST',
        url: 'http://localhost:3000/proucts/',
        body: {manufacturer: 'String', model: 'String', price: 'Number'}
      }
    });
  })
  .catch(err => {
    res.status(500).json({
      error: err
    });
  });
});
module.exports = router;
