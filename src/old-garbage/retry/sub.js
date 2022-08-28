require('dotenv').config()

const {PubSub} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic-with-retry-v3'
const subscriptionName = 'my-sub-with-retry-v3'
const pubsub = new PubSub({projectId});
let lastReceived = Date.now();
  
const retryPolicy = {
	// using strings for `seconds` props so we can compare this against
	// the `getMetadata` return
	minimumBackoff: {
		seconds: '5',
		nanos: 0,
	},
	maximumBackoff: {
		seconds: '7',
		nanos: 0,
	},
};

async function createTopic(topicName) {
  try {
    const [topics] = await pubsub.getTopics();
    for (const i in topics) {
      const topic = topics[i]
      let name = topic.name.split('/')
      name = name[name.length -1]
      if (name === topicName) {
        console.log(`Topic ${topicName} already exists.`);
        return
      }
    }
    topic = await pubsub.createTopic(topicName);
    console.log(`Topic ${topicName} created.`);
  } catch (error) {
    console.error(error)
  }
}

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
  await createTopic(topicName)
  await createSubscription(topicName, subscriptionName)

  pubsub.subscription(subscriptionName).on('message', message => {
    console.log('Received message:', message.data.toString());
    const now = Date.now();
    console.log({ delay: now - lastReceived }, 'Got a message');
		lastReceived = now;
    // console.log('Received message:', message._subscriber._acks._subscriber._acks);
    // console.log('Send nack message');
    message.nack();
    // setTimeout(() => {
    //   message.nack();
    // }, 2000);
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