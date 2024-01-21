const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet.model.js');

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')

/* GET home page */
router.get("/", (req, res, next) => {
  try {
    const inSession = req.session.currentUser

    if(inSession){
      Pet.find()
        .then((foundPets) => {
          res.render("index", { inSession: true, foundPets,  _id:req.session.currentUser._id} );
          // bgPage: "bg-page", 
        })
    } else {
      Pet.find()
        .then((foundPets) => {
          res.render("index", { inSession: false, foundPets} );
        })
    };
  
  } catch (error) {
    console.log(error);
    next(error);
  }
 
});

router.get("/info", (req, res, next) => {

  try {
    const inSession = req.session.currentUser

  if(inSession){
    res.render("info", { inSession: true, _id:req.session.currentUser._id });
  } else {
    res.render("info", { inSession: false });
  };
  } catch (error) {
    console.log(error);
    next(error);
  }
  

})

module.exports = router;
