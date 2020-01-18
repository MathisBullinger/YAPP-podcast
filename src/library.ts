import * as db from './dynamodb'

export async function getPodcast(
  id: string,
  fields: GqlField[]
): Promise<Podcast> {
  console.log(`get podcast ${id}`)
  const queryEpisodes = fields.find(({ name }) => name.value === 'episodes')
  const queries: Promise<any>[] = [getMeta(id)]
  if (queryEpisodes) queries.push(getEpisodes(id))

  try {
    const [meta, epResult] = await Promise.all(queries)
    if (!meta) return
    const episodes = epResult
      ? { episodes: (epResult.Items || []).filter(({ SK }) => SK !== 'meta') }
      : {}
    return {
      ...meta,
      ...episodes,
    }
  } catch (e) {
    console.warn(e)
  }
}

export async function getPodcasts(ids: string[], fields: GqlField[]) {
  ids = ids.filter(id => id)
  if (ids.length === 0) return []

  if (ids.length > 100) {
    const podcasts = await Promise.all(
      new Array(Math.ceil(ids.length % 100))
        .fill([])
        .map((_, i) => ids.slice(i * 100, (i + 1) * 100))
        .map(subIds => getPodcasts(subIds, fields))
    )
    return podcasts.reduce((a, b) => [...a, ...b])
  }

  console.log(`get podcasts ${ids.join()}`)
  const queryEpisodes = fields.find(({ name }) => name.value === 'episodes')
  const queries: Promise<any>[] = [batchGetMeta(...ids)]
  if (queryEpisodes) ids.forEach(id => queries.push(getEpisodes(id)))
  const results = (await Promise.all(queries)).flat()
  const meta = results.filter(({ SK }) => SK === 'meta')
  const episodes = results
    .filter(({ SK }) => SK !== 'meta')
    .map(({ Items }) => Items)
  return meta.map((meta, i) => ({
    ...meta,
    ...(episodes.length ? { episodes: episodes[i] } : {}),
  }))
}

export const getMeta = (podId: string) => db.get({ podId, SK: 'meta' })
export const batchGetMeta = (...ids: string[]) =>
  db.batchGet(ids.map(id => ({ podId: id, SK: 'meta' })))

const getEpisodes = (id: string) =>
  db.client
    .query({
      TableName: 'podcasts',
      KeyConditionExpression: '#podId = :podId',
      ExpressionAttributeNames: {
        '#podId': 'podId',
        '#date': 'date',
        '#file': 'file',
        '#title': 'title',
        '#duration': 'duration',
      },
      ExpressionAttributeValues: {
        ':podId': id,
      },
      ProjectionExpression: 'SK, #title, #date, #file, #duration',
    })
    .promise()

export const getEpisode = async (podId: string, SK: string) =>
  await db.get({ podId, SK })
