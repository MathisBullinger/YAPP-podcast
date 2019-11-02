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
        console.error(
          '[DB] ERROR IN GET:',
          err.errorMessage || err.message || err
        )
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
        console.error('[DB] ERROR IN BATCH GET:', err.errorMessage)
        reject(err)
      })
  )

export const put = (item: Item) =>
  docClient.put({ TableName: table, Item: item }).promise()

export const update = (
  key: Key,
  props: { [key: string]: string | number }
): Promise<{ [prop: string]: any }> =>
  new Promise((resolve, reject) => {
    if (Object.entries(props).length === 0) {
      reject('must have properties')
      return
    }
    docClient
      .update({
        TableName: table,
        Key: key,
        UpdateExpression: `set ${Object.keys(props)
          .map(k => `${k}=:${k}`)
          .join(', ')}`,
        ConditionExpression: 'podId = :podId AND SK = :SK',
        ExpressionAttributeValues: {
          ...Object.entries(props).reduce(
            (a, [k, v]) => ({ ...a, ...{ [`:${k}`]: v } }),
            {}
          ),
          ':podId': key.podId,
          ':SK': key.SK,
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise()
      .then(({ Attributes }) => resolve(Attributes))
      .catch(err => {
        console.error('[DB] ERROR IN UPDATE:', err.errorMessage)
        reject(err)
      })
  })
