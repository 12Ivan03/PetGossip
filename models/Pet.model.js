const { Schema, model } = require("mongoose");

const User = require("./User.model");
const Comment = require("./Comment.model");
const Description = require("./Description.model");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const petSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    img: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    description: {
        type: Schema.Types.ObjectId,
        ref: "Description"
    },
    // comment: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Comment"
    // },
    votes: {
        type: Number
    },

  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Pet = model("Pet", petSchema);

module.exports = Pet;