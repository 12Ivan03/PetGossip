const router = require("express").Router();
const User = require('../models/User.model.js');
const Pet = require('../models/Pet.model.js');
const Description = require('../models/Description.model');
const Comment = require('../models/Comment.model.js');
const bcrypt = require('bcrypt');
const saltRounds = 11;

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')

router.get("/signup", isLoggedOut, (req, res, next) => {
    res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
    const { username, password, email } = req.body;
    
    // console.log("this is the body", req.body);

    if(username === '' || password === '' || email === ''){
        res.render('auth/signup', {errMsg: "Please fill in all the required spaces"})
        return;
    }

    User.findOne({username})
        .then((foundUser) => {
            if(foundUser){
                res.render("auth/signup", {errUserMsg: "Existing user"})
            } else {
                bcrypt.hash(password, saltRounds)
                .then((hash) => {
                    return User.create({username, password: hash, email})
                })
                .then(foundUser => {
                    req.session.currentUser = foundUser;
                    // console.log("this is the user's-session", foundUser)
                    res.render('user/edit-profile', { foundUser, inSession: true })
                })
            }
        })
        .catch((err) => console.log(err))

})

router.get("/login", isLoggedOut, (req, res, next) => {
    res.render("auth/login")
});

router.post("/login", (req, res, next) => {
    const { username, password } = req.body;

    if(username === '' || password === ''){
        res.render('auth/login', {errMsg: "Please fill in all required spaces"});
        return;
    } 

    User.findOne({username})
        .then((logUser) => {
            if(!logUser){
                res.render('auth/login', {errUsernameMsg: "Inccorect username"})
            }

            bcrypt.compare(password, logUser.password)
                .then((approvedPwd) => {
                    if(approvedPwd) {
                        req.session.currentUser = { username: logUser.username, _id: logUser._id }
                        // console.log("session", req.session.currentUser)
                        res.redirect('/profile')
                    } else {
                        res.render('auth/login', {errMsgPwd: "inccorect password"})
                    }
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
})

router.get("/logout", isLoggedIn, (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect("/")
    })
})

module.exports = router;