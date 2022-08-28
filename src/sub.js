require('dotenv').config()
const {PubSub} = require('@google-cloud/pubsub');

const projectId = process.env.PROJECT_ID
const topicName = 'topicProvider'
const topicDeadName = 'topicProviderDead'
const subscriptionName = 'subProvider'
const subscriptionDeadName = 'subProviderDead'

const pubsub = new PubSub({projectId});
let lastReceived = Date.now();

async function quickstart() {
  pubsub.subscription(subscriptionName).on('message', message => {
    console.log('############################################');
    console.log('############################################');
    console.log(subscriptionName + ' Received message:', message.data.toString());
    console.log('DeliveryAttempt: ', message.deliveryAttempt);
    console.log('publishTime: ', message.publishTime);
    // console.log('Attributes: ', message.attributes);
    // console.log('Attributes MAX: ', message.attributes.maxDeliveryAttempts);

    const now = Date.now();
    console.log({ delay: now - lastReceived }, 'Got a message');
		lastReceived = now;

    console.log('send nack')
    message.nack();
  });

  pubsub.subscription(subscriptionDeadName).on('message', message => {
    console.log('-------------------------------------------');
    console.log('-------------------------------------------');
    console.log(subscriptionDeadName + ' Received message:', message.data.toString());
    console.log('Send ack message');
    message.ack();
  });

  pubsub.subscription(subscriptionDeadName).on('error', error => {
    console.error(subscriptionDeadName + ' Received error:', error);
    process.exit(1);
  });

  pubsub.subscription(subscriptionName).on('error', error => {
    console.error(subscriptionName + ' Received error:', error);
    process.exit(1);
  });
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}