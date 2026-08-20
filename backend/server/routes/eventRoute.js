const express = require('express');
const jwt = require('jsonwebtoken');
const { domainEvents } = require('../events/domainEvents');

const router = express.Router();
router.get('/stream', (req, res) => {
  const token = req.query.token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.write(': connected\n\n');
    const forward = (event) => {
      if (event.userId === id) res.write(`data: ${JSON.stringify(event)}\n\n`);
    };
    const eventTypes = require('../events/eventTypes');
    Object.values(eventTypes).forEach((type) => domainEvents.on(type, forward));
    const keepAlive = setInterval(() => res.write(': keep-alive\n\n'), 25000);
    req.on('close', () => {
      clearInterval(keepAlive);
      Object.values(eventTypes).forEach((type) => domainEvents.off(type, forward));
    });
  } catch (_) { res.status(401).json({ message: 'Not authorized.' }); }
});

module.exports = router;
