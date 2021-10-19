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
    key_ingredients: {
      type: Array
    },
    allergens: {
      type: Array
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
    mood_tags: {
      type: Array
    },
    packaging_price: {
      type: Object,
    }, 
    product_availibility: {
      type: Array, 
    }, 
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
    },   
    product_image_url: {
      type: Array,
    },
    likes: {
      type: Number
    }, 
    status: {
      type: Boolean
    },
    main_image: {
      type: Object
    },
    variation_details: {
      type: Object
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Product", productSchema)