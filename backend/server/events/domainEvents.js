const { EventEmitter } = require('events');
const redisClient = require('../utils/redisClient');

const domainEvents = new EventEmitter();
domainEvents.setMaxListeners(50);
const EVENT_CHANNEL = 'finscope:domain-events';

const emit = (type, payload = {}) => {
  const event = {
  type,
  occurredAt: new Date().toISOString(),
  ...payload,
  };
  domainEvents.emit(type, event);
  if (redisClient.isReady) {
    redisClient.publish(EVENT_CHANNEL, JSON.stringify(event)).catch((error) => {
      console.error('Domain event publish failed:', error.message);
    });
  }
  return event;
};

const startEventSubscriber = async () => {
  const subscriber = redisClient.duplicate();
  subscriber.on('error', (error) => console.error('Domain event subscriber error:', error.message));
  await subscriber.connect();
  await subscriber.subscribe(EVENT_CHANNEL, (message) => {
    try {
      const event = JSON.parse(message);
      domainEvents.emit(event.type, event);
    } catch (error) {
      console.error('Invalid domain event:', error.message);
    }
  });
  return subscriber;
};

module.exports = { domainEvents, emit, startEventSubscriber };
