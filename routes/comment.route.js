const router = require("express").Router();
const User = require('../models/User.model.js');
const Pet = require('../models/Pet.model.js');
const Description = require('../models/Description.model');
const Comment = require('../models/Comment.model.js');
const bcrypt = require('bcrypt');
const saltRounds = 11;

const{ isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')


router.post('/comment/:petId/user/:userId', isLoggedIn, (req, res, next) => {
        const { petId, userId } = req.params 
        const { text } = req.body
    
        Comment.create({ text, user: userId, pet: petId })
            .then((createdComment) => {
                return User.findByIdAndUpdate(userId, { $push: {comment: createdComment._id}}, {new: true} )
            })
            .then(() => {
                res.redirect(`/pet-profile/${petId}`)
            })
            .catch((err) => console.log(err))    
})

router.post('/comment/delete/:commentId', isLoggedIn, (req, res, next) => {
    const { commentId } = req.params

    Comment.findById(commentId)
        .populate('user')
        .populate('pet')
        .then((foundComment) => {

            let { user } = foundComment

            Comment.findByIdAndDelete(commentId)
                .then(() => {
                    return User.findByIdAndUpdate(user, { $pull: {comment: commentId } } )
                })
                .then(() => {
                    let petId = foundComment.pet._id.toString()
                    res.redirect(`/pet-profile/${petId}`)
                })
                .catch((err) => console.log(err))    
        })
        .catch((err) => console.log(err));

})

router.get('/edit-comment/:commentId', isLoggedIn, (req, res, next) => {
    
    const { commentId } = req.params;
    let user = req.session.currentUser._id;

    Comment.findById(commentId)
            .populate('user')
            .populate('pet')
            .then((foundComment) => {
                res.render('comment/edit-comment', { foundComment, inSession: true,  _id: req.session.currentUser._id })
            })
            .catch((err) => {
                console.log(err);
                next(err);
            });
})

router.post('/comment-save/:commentId/pet/:petId', isLoggedIn, (req, res, next) => {
    const {commentId, petId } = req.params
    
    Comment.findByIdAndUpdate(commentId, req.body, {new: true})
        .then(() => {
            res.redirect(`/pet-profile/${petId}`)
        })
        .catch((err) => {
            console.log(err);
            next(err);
        });
})

module.exports = router;