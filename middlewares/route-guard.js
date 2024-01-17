let notifier = require('node-notifier');

const isLoggedIn = (req, res, next) => {
    if(!req.session.currentUser) {
       res.redirect('/login');
    } 
    next();
}

const isLoggedOut = (req, res, next) => {
    if(req.session.currentUser) {
        res.redirect('/')
    }
    next();
}

const isAdmin = (req, res, next) => {
    if(req.session.currentUser === 'Admin') {
        res.redirect('/admin')
    }
    next();
}

const isVerifiedUser = (req, res, next) => {
    if(req.session.currentUser.status === 'Active'){
        next();
    }
    // res.jsonp('You have limited access since your account is not verified. Please check your email and verify your account.');
    notifier.notify({
        title: 'Error Message',
        message: 'You have limited access since your account is not verified. Please check your email and verify your account.'});
}

module.exports = {
    isLoggedIn,
    isLoggedOut,
    isAdmin,
    isVerifiedUser
};