const router = require("express").Router();
const User = require('../models/User.model.js');
const Pet = require('../models/Pet.model.js');
const Description = require('../models/Description.model');
const Comment = require('../models/Comment.model.js');
const bcrypt = require('bcrypt');
const saltRounds = 11;

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')

router.get('/profile', isLoggedIn, (req, res, next) => {
    const userId = req.session.currentUser
    //console.log('session userId =====>', userId._id);

    User.findById(userId)
        .populate("pets")
        .then((user) => {
            console.log('Found user name, profile:', user)
            res.render('user/profile', {user})
        })
        .catch((err) => console.log(err))
})

router.get('/edit-profile/:userId', (req, res, next) => {
    const { userId } = req.params

    User.findById(userId)
        .then((foundUser) => {
            console.log('this is body in foundUser get',foundUser)
            res.render('user/edit-profile', { foundUser })
        })
        .catch((err) => console.log(err))
    
})

router.post('/edit-profile/:userId', (req, res, next) => {
    const { userId } = req.params;
    console.log('this is the params',req.params);

    const { name, lastName, city, bio, img, _id } = req.body;
    console.log('this is the body',req.body);

    if(name === ''|| city === ''){
        console.log('this is the body in the if',req.body);
        const { userId } = req.params;
        console.log('this is the params in the IF',req.params);

        return res.render('user/edit-profile', {errMsg: "fill the required fileds", foundUser: req.body, userId: userId})
    } 
    
    User.findByIdAndUpdate(userId, req.body)
        .then(() => {
            console.log('this is the body in the UserUpdate',req.body);
            res.redirect("/profile")
        })
        .catch((err) => console.log(err))
    
    
})

module.exports = router;