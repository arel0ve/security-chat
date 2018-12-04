const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Room', roomSchema);
