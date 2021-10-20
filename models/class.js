const mongoose = require("mongoose")

const Schema = mongoose.Schema

const classSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    participant_limit: {
      type: Number,
      required: true,
    },
    zoom_link: {
      type: String,
      required: true,
    },
    image: {
      type: Object, 
    }, 
    tot_participents: {
      type: Number
    }, 
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    }, 
  },
  { timestamps: true }
)

module.exports = mongoose.model("Class", classSchema)