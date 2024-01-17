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

router.get('/create-pet/:userId', (req, res, next) => {
    const { userId } = req.params
    // console.log('this is the USER ID',userId)
    res.render('pet/create-profile', {userId, inSession: true} )
})

router.post('/create-pet/:userId', fileUploader.single('img'), (req, res, next) => {
    const { userId } = req.params
    console.log('post-pet the USER ID',userId)

    const { name, description, votes, incommingImg } = req.body;
    console.log('req.body',req.body)

    let img;

    if(req.file) {
        img = req.file.path;
    } else {
        img = incommingImg;
    }

    Pet.create({img, name, description, user: userId, votes})   
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

                    let newFoundComments = foundComments.map((obj) => {
                       return {...obj.toObject(), isOwner: userId.toString() === obj.user._id.toString()};

                    });

                    const isUser = userId.toString() === foundPet.user._id.toString();

                    // console.log('foundComments 3 =====> ', newFoundComments)
                    // console.log('current user in session ===========>' , isUser)
                    // console.log('the found pet ===> ', foundPet._id)

                    res.render('pet/profile',{ petInfo: foundPet, userId, comment: newFoundComments, isUser, inSession: true, idTitle:"pet-profile-page"})
                
                });
        })
        .catch((err) => console.log(err))
})

router.get("/view-all-pets", (req, res, next) => {
    Pet.find()
    .populate('user')
    .then((allPets) => {
        // console.log(allPets)
        const inSession = req.session.currentUser

        if(inSession){
            res.render("pet/view-all-pets", { allPets, inSession: true} );
        } else {
            res.render("pet/view-all-pets", { allPets, inSession: false} );
        };
    })
    .catch((err) => console.log(err))
})

router.post("/pet/:petId/delete", isLoggedIn, (req, res, next) => {
    const { petId } = req.params
    //let userId = req.session.currentUser._id
    
    Pet.findByIdAndDelete(petId)
        .then(() => {
            Comment.deleteMany({pet: petId})
        })
        .then(() => {
            res.redirect('/profile')
        })
        .catch((err) => console.log(err))
        
})

router.get("/edit-pet/:petId", (req, res, next) => {
    const { petId } = req.params

    Pet.findById(petId)
        .populate('user')
        .then((foundPet) => {
                res.render('pet/edit-profile', { foundPet, inSession: true })  
        })
        .catch((err) => console.log(err))
})

router.post("/edit-pet-profile/:petId", fileUploader.single('img'), (req, res, next) => {
    const { petId } = req.params
    const { name, incommingImg, votes, description } = req.body
    
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
    Pet.findByIdAndUpdate(petId, {name, img, votes, description}, {new: true})
        .then(() => {
            res.redirect(`/pet-profile/${petId}`)
        })
        .catch((err) => console.log(err))
})

module.exports = router;