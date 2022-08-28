require('dotenv').config()

const {PubSub} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic-with-retry-in-pub-v4'
const subscriptionName = 'my-sub-with-retry-in-pub-v4.1'
const pubsub = new PubSub({projectId});
let lastReceived = Date.now();
  
async function createSubscription(topicName, subscriptionName) {
  try {
    const [subscriptions] = await pubsub.getSubscriptions();
    for (const i in subscriptions) {
      const subscription = subscriptions[i]
      let name = subscription.name.split('/')
      name = name[name.length -1]
      if (name === subscriptionName) {
        console.log(`Subscription ${subscriptionName} already exists.`);
        return
      }
    }
    const subscription = await pubsub.topic(topicName).createSubscription(subscriptionName);
    console.log(`Subscription ${subscriptionName} created.`);
  } catch (error) {
    console.error(error)
  }
}

async function quickstart() {
  await createSubscription(topicName, subscriptionName)

  pubsub.subscription(subscriptionName).on('message', message => {
    console.log('Received message:', message.data.toString());
    const now = Date.now();
    console.log({ delay: now - lastReceived }, 'Got a message');
		lastReceived = now;
    //message.nack();
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