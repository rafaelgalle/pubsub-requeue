require('dotenv').config()
const {PubSub} = require('@google-cloud/pubsub');

const projectId = process.env.PROJECT_ID
const topicName = 'topicProvider'
const topicDeadName = 'topicProviderDead'
const subscriptionName = 'subProvider'
const subscriptionDeadName = 'subProviderDead'

const pubsub = new PubSub({projectId});
let lastReceived = Date.now();
  
const retryPolicy = {
	minimumBackoff: {
		seconds: '15',
		nanos: 0,
	},
	maximumBackoff: {
		seconds: '17',
		nanos: 0,
	},
};

async function createSubscription(topicName, subscriptionName, config) {
  try {
    const [subscriptions] = await pubsub.getSubscriptions();
    for (const i in subscriptions) {
      const subscription = subscriptions[i]
      let name = subscription.name.split('/')
      name = name[name.length -1]
      if (name === subscriptionName) {
        console.log(`Subscription ${subscriptionName} already exists.`);
        if (config) {
          console.log(`Updating ${subscriptionName} metadata.`);
          await pubsub.subscription(subscriptionName).setMetadata(config);
        }
        return
      }
    }
    const subscription = await pubsub.topic(topicName).createSubscription(subscriptionName, config);
    console.log(`Subscription ${subscriptionName} created.`);
  } catch (error) {
    console.error(error)
  }
}

async function quickstart() {
  await createSubscription(topicName, subscriptionName, {
    deadLetterPolicy: {
      deadLetterTopic: pubsub.topic(topicDeadName).name,
      maxDeliveryAttempts: 10,
    },
    retryPolicy,
  })
  await createSubscription(topicDeadName, subscriptionDeadName, null)
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}