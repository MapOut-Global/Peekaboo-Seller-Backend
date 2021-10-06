const mongoose = require("mongoose")

const Schema = mongoose.Schema

const likeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    },
    itemId: {
      type: String,  
      required: true,
    }, 
    type: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Like", likeSchema)