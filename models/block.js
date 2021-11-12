const mongoose = require("mongoose")

const Schema = mongoose.Schema

const blockSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    },
    blockUserId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    }, 
    
  },
  { timestamps: true }
)

module.exports = mongoose.model("Block", blockSchema)