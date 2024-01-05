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
  
    const { img, name, description } = req.body;
    console.log('req.body',req.body)

    let createdPetDes;

    Pet.create({img, name, user: userId})
        // Pet.findOne((pet.name))
        .then((createdPet) => { 
            console.log("createdPet => ", createdPet)

            // pass the created pet to the hier scope to be asscessed later. 
            createdPetDes = createdPet;

            const newDescription = new Description({
                pet: createdPet._id,
                user: userId,
                text: description,
            })
            return newDescription.save();
        })
        .then((userPet) => {
            console.log("user's profile update =====>", userPet)
            return User.findByIdAndUpdate(userId, { $push: { pets: userPet._id }}, {new: true} )
        })
        .then((petDescription) => {
            console.log('===> This is the Pet Id to update the Description ===>',petDescription)
            console.log('This is the createdPetDes let variable --------->', createdPetDes)
            return Pet.findByIdAndUpdate(createdPetDes._id, { description: petDescription._id }, { new: true })
        })
        .then((petInfo) => { 
            res.render('pet/profile', { petInfo })
        })
        .catch((err) => {
            console.log(err)
        })
})

module.exports = router;