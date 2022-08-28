require('dotenv').config()

const {PubSub} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic'
const subscriptionName = 'my-sub'
const pubsub = new PubSub({projectId});
  
async function createTopic(){
  try {
    const [topics] = await pubsub.getTopics();
    for (const i in topics) {
      const topic = topics[i]
      let name = topic.name.split('/')
      name = name[name.length -1]
      if (name === topicName) {
        console.log(`Topic ${topic.name} already exists.`);
        return
      }
    }
    topic = await pubsub.createTopic(topicName);
    console.log(`Topic ${topic.name} created.`);
  } catch (error) {
    console.error(error)
  }
}

async function createSubscription() {
  try {
    const [subscriptions] = await pubsub.getSubscriptions();
    for (const i in subscriptions) {
      const subscription = subscriptions[i]
      let name = subscription.name.split('/')
      name = name[name.length -1]
      if (name === subscriptionName) {
        console.log(`Subscription ${subscription.name} already exists.`);
        return
      }
    }
    const subscription = await pubsub.topic(topicName).createSubscription(subscriptionName);
    console.log(`Subscription ${subscription.name} created.`);
  } catch (error) {
    console.error(error)
  }
}

async function quickstart() {
  await createTopic()
  await createSubscription()

  pubsub.subscription(subscriptionName).on('message', message => {
    console.log('Received message:', message.data.toString());
    message.ack();
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