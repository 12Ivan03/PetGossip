const router = require("express").Router();
const User = require('../models/User.model.js');
const Pet = require('../models/Pet.model.js');
const Description = require('../models/Description.model');
const Comment = require('../models/Comment.model.js');
const bcrypt = require('bcrypt');
const saltRounds = 11;

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')
// Import the configured Nodemailer transporter object
const { transporter} = require("../config/transporter.config");
const fs = require('fs');
const templates = require("../templates/template");
const utils = require("../utils/utils");

router.get("/signup", isLoggedOut, (req, res, next) => {
    res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
    const { username, password, email } = req.body;
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
                    return User.create({username, password: hash, email, confirmationCode:utils.getRandomToken()})
                })
                .then(foundUser => {
                    const message = "Click here to verify account.";
                    transporter.sendMail({
                        from: `"Pet Gossips " <${process.env.EMAIL_ADDRESS}>`,
                        to: email,
                        subject: "Account Verification",
                        text: message,
                        html:templates.templateAccountVerification(foundUser.username, foundUser.confirmationCode)
                        })
                        .then((info) => {
                            console.log('info',info);
                            req.session.currentUser = foundUser;
                            res.render('user/edit-profile', { foundUser, inSession: true })
                        })
                        .catch((error) => console.log(error));
                }).catch((error) => console.log(error));
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
                res.render('auth/login', {errUsernameMsg: "User not found or password incorrect"})
            }

            bcrypt.compare(password, logUser.password)
                .then((approvedPwd) => {
                    if(approvedPwd) {
                        req.session.currentUser = { username: logUser.username, _id: logUser._id, status:logUser.status, role:logUser.role }
                        // req.session.currentUser = logUser;
                        // console.log("session", req.session.currentUser)
                        res.redirect('/profile')
                    } else {
                        res.render('auth/login', {errMsgPwd: "User not found or password incorrect"})
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

router.get('/confirm/:confirmCode', (req, res)=> {
    console.log('currentUser', req.session.currentUser);
    User.findOne({confirmationCode: req.params.confirmCode})
        .then(foundUser => {
            if(foundUser){
                console.log('foundUser', foundUser);
                console.log('User is found, making it active');
                if(foundUser.status === 'Active'){
                    res.render('auth/account-verified', {isActive:true});
                    return;
                }
                User
                .findByIdAndUpdate(foundUser._id, { $set: { status: 'Active' } }, { new: true })
                .then(()=>{ 
                    res.render('auth/account-verified', {success:true})})
                .catch(err=>console.log('error in updating status', err));
            } else {
                console.log('no user is found registered for this user');
                res.render('auth/account-verified');
            }
        }).catch(err => console.log(err));
})

router.post('/contact', (req, res)=>{
    // console.log('req.body', req.body);
    const {userName, userEmail, customerNote} = req.body;
    transporter.sendMail({
        from: `"Pet Gossips - Support " <${process.env.EMAIL_ADDRESS}>`,
        to: process.env.EMAIL_ADDRESS,
        subject: "Pet Gossips - User Issues",
        text: `Name:${userName} Email: ${userEmail} Message: ${customerNote}`,
        html:templates.templateCustomerIssues(req.body)
        })
        .then((info) => {
            console.log('email sent by the user to pet gossips.') 
            res.render('auth/account-verified',{isMsgSent:true})
        })
        .catch(err=>console.log(err));

});

module.exports = router;