require('dotenv').config()
const {PubSub, v1} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic-with-retry-limit'
const subscriptionName = 'my-sub-with-retry-limit'
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
  pubsub.topic(topicName).publish(Buffer.from(JSON.stringify({content: 'test retry limit!', header: {count: 1}})), {testCount: '1'});
  console.log(`Message published.`);
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}