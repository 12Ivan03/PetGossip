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
    if(req.session.currentUser && req.session.currentUser.role.toLowerCase() === 'admin') {
        next()
    } else {
        res.redirect('/')
    }
}

const isModerator = (req, res, next) => {
    if(req.session.currentUser && req.session.currentUser.role.toLowerCase() === 'moderator') {
        next()
    } else {
        res.redirect('/')
    }
}

const isVerifiedUser = (req, res, next) => {
    if (req.session.currentUser.status === 'Active') {
        console.log('in Active ')
        next();
    } else {
        // res.jsonp('You have limited access since your account is not verified. Please check your email and verify your account.');
        notifier.notify({
            title: 'Error Message',
            message: 'You have limited access since your account is not verified. Please check your email and verify your account.'
        });
        res.redirect('/view-all-pets');
    }
}

module.exports = {
    isLoggedIn,
    isLoggedOut,
    isAdmin,
    isModerator,
    isVerifiedUser
};