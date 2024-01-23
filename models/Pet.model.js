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
    nickname: {
      type: String,
    },
    img: {
      type: String,
      default: '/images/pet-default-pic.png',
    },
    age: {
      type: Number,
    },
    birthday: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    description: {
      type: String,
      required: true
    },
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