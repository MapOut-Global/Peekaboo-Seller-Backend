const mongoose = require("mongoose")

const Schema = mongoose.Schema

const followerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    },
    cookId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    }, 
  },
  { timestamps: true }
)

module.exports = mongoose.model("Follower", followerSchema)