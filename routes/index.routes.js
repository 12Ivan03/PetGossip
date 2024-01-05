const express = require('express');
const router = express.Router();

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')

/* GET home page */
router.get("/",(req, res, next) => {
  res.render("index");
});

module.exports = router;
