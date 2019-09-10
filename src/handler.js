import { ApolloServer } from 'apollo-server-lambda'
import * as Sentry from '@sentry/node'
import typeDefs from './schema.gql'
import resolvers from './resolvers'
import { buildFederatedSchema } from '@apollo/federation'

export const podcast = async (event, context) => {
  Sentry.init({
    dsn: 'https://cbf2bcf6423f40439af579143e57a69c@sentry.io/1512573',
  })

  const server = new ApolloServer({
    schema: buildFederatedSchema([{ typeDefs, resolvers }]),
    formatError: error => {
      Sentry.captureException(error)
      return error
    },
    playground:
      process.env.stage === 'prod'
        ? false
        : {
          endpoint: `/${process.env.stage}`,
          settings: {
            'schema.polling.enable': false,
          },
        },
  })
  const handler = server.createHandler({
    ...(process.env.stage === 'dev' && {
      cors: {
        origin: '*',
        credentials: true,
      },
    }),
  })

  const response = await new Promise((resolve, reject) => {
    const callback = (error, body) => (error ? reject(error) : resolve(body))
    handler(event, context, callback)
  })

  const sentryClient = Sentry.getCurrentHub().getClient()
  if (sentryClient) {
    await sentryClient.close(2000)
  }

  return response
}
