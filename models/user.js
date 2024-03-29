const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true 
    }, 
    login_type: {
      type: String
    } ,
    role_id: {
      type: Number
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)