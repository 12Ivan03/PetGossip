const router = require("express").Router();
const User = require('../models/User.model.js');
const Pet = require('../models/Pet.model.js');
const Description = require('../models/Description.model');
const Comment = require('../models/Comment.model.js');
const bcrypt = require('bcrypt');
const saltRounds = 11;

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')

router.get('/create-pet/:userId', isLoggedIn, (req, res, next) => {
    const { userId } = req.params
    // console.log('this is the USER ID',userId)
    res.render('pet/edit-profile', {userId} )
})

router.post('/create-pet/:userId', (req, res, next) => {
    const { userId } = req.params
    //const user = userId
    console.log('post-pet the USER ID',userId)
  
    const { img, name, description, votes } = req.body;
    console.log('req.body',req.body)

    let createdPet; // store info from the created pet

    Pet.create({img, name, user: userId, votes})
        // create pet
        .then((createdLocalPet) => { 
            console.log("created new Pet line 30 => ", createdLocalPet)

            // pass the created pet to the hier scope to be asscessed later. 
            createdPet = createdLocalPet;

            const newDescription = new Description({
                pet: createdLocalPet._id,
                user: userId,
                text: description,
            })
            return newDescription.save();
        })
        .then((passDescription) => {
            console.log('===> This is the NEW Description created after the pet ===>', passDescription)
            console.log('This is the createdPet git scope variable --------->', createdPet)
            return Pet.findByIdAndUpdate(createdPet._id, { description: passDescription._id }, { new: true })
        })
        .then((passPet) => {
            console.log("this is pet updated info description to update the user  =====>", passPet)
            return User.findByIdAndUpdate(userId, { $push: { pets: passPet._id }}, {new: true} )
        })
        .then(() => { 
            return Pet.findById(createdPet._id).populate('description')
        })
        .then((petInfo) => {
            console.log('this should contian the Pet info', petInfo)
            res.render('pet/profile', { petInfo })
        })
        .catch((err) => {
            console.log(err)
        })
})

router.get("/pet-profile/:petId", isLoggedIn,(req, res, next) => {
    const { petId } = req.params

    Pet.findById(petId)
    .populate("description")
    .then((petInfo) => {
        res.render('pet/profile',{ petInfo })
    })
    
})

router.get("/view-all-pets", isLoggedIn, (req, res, next) => {
    Pet.find()
    .populate('description')
    .populate('user')
    .then((allPets) => {
        console.log(allPets)
        res.render("pet/view-all-pets", { allPets })
    })
})

module.exports = router;