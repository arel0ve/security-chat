const mongoose = require('mongoose');
const config = require('./config/config');

const Room = require('./schemas/room.schema');

mongoose.connect(config.dbURL, config.options);
mongoose.connection
    .once('open', () => {
      console.log(`Mongoose - successful connection ...`);
    })
    .on('error', error => console.warn(error));

Room.find({}).then(rooms => {
  console.log(rooms);
});
