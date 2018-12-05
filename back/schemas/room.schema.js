const crypto = require('crypto');
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  timeForSave: {
    type: Number,
    default: 0
  }
});

roomSchema.method('encryptPassword', function (password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

roomSchema.virtual('password')
    .set(function(password) {
      this.__plainPassword = password;
      this.salt = Math.random() + '';
      this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
      return this.__plainPassword;
    });

roomSchema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

module.exports = mongoose.model('Room', roomSchema);
