const mongoose = require("mongoose")

const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    middle_name: {
      type: String, 
    },
    email: {
      type: String,
      required: true,
      unique: true 
    }, 
    password: {
      type: String,
      required: true, 
    },  
  },
  { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)