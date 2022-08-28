require('dotenv').config()

const {PubSub, Message} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic-with-retry-limit-time'
const subscriptionName = 'my-sub-with-retry-limit-time'
const pubsub = new PubSub({projectId});
let lastReceived = Date.now();
  
const retryPolicy = {
	minimumBackoff: {
		seconds: '10',
		nanos: 0,
	},
	maximumBackoff: {
		seconds: '12',
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
    // console.log('Data: ', message);
    console.log('DeliveryAttempt: ', message.deliveryAttempt);
    console.log('publishTime: ', message.publishTime);
    console.log('Attributes: ', message.attributes);
    console.log({ delay: now - lastReceived }, 'Got a message');
    lastReceived = now;
    if (message.attributes.limitTime < parseInt(new Date().getTime())) {
      console.log('Exceeded limit time, leave message');
      message.ack();
      return
    }
    console.log('Send nack message');
    message.nack();
  });

  pubsub.subscription(subscriptionName).on('error', error => {
    console.error('Received error:', error);
    process.exit(1);
  });
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}