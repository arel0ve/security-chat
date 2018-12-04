const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  }
});

module.exports = mongoose.model('Message', messageSchema);
