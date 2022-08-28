require('dotenv').config()

const {PubSub} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic-with-retry-and-deadLetter-v8'
const topicDeadName = 'my-dead-topic-with-retry-v8'
const subscriptionName = 'my-sub-with-retry-and-deadLetter-v8'
const subscriptionDeadName = 'my-subDead-with-retry-v8'
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
      maxDeliveryAttempts: 5,
    },
    retryPolicy,
  })
  await createSubscription(topicDeadName, subscriptionDeadName, null)

  pubsub.subscription(subscriptionName).on('message', message => {
    console.log('Received message:', message.data.toString());
    console.log('DeliveryAttempt: ', message.deliveryAttempt);
    console.log('publishTime: ', message.publishTime);
    console.log('Attributes: ', message.attributes);
    const now = Date.now();
    console.log({ delay: now - lastReceived }, 'Got a message');
		lastReceived = now;
    if (message.deliveryAttempt > parseInt(message.attributes.maxDeliveryAttempts)) {
      console.log('send ack, message.attributes.maxDeliveryAttempts:', message.attributes.maxDeliveryAttempts)
      message.ack();
    } else {
      console.log('send nack')
      message.nack();
    }
  });

  pubsub.subscription(subscriptionName).on('error', error => {
    console.error('Received error:', error);
    process.exit(1);
  });

  pubsub.subscription(subscriptionDeadName).on('message', message => {
    console.log(subscriptionDeadName + ' Received message:', message.data.toString());
    console.log('Send ack message');
    message.ack();
  });

  pubsub.subscription(subscriptionDeadName).on('error', error => {
    console.error(subscriptionDeadName + ' Received error:', error);
    process.exit(1);
  });

}

try {
  quickstart()
} catch (error) {
  console.error(error)
}