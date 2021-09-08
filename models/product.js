const mongoose = require("mongoose")

const Schema = mongoose.Schema

const productSchema = new Schema(
  { 
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    categories: {
      type: Array,
    },
    sub_categories: {
      type: Array,
    }, 
    cuisines: {
      type: Array,
    },
    dietary_need: {
      type: Array,
    }, 
    packaging_price: {
      type: Object,
    }, 
    product_availibility: {
      type: Object, 
    }, 
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
    },
    delivery_details: {
      type: Object,
    }, 
    stock: {
      type: String, 
    },
    discount_details: {
      type: Object, 
    },
    product_image_url: {
      type: Array,
    },
    likes: {
      type: Number
    },
    conssume_info: {
      type: Object
    },
    storage_instructions: {
      type: Array
    },
    status: {
      type: Boolean
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Product", productSchema)