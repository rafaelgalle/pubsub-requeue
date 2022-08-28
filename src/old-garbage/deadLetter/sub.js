require('dotenv').config()

const {PubSub} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic-with-dead'
const topicDeadName = 'my-dead-topic'
const subscriptionName = 'my-sub-with-dead'
const subscriptionDeadName = 'my-dead-sub'
const pubsub = new PubSub({projectId});
  
// async function createTopic(topicName) {
//   try {
//     const [topics] = await pubsub.getTopics();
//     for (const i in topics) {
//       const topic = topics[i]
//       let name = topic.name.split('/')
//       name = name[name.length -1]
//       if (name === topicName) {
//         console.log(`Topic ${topicName} already exists.`);
//         return
//       }
//     }
//     topic = await pubsub.createTopic(topicName);
//     console.log(`Topic ${topicName} created.`);
//   } catch (error) {
//     console.error(error)
//   }
// }

async function createSubscription(topicName, subscriptionName, config) {
  try {
    const [subscriptions] = await pubsub.getSubscriptions();
    for (const i in subscriptions) {
      const subscription = subscriptions[i]
      let name = subscription.name.split('/')
      name = name[name.length -1]
      if (name === subscriptionName) {
        console.log(`Subscription ${subscriptionName} already exists.`);
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
  // await createTopic(topicName)
  // await createTopic(topicDeadName)
  await createSubscription(topicName, subscriptionName, {
    deadLetterPolicy: {
      deadLetterTopic: pubsub.topic(topicDeadName).name,
      maxDeliveryAttempts: 5,
    }
  })
  await createSubscription(topicDeadName, subscriptionDeadName, {})

  pubsub.subscription(subscriptionName).on('message', message => {
    console.log(subscriptionName + ' Received message:', message.data.toString());
    console.log('DeliveryAttempt: ', message.deliveryAttempt);
    console.log('publishTime: ', message.publishTime);
    console.log('Attributes: ', message.attributes);
    console.log('Send nack message');
    setTimeout(() => {
      message.nack();
    }, 2000);
    //process.exit(0);
  });

  pubsub.subscription(subscriptionName).on('error', error => {
    console.error(subscriptionName + ' Received error:', error);
    process.exit(1);
  });

  pubsub.subscription(subscriptionDeadName).on('message', message => {
    console.log(subscriptionDeadName + ' Received message:', message.data.toString());
    console.log('Send nack message');
    // message.nack();
    message.ack();
    //process.exit(0);
  });

  pubsub.subscription(subscriptionDeadName).on('error', error => {
    console.error(subscriptionDeadName + ' Received error:', error);
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