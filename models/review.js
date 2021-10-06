const mongoose = require("mongoose")

const Schema = mongoose.Schema

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    }, 
    orderId: {
      type: Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true,
    }, 
    rating: {
      type: Number,  
    }, 
    review: {
      type: String,
    }, 
    
  },
  { timestamps: true }
)

module.exports = mongoose.model("Review", reviewSchema)