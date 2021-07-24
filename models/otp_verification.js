const mongoose = require("mongoose")

const Schema = mongoose.Schema

const otpVerificationSchema = new Schema(
  {
    otp: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true 
    },  
  },
  { timestamps: true }
)

module.exports = mongoose.model("OtpVerification", otpVerificationSchema)