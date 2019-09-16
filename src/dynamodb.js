import AWS from 'aws-sdk'

AWS.config.update({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
})

const docClient = new AWS.DynamoDB.DocumentClient()

docClient.get(
  {
    TableName: 'podcasts',
    Key: {
      podId: 'foo',
      SK: '*',
    },
  },
  (err, data) => {
    if (err) console.error(err)
    console.info(data)
  }
)
