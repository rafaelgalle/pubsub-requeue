require('dotenv').config()
const {PubSub, v1} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic-with-retry-and-deadLetter-v2'
const topicDeadName = 'my-dead-topic-with-retry-v2'
const subscriptionName = 'my-sub-with-retry-and-deadLetter-v2'
const pubsub = new PubSub({projectId});

async function createTopic(topicName){
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

async function quickstart() {
  await createTopic(topicName)
  await createTopic(topicDeadName)
  pubsub.topic(topicName).publish(Buffer.from('test retry v3!'));
  console.log(`Message published.`);
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}