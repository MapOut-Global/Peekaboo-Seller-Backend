const mongoose = require("mongoose")

const Schema = mongoose.Schema

const profileSchema = new Schema(
  {
    flags: {
      type: Object,
    },
    aboutme: {
      type: String,
    },
    heading: {
      type: String,
    },
    hoursOfOperation: {
      type: Array,
    },  
    availibility: {
      type: Object,
    }, 
    delivery: {
      type: Object, 
    }, 
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
    },
    speciality: {
      type: Array,
    }, 
    categories: {
      type: Array,
    }, 
    kitchenTourFile: {
      type: String, 
    },
    currency: {
      type: String, 
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Profile", profileSchema)