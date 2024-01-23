const router = require("express").Router();
const User = require('../models/User.model.js');
const Pet = require('../models/Pet.model.js');
const Comment = require('../models/Comment.model.js');
const cloudinary = require('cloudinary').v2;
const fileUploader = require('../config/cloudinary.config.js')

const{ isLoggedIn, isLoggedOut, isAdmin, isVerifiedUser } = require('../middlewares/route-guard.js')

router.get('/profile/:userId', isLoggedIn, (req, res, next) => {
    // const userId = req.session.currentUser._id
    const userId = req.params.userId;
    console.log('userId', userId);
    User.findById(userId)
        .then((userFound) => {
            Pet.find({user: userId})
            .then((foundPet) => {
                res.render('user/profile', {user: userFound, foundPet, inSession: true,  _id: req.session.currentUser._id})
            })
        })
        .catch((err) =>{
            console.log(err);
            next(err);
        });
})

router.get('/edit-profile/:userId', isLoggedIn ,(req, res, next) => {
    const { userId } = req.params

    User.findById(userId)
        .then((foundUser) => {
            res.render('user/edit-profile', { foundUser, inSession: true, _id: userId })
        })
        .catch((err) =>{
            console.log(err);
            next(err);
        });
    
})

router.post('/edit-profile/:userId', isLoggedIn, fileUploader.single('img'), (req, res, next) => {
    const { userId } = req.params;
    const { name, lastName, city, bio, _id, existingImage } = req.body;

    if(name === ''|| city === ''){
        return res.render('user/edit-profile', {errMsg: "fill the required fileds", foundUser: req.body, userId: userId,  _id: userId});
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
            res.redirect(`/profile/${userId}`);
        })
        .catch((err) =>{
            console.log(err);
            next(err);
        });
        
})

router.post('/profile/delete/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params;
    //const currentUserInSession = req.session.currentUser._id;
    let publicIdOfCloudinary

    User.findById(userId)
        .then((foundUser) => {
            if (foundUser.img) {
                publicIdOfCloudinary = foundUser.img.split('/').splice(-2).join('/').split('.')[0];
                return cloudinary.uploader.destroy(publicIdOfCloudinary, { invalidate: true });
            } else {
                return Promise.resolve();
            }
        })
        .then(() => {
            return Pet.find({ user: userId })
        })
        .then((foundPets) => {
            const deletePets = foundPets.map((pets) => {
                if (pets.img) {
                    publicIdOfCloudinary = pets.img.split('/').splice(-2).join('/').split('.')[0];
                    return cloudinary.uploader.destroy(publicIdOfCloudinary, { invalidate: true });
                } else {
                    return Promise.resolve();
                }
            })
            return Promise.all(deletePets)
        })
        .then(() => {
            return Promise.all([
                Comment.deleteMany({ user: userId }),
                Pet.deleteMany({ user: userId }),
                User.findByIdAndDelete(userId),
            ]);
        })
        .then(() => {
            req.session.destroy((err) => {
                res.redirect("/")
            })
        })
        .catch((err) =>{
            console.log(err);
            next(err);
        });


})

router.get('/admin/users', isLoggedIn, isVerifiedUser, isAdmin, (req,res,next)=>{
    User.find()
    .then(users=>{
        const usersToRender = users.map(user => ({
            "_id": user._id,
            "name": user.name,
            "lastName": user.lastName,
            "img": user.img,
            "city": user.city
        }));

        res.render('user/users', { users: usersToRender, inSession: true });
    })
    .catch((err) =>{
        console.log(err);
        next(err);
    });
});

module.exports = router;