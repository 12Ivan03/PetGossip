const router = require("express").Router();
const User = require('../models/User.model.js');
const Pet = require('../models/Pet.model.js');
const Description = require('../models/Description.model');
const Comment = require('../models/Comment.model.js');
const bcrypt = require('bcrypt');
const saltRounds = 11;

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')

router.get('/profile', isLoggedIn, (req, res, next) => {
    const userId = req.session.currentUser._id

    User.findById(userId)
        .populate("pets")
        .populate("comments")
        .then((user) => {
            res.render('user/profile', {user})
        })
        .catch((err) => console.log(err))
})

router.get('/edit-profile/:userId', isLoggedIn ,(req, res, next) => {
    const { userId } = req.params

    User.findById(userId)
        .then((foundUser) => {
            res.render('user/edit-profile', { foundUser })
        })
        .catch((err) => console.log(err))
    
})

router.post('/edit-profile/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params;

    const { name, lastName, city, bio, img, _id } = req.body;

    if(name === ''|| city === ''){
        const { userId } = req.params;
        return res.render('user/edit-profile', {errMsg: "fill the required fileds", foundUser: req.body, userId: userId})
    } 
    
    User.findByIdAndUpdate(userId, req.body)
        .then(() => {
            res.redirect("/profile")
        })
        .catch((err) => console.log(err))
        
})

router.post('/profile/delete/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params
    const currentUserInSession = req.session.currentUser._id
    //console.log('This is the current user insession => ', req.session.currentUser)

    if(currentUserInSession === userId) {
        User.findById(userId)
            .populate({
                path:'pets',
                populate: { 
                    path: "description"
                },
                populate: {
                    path: "comment"
                }
            })
            .then((foundUser) => {
                console.log("This is the found user and populated with the pets and comments =>  ", foundUser)
                
                return Promise.all(foundUser.pets.map((pets) => {
                    // console.log("THOSE ARE THE PETS FOR EACH LOOP ", pets._id)
                    // console.log("Extraction of the description id = populated pet des", pets.description._id)
                    // console.log("this is the foundUser-Pet-populated with comment = reach for the comments", pets.comment)
                    return Promise.all ([
                        Description.findByIdAndDelete(pets.description._id),
                        Comment.deleteMany({ _id: { $in: pets.comment } }),
                        Pet.findByIdAndDelete(pets._id)
                    ])
                }))
            })
            .then(() => {
                return User.findByIdAndDelete(userId)
            })
            .then(() => {
                req.session.destroy((err) => {
                    res.redirect("/")
                })
            })
            .catch((err) => console.log(err));
    } else {
        User.findById(userId)
            .populate("pets")
            .populate("comments")
            .then((user) => {
                res.render('user/profile', {user, errMsgDeleteProf:  `You cannot delete the profile of ${user.name} `})
            })
            .catch((err) => console.log(err));
    }
    
})

module.exports = router;