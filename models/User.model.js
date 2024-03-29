const { Schema, model } = require("mongoose");

const Pet = require("./Pet.model");
const Comment = require("./Comment.model");
const Description = require("./Description.model");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    img: {
      type: String,
      default: '/images/pngwing.com.png',
    },
    username: {
      type: String,
      required: false,
      unique: true,
      trim: true
    },
    name: {
      type: String,
    },
    lastName: {
      type: String,
    },
    city: {
      type: String,
    },
    bio: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending Confirmation', 'Active'],
      default: 'Pending Confirmation'
    },
    confirmationCode: {
      type: String,
      unique: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'normal'],
      default: 'normal'
    },
    // pets: [{
    //   type: Schema.Types.ObjectId,
    //   ref: "Pet"
    // }],
    comment: [{
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
