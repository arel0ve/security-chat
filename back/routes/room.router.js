const express = require('express');
const router = express.Router();
const aesjs = require('aes-js');
const Room = require('../schemas/room.schema');
const Message = require('../schemas/message.schema');

router.post('/', async function(req, res, next) {
  try {
    if (!req.body.password) {
      res.status(400).json({
        message: 'Bad request',
        id: null
      });
      return;
    }

    if (!req.session.secret) {
      res.status(401).json({
        message: 'Have not secret',
        id: null
      });
      return;
    }

    const encryptedBytes = aesjs.utils.hex.toBytes(req.body.password);
    const aesCtr = new aesjs.ModeOfOperation.ctr(req.session.secret.data);
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    const decryptedPassword = aesjs.utils.utf8.fromBytes(decryptedBytes);

    if (!req.body.store) {
      req.body.store = 'app';
    }

    let room = new Room({
      password: decryptedPassword,
      store: req.body.store
    });

    room = await room.save();

    req.session[`room_${room._id}`] = 'Accessed';

    res.status(200).json({
      message: `Creating successful`,
      id: room._id,
      store: room.store
    });
  } catch (e) {
    res.status(500).json({
      message: 'Server error',
      id: null
    });
  }
});

router.post('/open/:room', async function(req, res, next) {
  try {
    if (!req.params.room || !req.body.password) {
      res.status(400).json({
        message: 'Bad request',
        id: null
      });
      return;
    }

    if (!req.session.secret) {
      res.status(401).json({
        message: 'Have not secret',
        id: null
      });
      return;
    }

    const encryptedBytes = aesjs.utils.hex.toBytes(req.body.password);
    const aesCtr = new aesjs.ModeOfOperation.ctr(req.session.secret.data);
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    const decryptedPassword = aesjs.utils.utf8.fromBytes(decryptedBytes);

    let room = await Room.findOne({_id: req.params.room});

    if (!room.checkPassword(decryptedPassword)) {
      res.status(401).json({
        message: 'Wrong password',
        id: null
      });
      return;
    }

    req.session[`room_${req.params.room}`] = 'Accessed';

    res.status(200).json({
      message: 'Accessed',
      id: room._id,
      store: room.store
    });
  } catch (e) {
    res.status(500).json({
      message: 'Server error',
      id: null
    });
  }
});

router.get('/visit/:room', async function(req, res, next) {
  try {
    if (!req.params.room) {
      res.status(400).json({
        message: 'Bad request',
        id: null
      });
      return;
    }

    if (req.session[`room_${req.params.room}`] !== 'Accessed') {
      res.status(401).json({
        message: 'Not authorized',
        id: null
      });
      return;
    }

    const room = await Room.findOne({_id: req.params.room});

    if (room.store !== 'db') {
      res.status(200).json({
        message: 'Accessed',
        id: room._id,
        store: room.store
      });
      return;
    }

    const messages = await Message.find({room: room._id})
        .select('from text date -_id')
        .sort('-date')
        .limit(50);

    res.status(200).json({
      message: 'Accessed',
      id: room._id,
      store: room.store,
      messages
    })

  } catch (e) {
    res.status(500).json({
      message: 'Server error',
      id: null
    });
  }
});

router.get('/opened', function(req, res, next) {
  let rooms = [];
  for (let attr in req.session) {
    if (req.session.hasOwnProperty(attr) && attr.includes('room')) {
      const room = attr.slice(5);
      if (room && room !== 'undefined') {
        rooms.push(room);
      }
    }
  }
  res.status(200).json(rooms);
});

module.exports = router;
