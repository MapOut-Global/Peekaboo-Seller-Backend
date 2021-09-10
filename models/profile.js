const mongoose = require("mongoose")

const Schema = mongoose.Schema

const profileSchema = new Schema(
  {
    flags: {
      type: Object,
    },
    shop_name: {
      type: String
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
    address: {
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
      type: Object, 
    },
    messageForMe: {
      type: String, 
    },
    currency: {
      type: String, 
    },
    latitude: {
      type: String, 
    },
    longitude: {
      type: String, 
    },
    zipcode: {
      type: String, 
    },
    avatar_url: {
      type: Object, 
    },
    attachments: {
      type: Array,
    },
    stop_orders: {
      type: Object
    },
    payment_details: {
      type: Object
    },
    phone: {
      type: String
    },
    shop_policy: {
      type: Object
    },
    operating_details: {
      type: Object
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Profile", profileSchema)