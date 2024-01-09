const express = require('express');
const router = express.Router();

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')

/* GET home page */
router.get("/", (req, res, next) => {
  const inSession = req.session.currentUser

  if(inSession){
    res.render("index", { bgPage: "bg-page", inSession: true} );
  } else {
    res.render("index", { bgPage: "bg-page", inSession: false} );
  };

});

module.exports = router;
