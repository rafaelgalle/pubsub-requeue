require('dotenv').config()
const {PubSub, v1} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic-with-retry-limit-time'
const subscriptionName = 'my-sub-with-retry-limit-time'
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
  const limitTime = new Date();
  limitTime.setSeconds(limitTime.getSeconds() + 60)
  pubsub.topic(topicName).publish(Buffer.from(JSON.stringify({prop1: 'test retry limit time v1!', prop2: 'test prop2'})), {
    publishTime: new Date().getTime().toString(),
    limitTime: limitTime.getTime().toString()
  });
  console.log(`Message published.`);
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}