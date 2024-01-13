const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet.model.js');

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')

/* GET home page */
router.get("/", (req, res, next) => {
  const inSession = req.session.currentUser

  if(inSession){
    Pet.find()
      .then((foundPets) => {
        res.render("index", { inSession: true, foundPets} );
        // bgPage: "bg-page", 
      })
  } else {
    Pet.find()
      .then((foundPets) => {
        res.render("index", { inSession: false, foundPets} );
      })
  };

});

router.get("/info", (req, res, next) => {
  const inSession = req.session.currentUser

  if(inSession){
    res.render("info", { inSession: true });
  } else {
    res.render("info", { inSession: false });
  };

})

module.exports = router;
