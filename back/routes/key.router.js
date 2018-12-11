const express = require('express');
const router = express.Router();
const Room = require('../schemas/room.schema');
const Message = require('../schemas/message.schema');
const crypto = require('crypto');

const PRIME = 'f3df7dd339fa10e8357151eec027cb2ab2dd934d229ef9c03adc77e5701c9933';
const GENERATOR = '02';

router.get('/generate', function(req, res, next) {
  if (!req.query.key || !req.query.prime || !req.query.generator) {
    res.status(400).json({
      message: 'Denied',
      bobKey: null
    });
    return;
  }

  try {
    const aliceKey = new Uint8Array(Math.ceil(req.query.key.length / 2));
    for (let i = 0; i < aliceKey.length; i++) aliceKey[i] = parseInt(req.query.key.substr(i * 2, 2), 16);

    const prime = new Uint8Array(Math.ceil(req.query.prime.length / 2));
    for (let i = 0; i < prime.length; i++) prime[i] = parseInt(req.query.prime.substr(i * 2, 2), 16);

    const generator = new Uint8Array(Math.ceil(req.query.generator.length / 2));
    for (let i = 0; i < generator.length; i++) generator[i] = parseInt(req.query.generator.substr(i * 2, 2), 16);


    const bob = crypto.createDiffieHellman(prime, generator);
    const bobKey = bob.generateKeys();

    const secret = bob.computeSecret(aliceKey);
    req.session.secret = secret;

    res.status(200).json({
      message: 'Generated',
      bobKey: bob.getPublicKey('hex')
    })
  } catch (e) {
    res.status(500).json({
      message: 'Server Error',
      bobKey: null
    });
  }
});

module.exports = router;
