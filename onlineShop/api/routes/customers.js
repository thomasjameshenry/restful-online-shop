const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Customer = require("../models/customer");
const Phone = require("../models/phone");

//Show all contents of customers collection (GET request)
router.get("/", (req, res, next) => {
  Customer.find()
  //fields to display
    .select("_id Title fname lname email phone mobile homeAdd shipAdd")
    // mongoose alternative to $lookup aggregator .populate(collection, fields to display)
    //https://mongoosejs.com/docs/populate.html
    .populate('phone', 'manufacturer model price')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        customers: docs.map(doc => {
          return {
            _id: doc._id,
            Title: doc.Title,
            fname: doc.fname,
            lname: doc.lname,
            email: doc.email,
            phone: doc.phone,
            mobile: doc.mobile,
            homeAdd: doc.homeAdd,
            shipAdd: doc.shipAdd,
            request: {
              type: "GET",
              url: "http://localhost:3000/customers/" + doc._id
            }
          };
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

//insert customer into database (POST request)
router.post("/", (req, res, next) => {
  Phone.findById(req.body.phoneId)
    .then(phone => {
      //if the specified ID doesn't belong to an existing phone
      if (!phone) {
        return res.status(404).json({
          message: "Phone ID does not exist"
        });
      }
      //create customer object and parse JSON to insert
      const customer = new Customer({
        _id: mongoose.Types.ObjectId(),
        Title: req.body.Title,
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        mobile: req.body.mobile,
        phone: req.body.phoneId,
        homeAdd: req.body.homeAdd,
        shipAdd: req.body.shipAdd
      });
      //save in database
      return customer.save();
    })
    .then(result => {
      //display inserted customer
      console.log(result);
      res.status(201).json({
        message: "Customer stored",
        createdCustomer: {
          _id: result._id,
          Title: result.Title,
          fname: result.fname,
          lname: result.lname,
          email: result.email,
          mobile: result.mobile,
          phone: result.phone,
          homeAdd: result.homeAdd,
          shipAdd: result.shipAdd
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/customers/" + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

//display selected customer by specified ID (GET request)
router.get("/:customerId", (req, res, next) => {
  Customer.findById(req.params.customerId)
    .populate('phone')
    .exec()
    .then(customer => {
      if (!customer) {
        return res.status(404).json({
          message: "Customer not found"
        });
      }
      res.status(200).json({
        customer: customer,
        request: {
          type: "GET",
          url: "http://localhost:3000/customers"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

//Update customer by specified ID (PATCH request)
router.patch('/:customerId', (req, res, next) => {
  const id = req.params.customerId;
  //empty array to fill with propName (cover all term for any key) and value
  const updateOps = {};
  for(const ops of req.body){
    updateOps[ops.propName] = ops.value;
  }
  //$set contents of update to specified customer by id
  Customer.update({_id: id}, {$set: updateOps})
  .exec()
  .then(result => {
    res.status(200).json({
      message: 'Customer details updated',
      request:{
        type: 'GET',
        url: 'http://localhost:3000/customers/' + result._id
      }
    });
  }).catch(err =>{
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

//remove customer specified by ID (DELETE request)
router.delete("/:customerId", (req, res, next) => {
  Customer.remove({ _id: req.params.customerId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Customer deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/customers",
          body: { Title: 'String',
          fname: 'String',
          lname: 'String',
          email: 'String',
          mobile:  'String',
          phoneId: 'ID',
          homeAdd: 'String',
          shipAdd: 'String'}
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
