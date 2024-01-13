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

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')

router.get('/create-pet/:userId', (req, res, next) => {
    const { userId } = req.params
    // console.log('this is the USER ID',userId)
    res.render('pet/create-profile', {userId, inSession: true} )
})

router.post('/create-pet/:userId', fileUploader.single('img'), (req, res, next) => {
    const { userId } = req.params
    console.log('post-pet the USER ID',userId)

    const { name, description, votes } = req.body;
    console.log('req.body',req.body)

    Pet.create({img: req.file.path, name, description, user: userId, votes})   
        .then((createdPet) => {
            console.log('created pet', createdPet)
            res.redirect(`/pet-profile/${createdPet._id}`)
        })
        .catch((err) => {
            console.log(err)
        })
})

router.get("/pet-profile/:petId",(req, res, next) => {
    const { petId } = req.params
    let user = req.session.currentUser._id
    console.log("current User session", user)

    Pet.findById(petId)
        .populate({
            path: "user",
            populate: {
                path: "comment",
            },
        })
        .then((petInfo) => {
            // console.log("This is the pet profile populated with des and user and comments ===> ", petInfo)
            console.log("current User session", user)
            console.log(' This is the found pet description => ', petInfo.user.comment)
            res.render('pet/profile',{ petInfo, user , inSession: true})
        })
        .catch((err) => console.log(err))
})

router.get("/view-all-pets", (req, res, next) => {
    Pet.find()
    .populate('description')
    .populate('user')
    .then((allPets) => {
        // console.log(allPets)
        const inSession = req.session.currentUser

        if(inSession){
            res.render("pet/view-all-pets", { allPets, inSession: true} );
        } else {
            res.render("pet/view-all-pets", { allPets, inSession: false} );
        };
        // res.render("pet/view-all-pets", { allPets, inSession: true })
    })
    .catch((err) => console.log(err))
})

router.post("/pet/:petId/delete", (req, res, next) => {
    const { petId } = req.params
    let userId = req.session.currentUser._id

    Pet.findById(petId)
        .populate('user')
        .populate('description')
        .populate('comment')
        .then((foundPet) => {

            let { user, description, comment } = foundPet

            const petOwnerId = foundPet.user._id.toString();
            const currentUserId = userId.toString();
            //const petDescriptionId = foundPet.description._id.toString()
            //const petComments = foundPet.comment._id.toString()

            //console.log('The found pet - description STRINGED => ', description._id.toString())
            //console.log('The found pet - user - the user/s _id => ', petOwnerId)
            //console.log('This is the session of the current user the id => ', currentUserId )

            if (petOwnerId === currentUserId) {
                Pet.findByIdAndDelete(petId)
                    .then(() => { 
                        return Promise.all([
                            Comment.deleteMany({ _id: { $in: foundPet.comment } }),
                            User.findByIdAndUpdate(user._id, { $pull: { pets: petId } }),
                            Description.findByIdAndDelete(description._id.toString()),
                            // Comment.findByIdAndDelete(comment._id.toString() , { $pull: { pet: petId } }),
                        ])
                    })
                .then(() => {
                    res.redirect('/profile')
                })
            } else {
                User.findById(userId) 
                    .populate('pets')
                    .then((user) => {
                        // console.log('This is the falty user => ', user)
                        res.render('user/profile', {user, errMegDelete: `You're not the owner of ${foundPet.name}. You cannot delete his profile!`, inSession: true})
                    })
            }
            
        })
        .catch((err) => console.log(err))
})

router.get("/edit-pet/:petId", (req, res, next) => {
    const { petId } = req.params
    let userId = req.session.currentUser._id

    Pet.findById(petId)
        .populate('user')
        .populate('description')
        .then((foundPet) => {
            // console.log('this is the Id of the user /owner',foundPet.user._id.toString())
            // console.log('this is the current id of the session', userId.toString() )

            const petOwnerId = foundPet.user._id.toString();
            const currentUserId = userId.toString();

            if(petOwnerId === currentUserId) {
                res.render('pet/edit-profile', { foundPet, inSession: true })
            } else {
                User.findById(userId) 
                    .populate('pets')
                    .then((user) => {
                        //console.log('This is the falty user => ', user)
                        res.render('user/profile', {user, errMegDelete: `You're not the owner of ${foundPet.name}. You cannot edit his/her profile!`, inSession: true})
                    })
            }
            
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
            }
            return cloudinary.uploader.destroy(publicIdOfCloudinary, {invalidate: true})
        })
    Pet.findByIdAndUpdate(petId, {name, img, votes}, {new: true})
        .populate('description')
        .then((foundPet) => {
            //console.log('this is the found pet and the description Id', foundPet.description._id)
            Description.findByIdAndUpdate(foundPet.description._id, { text: description }, {new: true})
                .then((updatedDes) => {
                    //console.log('the updated description', updatedDes)
                    res.redirect(`/pet-profile/${petId}`)
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
})

module.exports = router;