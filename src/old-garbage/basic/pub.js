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

async function quickstart() {
  await createTopic()
  pubsub.topic(topicName).publish(Buffer.from('Tedsadsast message!'));
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}