require('dotenv').config()
const {PubSub, v1} = require('@google-cloud/pubsub')

const projectId = process.env.PROJECT_ID
const topicName = 'topicProvider'
const topicDeadName = 'topicProviderDead'
const subscriptionName = 'subProvider'
const subscriptionDeadName = 'subProviderDead'

const pubsub = new PubSub({projectId});

async function quickstart() {
  pubsub.topic(topicName).publish(Buffer.from('TEST PROVIDER MESSAGE 1!'), {});
  console.log(`Message published.`);
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}