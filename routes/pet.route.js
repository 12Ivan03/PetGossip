const router = require("express").Router();
const User = require('../models/User.model.js');
const Pet = require('../models/Pet.model.js');
const Comment = require('../models/Comment.model.js');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fileUploader = require('../config/cloudinary.config.js')
const bcrypt = require('bcrypt');
const saltRounds = 11;

const{ isLoggedIn, isLoggedOut, isAdmin, isVerifiedUser } = require('../middlewares/route-guard.js')

router.get('/create-pet/:userId', isLoggedIn, isVerifiedUser, (req, res, next) => {
    const { userId } = req.params
    // console.log('this is the USER ID',userId)
    res.render('pet/create-profile', {userId, inSession: true} )
})

router.post('/create-pet/:userId',isLoggedIn, isVerifiedUser, fileUploader.single('img'), (req, res, next) => {
    const { userId } = req.params
    console.log('post-pet the USER ID',userId)

    const { name, description, votes, incommingImg, nickname, age, birthday } = req.body;
    console.log('req.body',req.body)

    let img;

    if(req.file) {
        img = req.file.path;
    } else {
        img = incommingImg;
    }

    Pet.create({img, name, description, user: userId, votes, nickname, age, birthday})   
        .then((createdPet) => {
            console.log('created pet', createdPet)
            res.redirect(`/pet-profile/${createdPet._id}`)
        })
        .catch((err) => {
            console.log(err)
        })
})

router.get("/pet-profile/:petId", isLoggedIn, isVerifiedUser, (req, res, next) => {
    const { petId } = req.params
    let userId = req.session.currentUser._id
    console.log("current User session", userId)
    Pet.findById(petId)
        .populate('user')
        .then(foundPet => {
            Comment.find({ pet: petId })
                .populate('user')
                .populate('pet')
                .then((foundComments)=>{
                    const isAdminOrModerator = req.session.currentUser.role === 'Admin' || req.session.currentUser.role === 'Moderator';
                    let newFoundComments = foundComments.map((obj) => {
                        console.log('obj', obj)
                       return {...obj.toObject(), isOwner: (userId.toString() === obj.user._id.toString()) || isAdminOrModerator };

                    });
                    const isUser = userId.toString() === foundPet.user._id.toString();
                    console.log("req uri",req.originalUrl);
                    console.log('found pet ', foundPet)
                    res.render('pet/profile',{ petInfo: foundPet, userId, comment: newFoundComments, isUser, inSession: true, originalURL:req.originalUrl})
                    //, idTitle:"pet-profile-page"})
                });
        })
        .catch((err) => next(err))
})

router.get("/view-all-pets", (req, res, next) => {
    Pet.find()
    .populate('user')
    .then((allPets) => {
        const inSession = req.session.currentUser

        if(inSession){
            res.render("pet/view-all-pets", { allPets, inSession: true} );
        } else {
            res.render("pet/view-all-pets", { allPets, inSession: false} );
        };
    })
    .catch((err) => console.log(err))
})

router.post("/pet/:petId/delete", isLoggedIn, isVerifiedUser, (req, res, next) => {
    const { petId } = req.params
    let userId = req.session.currentUser._id
    let publicIdOfCloudinary

    Pet.findById(petId)
        .then((foundPet) => {
            if(foundPet.img) {
                publicIdOfCloudinary = foundPet.img.split('/').splice(-2).join('/').split('.')[0];
                return cloudinary.uploader.destroy(publicIdOfCloudinary, {invalidate: true}); 
            } else {
                return Promise.resolve();
            }    
        })
//
        .then(() =>{
            return Comment.find({ pet: petId})
        })
        .then((foundComments) => {
            const userDeleteComments = foundComments.map((comment) => {
                return User.findByIdAndUpdate(comment.user, { $pull: {comment: comment._id } } )     
            })
            return Promise.all(userDeleteComments)
        })
//
        .then(() => {
            return Promise.all ([
                Comment.deleteMany({pet: petId}),
                Pet.findByIdAndDelete(petId)
            ])
        })
        .then(() => {
            res.redirect('/profile')
        })
        .catch((err) => console.log(err))
})

router.get("/edit-pet/:petId", isLoggedIn, isVerifiedUser, (req, res, next) => {
    const { petId } = req.params

    Pet.findById(petId)
        .populate('user')
        .then((foundPet) => {
                res.render('pet/edit-profile', { foundPet, inSession: true })  
        })
        .catch((err) => console.log(err))
})

router.post("/edit-pet-profile/:petId", isLoggedIn, isVerifiedUser, fileUploader.single('img'), (req, res, next) => {
    const { petId } = req.params
    const { name, incommingImg, votes, description, nickname, age, birthday } = req.body
    
    let img;

    if(req.file) {
        img = req.file.path;
    } else {
        img = incommingImg;
    }

    let publicIdOfCloudinary

    Pet.findById(petId)
        .then((foundPet) => { 
            if(foundPet.img) {
                publicIdOfCloudinary = foundPet.img.split('/').splice(-2).join('/').split('.')[0];
                return cloudinary.uploader.destroy(publicIdOfCloudinary, {invalidate: true})
            }
        })
    Pet.findByIdAndUpdate(petId, {name, img, votes, description, nickname, age, birthday}, {new: true})
        .then(() => {
            res.redirect(`/pet-profile/${petId}`)
        })
        .catch((err) => console.log(err))
})

module.exports = router;