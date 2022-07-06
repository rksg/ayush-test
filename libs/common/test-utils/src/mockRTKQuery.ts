import { graphql, rest } from 'msw'

import { mockServer } from './mockServer'

export const mockGraphqlQuery = (
  url: string,
  key: string,
  result: { data?: any, error?: any } // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  const api = graphql.link(url)
  mockServer.use(
    api.query(key, (req, res, ctx) => {
      return result.error
        ? res(ctx.errors([result.error]))
        : res(ctx.data(result.data||{}))
    })
  )
}

export const mockRestApiQuery = (
  url: string,
  type: 'get' | 'post',
  result: { status?: number, data?: any, error?: any } // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  mockServer.use(
    rest[type](url, (req, res, ctx)=>{
      return result.error
        ? res(ctx.status(result.status||500), ctx.json({ error: result.error }))
        : res(ctx.status(result.status||200), ctx.json({ data: result.data }))
    })
  )
}
