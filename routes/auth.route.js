const router = require("express").Router();
const User = require('../models/User.model.js');
const bcrypt = require('bcrypt');
const saltRounds = 11;

const{ isLoggedIn, isLoggedOut } = require('../middlewares/route-guard.js')
// Import the configured Nodemailer transporter object
const { transporter} = require("../config/transporter.config");
const fs = require('fs');
const templates = require("../templates/template");
const utils = require("../utils/utils");

router.get("/signup", isLoggedOut, (req, res, next) => {
    res.render("auth/signup");
});

router.post("/signup", isLoggedOut, (req, res, next) => {
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
                            res.render('user/edit-profile', { foundUser, inSession: true, _id:req.session.currentUser._id })
                        })
                        .catch((err) =>{
                            console.log('error in sending email',err);
                            User.deleteOne({foundUser})
                            req.session.currentUser = undefined;
                            next(err);
                        })
                }).catch((err) =>{
                    console.log(err);
                    next(err);
                })
            }
        })
        .catch((err) =>{
            console.log(err);
            next(err);
        })

})

router.get("/login", isLoggedOut, (req, res, next) => {
    res.render("auth/login")
});

router.post("/login", (req, res, next) => {
    const { username, password } = req.body;

    if(username === '' || password === ''){
        res.render('auth/login', {errMsg: "Please fill in all required spaces"});
    } 

    User.findOne({username})
        .then((logUser) => {
            if(!logUser){
                res.render('auth/login', {errUsernameMsg: "User not found or password incorrect"})
            } else {
                bcrypt.compare(password, logUser.password)
                .then((approvedPwd) => {
                    if(approvedPwd) {
                        req.session.currentUser = { username: logUser.username, _id: logUser._id, status:logUser.status, role:logUser.role };
                        if(req.session.currentUser.role === 'admin'){
                            res.redirect('/admin/users');
                        } else {
                            res.redirect(`/profile/${logUser._id}`)
                        }
                    } else {
                        res.render('auth/login', {errMsgPwd: "User not found or password incorrect"})
                    }
                })
                .catch((err) =>{
                    console.log(err);
                    next(err);
                })
            }
        })
        .catch((err) =>{
            console.log(err);
            next(err);
        })
})

router.get("/logout", isLoggedIn, (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect("/")
    })
})

router.get('/confirm/:confirmCode', (req, res, next)=> {
    console.log('currentUser', req.session.currentUser);
    User.findOne({confirmationCode: req.params.confirmCode})
        .then(foundUser => {
            if(foundUser){
                console.log('foundUser', foundUser);
                console.log('User is found, making it active');
                if(foundUser.status === 'Active'){
                    req.session.currentUser = { username: foundUser.username, _id: foundUser._id, status:foundUser.status, role:foundUser.role }
                    res.render('auth/account-verified', {isActive:true,  inSession:true,  _id: req.session.currentUser._id});
                    return;
                }
                User
                .findByIdAndUpdate(foundUser._id, { $set: { status: 'Active' } }, { new: true })
                .then(updatedUser=>{ 
                    console.log('updatedUser', updatedUser);
                    req.session.currentUser = { username: updatedUser.username, _id: updatedUser._id, status:updatedUser.status, role:updatedUser.role }
                    res.render('auth/account-verified', {success:true, inSession:true,  _id: req.session.currentUser._id})})
                .catch(err=>console.log('error in updating status', err));
            } else {
                console.log('no user is found registered for this user');
                res.render('auth/account-verified');
            }
        }).catch((err) =>{
            console.log(err);
            next(err);
        })
})

router.get('/contact', (req, res, next) => {
    try {
        if (req.session.currentUser)
            res.render('contact/contactus', { inSession: true,  _id: req.session.currentUser._id });
        else
            res.render('contact/contactus');
    } catch (err) {
        console.log(err);
        next(err);
    }

});

router.post('/contact', (req, res, next)=>{
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
            res.render('contact/contactus', {isMsgSent:true});
        })
        .catch((err) =>{
            console.log(err);
            next(err);
        });

});

module.exports = router;