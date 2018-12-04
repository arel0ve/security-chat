const express = require('express');
const router = express.Router();
const Room = require('../schemas/room.schema');

router.post('/', async function(req, res, next) {
  try {
    console.log(req.body);
    if (!req.body.password) {
      res.status(400).json({
        message: 'Bad request',
        id: null
      });
      return;
    }

    let room = new Room({
      password: req.body.password
    });

    room = await room.save();

    res.status(200).json({
      message: 'Created successful',
      id: room._id
    });
  } catch (e) {
    res.status(500).json({
      message: 'Server error',
      id: null
    });
  }
});

router.get('/', async function(req, res, next) {
  try {
    if (!req.body.password || !req.body.room) {
      res.status(400).send('Bad request');
      return;
    }

    let room = await Room.findOne({_id: req.body.room});

    if (room.password !== req.body.password) {
      res.status(401).send('Wrong password');
      return;
    }

    res.status(200).send(room._id);
  } catch (e) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
