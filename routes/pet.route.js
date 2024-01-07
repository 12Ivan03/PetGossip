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
    res.render('pet/create-profile', {userId} )
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
    let user = req.session.currentUser._id

    Pet.findById(petId)
        .populate("description")
        .populate("user")
        .populate({
            path: "comment",
            populate: {
                path: "user",
            },
        })
        .then((petInfo) => {
            console.log("This is the pet profile populated with des and user and comments ===> ", petInfo)
            // console.log("current User session", user)
            // console.log(' This is the found pet => ', petInfo)
            // console.log(' This is the found pet description => ', petInfo.description._id)
            res.render('pet/profile',{ petInfo, user })
        })
        .catch((err) => console.log(err))
})

router.get("/view-all-pets", (req, res, next) => {
    Pet.find()
    .populate('description')
    .populate('user')
    .then((allPets) => {
        console.log(allPets)
        res.render("pet/view-all-pets", { allPets })
    })
    .catch((err) => console.log(err))
})

router.post("/pet/:petId/delete", (req, res, next) => {
    const { petId } = req.params
    let userId = req.session.currentUser._id

    Pet.findById(petId)
        .populate('user')
        .then((foudnPet) => {
            const petOwnerId = foudnPet.user._id.toString();
            const currentUserId = userId.toString();

            console.log('The found pet - user - the user/s _id => ', petOwnerId)
            console.log('This is the session of the current user the id => ', currentUserId )
            if(petOwnerId === currentUserId) {
                Pet.findByIdAndDelete(petId)
                .then(() => {
                    res.redirect('/profile')
                })
            } else {
                User.findById(userId) 
                    .populate('pets')
                    .then((user) => {
                        // res.redirect('/profile')
                        console.log('This is the falty user => ', user)
                        res.render('user/profile', {user, errMegDelete: `You're not the owner of ${foudnPet.name}. You cannot delete his profile!`})
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
                res.render('pet/edit-profile', { foundPet })
            } else {
                User.findById(userId) 
                    .populate('pets')
                    .then((user) => {
                        //console.log('This is the falty user => ', user)
                        res.render('user/profile', {user, errMegDelete: `You're not the owner of ${foundPet.name}. You cannot edit his/her profile!`})
                    })
            }
            
        })
        .catch((err) => console.log(err))
})

router.post("/edit-pet-profile/:petId", (req, res, next) => {
    const { petId } = req.params
    const { name, img, votes, description } = req.body
    

    Pet.findByIdAndUpdate(petId, {name, img, votes})
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

router.post('/comment/:petId/user/:userId/description/:descriptionId', isLoggedIn, (req, res, next) => {
    const { petId, userId, descriptionId } = req.params 
    const { text } = req.body
    let createdComment

    Comment.create({ text, user: userId, pet: petId, description: descriptionId })
        .then((comment) => {
            console.log("this is the created comment", comment)
            return createdComment = comment
        })
        .then(() => {
            return Pet.findByIdAndUpdate(petId, { $push: { comment: createdComment._id } })
        })
        .then((petUpdate) => {
            console.log('this sould be the updated Pet ===>', petUpdate )
            return Description.findByIdAndUpdate(descriptionId, { $push: {comments: createdComment._id}})
        })
        .then((descriptionUpdate) => {
            console.log('This is hte description UPDATE =>', descriptionUpdate )
            return User.findByIdAndUpdate(userId, {$push: { comments: createdComment._id } })
        })
        .then(() => {
            res.redirect(`/pet-profile/${petId}`)
        })
        .catch((err) => console.log(err))
        
    
})

module.exports = router;