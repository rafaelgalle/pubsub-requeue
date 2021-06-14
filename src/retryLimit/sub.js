require('dotenv').config()

const {PubSub, Message} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic-with-retry-limit'
const subscriptionName = 'my-sub-with-retry-limit'
const pubsub = new PubSub({projectId});
let lastReceived = Date.now();
  
const retryPolicy = {
	minimumBackoff: {
		seconds: '5',
		nanos: 0,
	},
	maximumBackoff: {
		seconds: '7',
		nanos: 0,
	},
};

async function createSubscription(topicName, subscriptionName) {
  try {
    const [subscriptions] = await pubsub.getSubscriptions();
    for (const i in subscriptions) {
      const subscription = subscriptions[i]
      let name = subscription.name.split('/')
      name = name[name.length -1]
      if (name === subscriptionName) {
        console.log(`Subscription ${subscriptionName} already exists.`);
        console.log(`Updating ${subscriptionName} metadata.`);
        await pubsub.subscription(subscriptionName).setMetadata({
          retryPolicy,
        });
        return
      }
    }
    const subscription = await pubsub.topic(topicName).createSubscription(subscriptionName, {
      retryPolicy
    });
    console.log(`Subscription ${subscriptionName} created.`);
  } catch (error) {
    console.error(error)
  }
}

async function quickstart() {
  await createSubscription(topicName, subscriptionName)

  pubsub.subscription(subscriptionName).on('message', message => {
    const now = Date.now();
    console.log('Received message:', message.data.toString());
    console.log('Data: ', message);
    console.log(`Data: ${message.data}`);
    console.log(`DataHeader: ${message.data.header}`);
    console.log(`Attributes: ${message.attributes}`);
    console.log(`publish_time: ${message.delivery_attempt}`);
    console.log(message.attributes);
    console.log({ delay: now - lastReceived }, 'Got a message');
    const obj = JSON.parse(message.data.toString())
    lastReceived = now;
    message.attributes.testCount = 23
    if (obj.header.count > 4) {
      console.log('Max tentativas, vai dar ack');
      message.ack();
      return
    }
    obj.header.count = obj.header.count + 1
    console.log('Send nack message');
    // message.update();
    message.modAck();
    //process.exit(0);
  });

  pubsub.subscription(subscriptionName).on('error', error => {
    console.error('Received error:', error);
    process.exit(1);
  });

  // setTimeout(() => {
  //   pubsub.subscription(subscriptionName).removeListener('message', messageHandler);
  //   pubsub.subscription(subscriptionName).removeListener('error', messageHandler);
  // }, 60 * 10000);
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}