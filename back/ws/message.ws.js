const WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 40510});

const Room = require('../schemas/room.schema');
const Message = require('../schemas/message.schema');
const _ = require('lodash');

const connectedRooms = [];

wss.on('connection', (ws, req) => {
  ws.on('message', msg => {
    msg = JSON.parse(msg);
    let room = _.find(connectedRooms, {room: msg.room});
    if (msg.action === 'connect') {
      if (!room) {
        room = {
          room: msg.room,
          connections: [],
          watchers: []
        };
        connectedRooms.push(room);
      }
      if (!_.find(room.connections, ws)) {
        room.connections.push(ws);
        room.watchers.push({ username: msg.username, IP: req.connection.remoteAddress });
      }
      room.connections.forEach(connectedWs => {
        if (connectedWs.readyState === 1) {
          connectedWs.send(JSON.stringify({
            action: 'new_user',
            connected: room.connections.length,
            watchers: room.watchers
          }))
        }
      });
    } else {
      room.connections.forEach(connectedWs => {
        if (connectedWs.readyState === 1) {
          let time = new Date(Date.now()).toTimeString().split(' ')[0];
          connectedWs.send(JSON.stringify({
            action: 'message',
            connected: room.connections.length,
            from: msg.from,
            text: msg.text,
            date: time
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
      _.pullAllBy(room.watchers, [{ IP: req.connection.remoteAddress }], 'IP');
      room.connections.forEach(connectedWs => {
        if (connectedWs.readyState === 1) {
          connectedWs.send(JSON.stringify({
            action: 'removed_user',
            connected: room.connections.length,
            watchers: room.watchers,
            oldIP: req.connection.remoteAddress
          }))
        }
      });
    }
  });
});
