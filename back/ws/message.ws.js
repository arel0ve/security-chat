const WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 40510});

const Room = require('../schemas/room.schema');
const Message = require('../schemas/message.schema');
const _ = require('lodash');

const connectedRooms = [];

wss.on('connection', ws => {
  ws.on('message', msg => {
    msg = JSON.parse(msg);
    let room = _.find(connectedRooms, {room: msg.room});
    if (msg.action === 'connect') {
      if (!room) {
        room = {
          room: msg.room,
          connections: []
        };
        connectedRooms.push(room);
      }
      if (!_.find(room.connections, ws)) {
        room.connections.push(ws);
      }
      room.connections.forEach(connectedWs => {
        if (connectedWs.readyState === 1) {
          connectedWs.send(JSON.stringify({
            action: 'new_user',
            date: Date.now()
          }))
        }
      });
    } else {
      room.connections.forEach(connectedWs => {
        if (connectedWs.readyState === 1) {
          connectedWs.send(JSON.stringify({
            from: msg.from,
            text: msg.text,
            date: Date.now()
          }))
        }
      });
    }
  });
  ws.on('close', (code, msg) => {
    if (msg) {
      msg = JSON.parse(msg);
      const room = _.find(connectedRooms, {room: msg.room});
      _.pull(room.connections, ws);
    }
  });
});
