const router = require("express").Router();
const User = require('../models/User.model.js');
const Pet = require('../models/Pet.model.js');
const Description = require('../models/Description.model');
const Comment = require('../models/Comment.model.js');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fileUploader = require('../config/cloudinary.config.js')
const bcrypt = require('bcrypt');
const saltRounds = 11;

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')

router.get('/profile', isLoggedIn, (req, res, next) => {
    const userId = req.session.currentUser._id

    User.findById(userId)
        .populate("pets")
        .populate("comments")
        .then((user) => {
            res.render('user/profile', {user, inSession: true})
        })
        .catch((err) => console.log(err))
})

router.get('/edit-profile/:userId', isLoggedIn ,(req, res, next) => {
    const { userId } = req.params

    User.findById(userId)
        .then((foundUser) => {
            res.render('user/edit-profile', { foundUser, inSession: true })
        })
        .catch((err) => console.log(err))
    
})

router.post('/edit-profile/:userId', fileUploader.single('img'), isLoggedIn, (req, res, next) => {
    const { userId } = req.params;
    const { name, lastName, city, bio, _id, img } = req.body;
    // console.log('This is the req.file ===> ', req.file);

    if(name === ''|| city === ''){
        const { userId } = req.params;
        return res.render('user/edit-profile', {errMsg: "fill the required fileds", foundUser: req.body, userId: userId})
    } 

    User.findByIdAndUpdate(userId, { name, lastName, city, bio, _id, img: req.file.path }, { new: true })
        .then(() => {
            res.redirect("/profile")
        })
            .catch((err) => console.log(err))

    // let publicIdOfCloudinary

    // User.findById(userId)
    //     .then((foundUser) => {
    //         if (foundUser.img){
    //             // publicIdOfCloudinary = foundUser.img.split('/').pop().split('.')[0] // ==> the last part 
    //
    //             publicIdOfCloudinary = foundUser.img.split('/').splice(-2).join('/').split('.')[0] // last part with the pet-gosip...thing
        
    //         }
    //         return cloudinary.v2.uploader.destroy(publicIdOfCloudinary, { invalidate: true });     
    //     })
    //     .then((whatIsHere) => {
    //         console.log('whatIsHere ===>', whatIsHere);

    //         return User.findByIdAndUpdate(userId, { name, lastName, city, bio, _id, img: req.file.path }, { new: true });
    //     })
    //     .then((updatedUser) => {
    //         console.log('The updated user =>', updatedUser);

    //         res.redirect("/profile");
    //     })
    //     .catch((err) => console.log(err))

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
                res.render('user/profile', {user, errMsgDeleteProf:  `You cannot delete the profile of ${user.name} `, inSession: true})
            })
            .catch((err) => console.log(err));
    }
    
})

module.exports = router;