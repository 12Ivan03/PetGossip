const router = require("express").Router();
const User = require('../models/User.model.js');
const Pet = require('../models/Pet.model.js');
const Description = require('../models/Description.model');
const Comment = require('../models/Comment.model.js');
const bcrypt = require('bcrypt');
const saltRounds = 11;

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')


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

router.post('/comment/delete/:commentId', (req, res, next) => {
    const { commentId } = req.params
    let userId = req.session.currentUser._id
    console.log('thii is the current user in session',userId)

    Comment.findById(commentId)
        .populate('user')
        .populate('pet')
        .then((foundComment) => {
            console.log("this is the found comment-user-id ===> ", foundComment.user._id.toString() )
            console.log("this is the found comment-pet-id that i need to extract ;P ===> ", foundComment.pet._id.toString() )

            let { user, description, pet} = foundComment

            if(foundComment.user._id.toString() === userId.toString()) {
                Comment.findByIdAndDelete(commentId)
                    .then(() => {
                        return Promise.all([
                            User.findByIdAndUpdate(user, { $pull: {comments: commentId } } ),
                            Description.findByIdAndUpdate(description, { $pull: {comments: commentId } }),
                            Pet.findByIdAndUpdate(pet, { $pull: {comment: commentId } })
                        ]);
                    })
                    .then(() => {
                        let petId = foundComment.pet._id.toString()
                        res.redirect(`/pet-profile/${petId}`)
                    })
                    .catch((err) => console.log(err))
            } else {
                Pet.findById(pet) 
                    .populate('user')
                    .populate('description')
                    .populate({
                        path: "comment",
                        populate: {
                            path: "user",
                        },
                    })
                    .then((petInfo) => {
                        //console.log('This is the falty user => ', user)
                        //res.render('user/profile', {user, errMegDelete: `You're not allowed to delete this comment`})
                        res.render('pet/profile',{ petInfo, user, errMsgCommentDel: "You cannot delete a comment you have not created!" })
                    })
                    .catch((err) => console.log(err))
            }
        })

})

module.exports = router;

// Pet.findById(petId)
// .populate("description")
// .populate("user")
// .populate({
//     path: "comment",
//     populate: {
//         path: "user",
//     },
// })
// .then((petInfo) => {
//     console.log("This is the pet profile populated with des and user and comments ===> ", petInfo)
//     // console.log("current User session", user)
//     // console.log(' This is the found pet => ', petInfo)
//     // console.log(' This is the found pet description => ', petInfo.description._id)
//     res.render('pet/profile',{ petInfo, user })
// })
// .catch((err) => console.log(err))