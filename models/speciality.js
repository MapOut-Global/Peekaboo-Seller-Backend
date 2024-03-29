const mongoose = require("mongoose")

const Schema = mongoose.Schema

const specialitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
    },
    type: {
      type: String
    },
    icon_url: {
      type: String
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Speciality", specialitySchema)