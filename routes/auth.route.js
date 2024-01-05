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
    
    console.log("this is the body", req.body);

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
                    console.log("this is the user's-session", foundUser)
                    res.render('user/edit-profile', { foundUser })
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
                        console.log("session", req.session.currentUser)
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



// <<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>>
// router.get('/profile', isLoggedIn, (req, res, next) => {
//     const userId = req.session.currentUser
//     console.log('session userId =====>', userId._id);

//     User.findById(userId)
//         .then((user) => {
//             console.log('Found user name, profile:', user)
//             res.render('user/profile', {user})
//         })
//         .catch((err) => console.log(err))
// })
//
// router.get('/edit-profile/:userId', (req, res, next) => {
//     const { userId } = req.params

//     User.findById(userId)
//         .then((foundUser) => {
//             console.log('this is body in foundUser get',foundUser)
//             res.render('user/edit-profile', { foundUser })
//         })
//         .catch((err) => console.log(err))
    
// })

// router.post('/edit-profile/:userId', (req, res, next) => {
//     const { userId } = req.params;
//     console.log('this is the params',req.params);

//     const { name, lastName, city, bio, img, _id } = req.body;
//     console.log('this is the body',req.body);

//     if(name === ''|| city === ''){
//         console.log('this is the body in the if',req.body);
//         const { userId } = req.params;
//         console.log('this is the params in the IF',req.params);

//         return res.render('user/edit-profile', {errMsg: "fill the required fileds", foundUser: req.body, userId: userId})
//     } 
    
//     User.findByIdAndUpdate(userId, req.body)
//         .then(() => {
//             console.log('this is the body in the UserUpdate',req.body);
//             res.redirect("/profile")
//         })
//         .catch((err) => console.log(err))
    
    
// })

// <<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>>