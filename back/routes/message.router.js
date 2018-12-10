const express = require('express');
const router = express.Router();
const Room = require('../schemas/room.schema');
const Message = require('../schemas/message.schema');

router.get('/:room', async function(req, res, next) {
  try {
    if (!req.params.room) {
      res.status(400).json({
        message: 'Bad request',
        messages: []
      });
      return;
    }

    if (!req.session[`room_${req.params.room}`]) {
      res.status(401).json({
        message: 'Denied',
        messages: []
      });
      return;
    }

    const from = req.query.from ? +req.query.from : 0;
    const limit = req.query.limit ? + req.query.limit : 10;

    let room = await Room.findOne({_id: req.params.room});

    if (room.store !== 'db') {
      res.status(400).json({
        message: 'No saved messages',
        messages: []
      });
      return;
    }

    const messages = await Message.find({room: req.params.room})
        .select('from text date -_id')
        .sort('-date')
        .skip(from)
        .limit(limit);

    res.status(200).json({
      message: 'Accessed',
      messages
    });
  } catch (e) {
    res.status(500).json({
      message: 'Server error',
      messages: []
    });
  }
});

module.exports = router;
