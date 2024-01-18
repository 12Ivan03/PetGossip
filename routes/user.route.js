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
        .then((userFound) => {
            Pet.find({user: userId})
            .then((foundPet) => {
                res.render('user/profile', {user: userFound, foundPet, inSession: true})
            })
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

router.post('/edit-profile/:userId', isLoggedIn, fileUploader.single('img'), (req, res, next) => {
    const { userId } = req.params;
    const { name, lastName, city, bio, _id, existingImage } = req.body;

    if(name === ''|| city === ''){
        return res.render('user/edit-profile', {errMsg: "fill the required fileds", foundUser: req.body, userId: userId})
    } 

    let img;
    
    if (req.file) {
        img = req.file.path;
    } else {
        img = existingImage;
    }

    let publicIdOfCloudinary

    User.findById(userId)
        .then((foundUser) => {
                if (foundUser.img){
                    publicIdOfCloudinary = foundUser.img.split('/').splice(-2).join('/').split('.')[0];
                    return cloudinary.uploader.destroy(publicIdOfCloudinary, {invalidate: true}); 
                } else {
                    return Promise.resolve();
                }       
        })
        .then(() => {
            return User.findByIdAndUpdate(userId, { name, lastName, city, bio, _id, img }, { new: true });
        })
        .then(() => {
            res.redirect("/profile");
        })
        .catch((err) => console.log(err))

})

router.post('/profile/delete/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params;
    //const currentUserInSession = req.session.currentUser._id;
    if(req.session.currentUser._id === userId || req.session.currentUser.role === 'Admin') {
        console.log('userId', userId);
        Pet.deleteMany({ user: userId})
        .then((result) => {
                console.log(result);
                return Promise.all([
                    Comment.deleteMany({ user: userId}),
                    User.findByIdAndDelete(userId)
                ]);  
        })
        .then(() => {
            req.session.destroy((err) => {
                res.redirect("/")
            })
        })
        .catch((err) => console.log(err));
    } else {
        res.redirect('/profile')
    }
   
})

module.exports = router;