const express = require('express');
const router = express.Router();
const Room = require('../schemas/room.schema');

router.post('/', async function(req, res, next) {
  try {
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

router.get('/:room', async function(req, res, next) {
  try {
    if (!req.query.password || !req.params.room) {
      res.status(400).json({
        message: 'Bad request',
        id: null
      });
      return;
    }

    let room = await Room.findOne({_id: req.params.room});

    if (!room.checkPassword(req.query.password)) {
      res.status(401).json({
        message: 'Wrong password',
        id: null
      });
      return;
    }

    res.status(200).json({
      message: 'Accessed',
      id: room._id
    });
  } catch (e) {
    res.status(500).json({
      message: 'Server error',
      id: null
    });
  }
});

module.exports = router;
