const WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 40510});

const Room = require('../schemas/room.schema');
const Message = require('../schemas/message.schema');
const _ = require('lodash');
const crypto = require('crypto');
const aesjs = require('aes-js');

const connectedRooms = [];

wss.on('connection', (ws, req) => {
  ws.on('message', async msg => {
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
      const aliceKey = new Uint8Array(Math.ceil(msg.publicKey.length / 2));
      for (let i = 0; i < aliceKey.length; i++) aliceKey[i] = parseInt(msg.publicKey.substr(i * 2, 2), 16);

      const prime = new Uint8Array(Math.ceil(msg.prime.length / 2));
      for (let i = 0; i < prime.length; i++) prime[i] = parseInt(msg.prime.substr(i * 2, 2), 16);

      const generator = new Uint8Array(Math.ceil(msg.generator.length / 2));
      for (let i = 0; i < generator.length; i++) generator[i] = parseInt(msg.generator.substr(i * 2, 2), 16);

      const bob = crypto.createDiffieHellman(prime, generator);
      bob.generateKeys();

      const secret = bob.computeSecret(aliceKey);
      room.connections.push({ ws, secret });
      room.watchers.push({ username: msg.username, IP: req.connection.remoteAddress });

      ws.send(JSON.stringify({
        action: 'connected',
        bobKey: bob.getPublicKey('hex')
      }));

      room.connections.forEach(connectedWs => {
        if (connectedWs.ws.readyState === 1) {
          connectedWs.ws.send(JSON.stringify({
            action: 'new_user',
            connected: room.connections.length,
            watchers: room.watchers
          }));
        }
      });
    } else {
      const connection = _.find(room.connections, { ws });
      const encryptedBytes = aesjs.utils.hex.toBytes(msg.text);
      const aesCtr = new aesjs.ModeOfOperation.ctr(connection.secret);
      const decryptedBytes = aesCtr.decrypt(encryptedBytes);
      const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
      if (msg.store === 'db') {
        let from = msg.from ? msg.from : 'unknown';
        const message = new Message({
          from,
          text: decryptedText,
          date: new Date(Date.now()),
          room: msg.room
        });
        try {
          await message.save();
        } catch (e) {
          console.log(e);
        }
      }
      room.connections.forEach(connectedWs => {
        if (connectedWs.ws.readyState === 1) {
          let time = new Date(Date.now()).toTimeString().split(' ')[0];
          const textBytes = aesjs.utils.utf8.toBytes(decryptedText)
          const aesCtr = new aesjs.ModeOfOperation.ctr(connectedWs.secret)
          const encryptedBytes = aesCtr.encrypt(textBytes)
          const encryptedText = aesjs.utils.hex.fromBytes(encryptedBytes)
          connectedWs.ws.send(JSON.stringify({
            action: 'message',
            connected: room.connections.length,
            from: msg.from,
            text: encryptedText,
            date: time
          }));
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
        if (connectedWs.ws.readyState === 1) {
          connectedWs.ws.send(JSON.stringify({
            action: 'removed_user',
            connected: room.connections.length,
            watchers: room.watchers,
            oldIP: req.connection.remoteAddress
          }));
        }
      });
    }
  });
});
