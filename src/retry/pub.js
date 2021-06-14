require('dotenv').config()
const {PubSub, v1} = require('@google-cloud/pubsub');
const projectId = process.env.PROJECT_ID
const topicName = 'my-topic-with-retry-v3'
const subscriptionName = 'my-sub-with-retry-v3'
const pubsub = new PubSub({projectId});
const pubClient = new v1.PublisherClient({projectId});

const retrySettings = {
  retryCodes: [
    10, // 'ABORTED'
    1, // 'CANCELLED',
    4, // 'DEADLINE_EXCEEDED'
    13, // 'INTERNAL'
    8, // 'RESOURCE_EXHAUSTED'
    14, // 'UNAVAILABLE'
    2, // 'UNKNOWN'
  ],
  backoffSettings: {
    // The initial delay time, in milliseconds, between the completion
    // of the first failed request and the initiation of the first retrying request.
    initialRetryDelayMillis: 5000,
    // The multiplier by which to increase the delay time between the completion
    // of failed requests, and the initiation of the subsequent retrying request.
    retryDelayMultiplier: 2,
    // The maximum delay time, in milliseconds, between requests.
    // When this value is reached, retryDelayMultiplier will no longer be used to increase delay time.
    maxRetryDelayMillis: 10000,
    // The initial timeout parameter to the request.
    initialRpcTimeoutMillis: 10000,
    // The multiplier by which to increase the timeout parameter between failed requests.
    rpcTimeoutMultiplier: 2,
    // The maximum timeout parameter, in milliseconds, for a request. When this value is reached,
    // rpcTimeoutMultiplier will no longer be used to increase the timeout.
    maxRpcTimeoutMillis: 10000,
    // The total time, in milliseconds, starting from when the initial request is sent,
    // after which an error will be returned, regardless of the retrying attempts made meanwhile.
    totalTimeoutMillis: 30000,
  },
};

const formattedTopic = pubClient.projectTopicPath(
  projectId,
  topicName
);

const dataBuffer = Buffer.from('Test message with retry-2');
const messagesElement = {
  data: dataBuffer,
};
const messages = [messagesElement];

const request = {
  topic: formattedTopic,
  messages: messages,
};

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
  // const [response] = await pubClient.publish(request, {
  //   retry: retrySettings,
  //   retryPolicy: retrySettings,
  //   backoffSettings: {
  //     initialRetryDelayMillis: 5000,
  //     retryDelayMultiplier: 2,
  //     maxRetryDelayMillis: 10000,
  //     initialRpcTimeoutMillis: 10000,
  //     rpcTimeoutMultiplier: 2,
  //     maxRpcTimeoutMillis: 10000,
  //     totalTimeoutMillis: 30000,
  //   },
  //   retrySettings,
  // });
  // console.log(`Message ${response.messageIds} published.`);
  pubsub.topic(topicName).publish(Buffer.from('test retry v3!'));
  console.log(`Message published.`);
}

try {
  quickstart()
} catch (error) {
  console.error(error)
}