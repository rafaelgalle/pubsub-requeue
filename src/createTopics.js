require('dotenv').config()
const {PubSub, v1} = require('@google-cloud/pubsub');

const projectId = process.env.PROJECT_ID
const topicName = 'topicProvider'
const topicDeadName = 'topicProviderDead'
// const subscriptionName = 'subProvider'
// const subscriptionDeadName = 'subProviderDead'
const pubsub = new PubSub({projectId});

async function topicExists(topicName) {
  const [topics] = await pubsub.getTopics();
  for (const i in topics) {
    const topic = topics[i]
    let name = topic.name.split('/')
    name = name[name.length -1]
    if (name === topicName) {
      console.log(`Topic ${topicName} already exists.`);
      return true
    }
  }
  return false
}

async function createTopic(topicName) {
  try {
    const exists = await topicExists(topicName);
    if (exists) return console.log(`Topic ${topicName} exists.`);

    topic = await pubsub.createTopic(topicName);
    console.log(`Topic ${topicName} created.`);
  } catch (error) {
    console.error(error)
  }
}

async function quickstart() {
  await createTopic(topicName)
  await createTopic(topicDeadName)
  console.log(`Topics created.`);
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}