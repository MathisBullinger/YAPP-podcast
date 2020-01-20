import AWS from 'aws-sdk'

interface Key {
  podId: string
  SK: string
}

interface Item extends Key {
  [prop: string]: any
}

try {
  if (!process.env.IS_OFFLINE) {
    AWS.config.update({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.PODSERV_AWS_KEY_ID,
        secretAccessKey: process.env.PODSERV_AWS_KEY_SECRET,
      },
    })
  }
} catch (err) {
  console.log('error while updating aws config')
  throw err
}

const docClient = new AWS.DynamoDB.DocumentClient({
  ...(process.env.IS_OFFLINE && { endpoint: 'http://localhost:8000' }),
})
export const client = docClient
const table = 'podcasts'

export const get = (key: Key): Promise<Item> =>
  new Promise((resolve, reject) =>
    docClient
      .get({ TableName: table, Key: key })
      .promise()
      .then(({ Item }) => resolve(Item as any))
      .catch(err => {
        console.error('[DB] ERROR IN GET:', err.message)
        reject(err)
      })
  )

export const batchGet = (keys: Key[]): Promise<Item[]> =>
  new Promise((resolve, reject) =>
    docClient
      .batchGet({ RequestItems: { [table]: { Keys: keys } } })
      .promise()
      .then(({ Responses }) => resolve(Responses[table] as any))
      .catch(err => {
        console.error('[DB] ERROR IN BATCH GET:', err.message)
        reject(err)
      })
  )

export const put = (item: Item) =>
  docClient.put({ TableName: table, Item: item }).promise()
