import { graphql, rest } from 'msw'

import { mockServer } from './mockServer'

type GQLLink = ReturnType<typeof graphql.link>
type GQLHandler = Parameters<GQLLink['query']>[1]

function isGQLHandler (
  result: { data?: any, error?: any } | GQLHandler // eslint-disable-line @typescript-eslint/no-explicit-any
): result is GQLHandler {
  return typeof result === 'function'
}

export const mockGraphqlQuery = (
  url: string,
  key: string,
  result: { data?: any, error?: any } | GQLHandler, // eslint-disable-line @typescript-eslint/no-explicit-any
  matchQuery: boolean = false
) => {
  const api = graphql.link(url)
  if (isGQLHandler(result)) return mockServer.use(api.query(key, result))
  mockServer.use(
    api.query(key, (req, res, ctx) => {
      if(matchQuery) {
        expect(req.body?.query).toMatchSnapshot()
        expect(req.body?.variables).toMatchSnapshot()
      }
      return result.error
        ? res(ctx.status(500), ctx.data({ error: result.error, ...result.data }))
        : res(ctx.data(result.data||{}))
    })
  )
}

export const mockGraphqlMutation = (
  url: string,
  key: string,
  result: { data?: any, error?: any } // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  const api = graphql.link(url)
  mockServer.use(
    api.mutation(key, (req, res, ctx) => {
      return result.error
        ? res(ctx.errors([result.error]))
        : res(ctx.data(result.data ?? {}))
    })
  )
}

export const mockRestApiQuery = (
  url: string,
  type: 'get' | 'post' | 'delete' | 'put' | 'patch',
  result: { status?: number, data?: any, error?: any, totalCount?: number, page?: number }, // eslint-disable-line @typescript-eslint/no-explicit-any
  omitData?: boolean,
  matchQuery?: boolean
) => {
  mockServer.use(
    rest[type](url, (req, res, ctx)=>{
      if (matchQuery) {
        expect(req.body).toMatchSnapshot()
      }
      return result.error
        ? res(ctx.status(result.status||500), ctx.json({ error: result.error }))
        : omitData
          ? res(ctx.status(result.status||200), ctx.json(result.data))
          : res(ctx.status(result.status||200), ctx.json(result))
    })
  )
}
