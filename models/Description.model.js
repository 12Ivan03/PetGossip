// const { Schema, model } = require("mongoose");

// const Pet = require("./Pet.model");
// const Comment = require("./Comment.model");
// const User = require("./User.model");

// // TODO: Please make sure you edit the User model to whatever makes sense in this case
// const descriptionSchema = new Schema(
//   {
//     text: {
//         type: String
//     },
//     pet: {
//         type: Schema.Types.ObjectId,
//         ref: "Pet"
//     },
//     user: {
//         type: Schema.Types.ObjectId,
//         ref: "User"
//     },
//     comments: [{
//         type: Schema.Types.ObjectId,
//         ref: "Comment"
//     }]
//   },
//   {
//     // this second object adds extra properties: `createdAt` and `updatedAt`
//     timestamps: true,
//   }
// );

// const Description = model("Description", descriptionSchema);

// module.exports = Description;