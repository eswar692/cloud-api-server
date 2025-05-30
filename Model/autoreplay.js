const mongoose = require("mongoose");

const autoReplySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  header: {
    type: new mongoose.Schema({
        type: {
            type: String,
            enum: [ "image", "video"],
        },
        url: {
            type: String,
        },
        publicId:{
            type: String,
        }
    },
    {
      _id: false,
    }
   ),
  },
  body: {
    type: String,
  },
  footer: {
        type: String,
  },
  button1: {
    type: new mongoose.Schema({
      lable:{
        type: String
      },
      message:{
        type: String
      }

      },
      {
        _id: false,
      }
    ),
  },
  button2: {
     type: new mongoose.Schema({
      lable:{
        type: String
      },
      message:{
        type: String
      }

      },
      {
        _id: false,
      }
    ),
  },
  button3: {
     type: new mongoose.Schema({
      lable:{
        type: String
      },
      message:{
        type: String
      }

      },
      {
        _id: false,
      }
    ),
  },
  isActive: {
    type: Boolean,
  }

});



const AutoReply = mongoose.model("AutoReply", autoReplySchema);

module.exports = AutoReply;
