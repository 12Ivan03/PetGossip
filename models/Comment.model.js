const { Schema, model } = require("mongoose");

const Pet = require("./Pet.model");
const User = require("./User.model");
const Description = require("./Description.model.js");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const commentSchema = new Schema(
  {
    text: {
        type: String,
    },
    description: {
        type: Schema.Types.ObjectId,
        ref: "Description"
    },
    // pet: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Pet"
    // },
    user: { 
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reply: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Comment = model("Comment", commentSchema);

module.exports = Comment;