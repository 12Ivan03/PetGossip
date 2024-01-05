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

module.exports = {
    isLoggedIn,
    isLoggedOut,
    isAdmin
};