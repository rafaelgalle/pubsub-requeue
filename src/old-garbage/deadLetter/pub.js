require('dotenv').config()
const {PubSub} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic-with-dead'
const topicDeadName = 'my-dead-topic'
const pubsub = new PubSub({projectId});
  
async function createTopic(topicName){
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
    console.log(`Topic ${topicName} created.`);
  } catch (error) {
    console.error(error)
  }
}

async function quickstart() {
  await createTopic(topicName)
  await createTopic(topicDeadName)
  pubsub.topic(topicName).publish(Buffer.from('Test message with dead letter!'));
  console.log(`Publish message in ${topicName}.`);
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}