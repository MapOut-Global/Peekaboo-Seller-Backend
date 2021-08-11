const mongoose = require("mongoose")

const Schema = mongoose.Schema

const orderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
    },
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
    }, 
    order_details: {
      type: Array,
      required: true
    },
    is_asap: {
      type: Boolean
    },
    is_preorder: {
      type: Boolean
    },
    preferred_time: {
      type: Object
    },
    pick_up: {
      type: Boolean
    },
    delivery: {
      type:Boolean
    },
    delivery_address: {
      type: String
    },
    courier_note: {
      type: String
    },
    comment_for_cook: {
      type: String
    },
    delivery_cost: {
      type: Number
    },
    order_total: {
      type: Number
    },
    order_status: {
      type: Number
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Order", orderSchema)