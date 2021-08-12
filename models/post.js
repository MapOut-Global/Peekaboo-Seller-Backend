const mongoose = require("mongoose")

const Schema = mongoose.Schema

const postSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    image: {
      type: Object, 
    },
    productIds: Array,
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    },
    facebook_flag: {
      type: Boolean
    },
    instagram_flag: {
      type: Boolean
    },
    watsapp_flag: {
      type: Boolean
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Post", postSchema)