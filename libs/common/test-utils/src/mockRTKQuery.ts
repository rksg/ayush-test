import { graphql } from 'msw'

import { mockServer } from './mockServer'

export const mockRTKQuery = (
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
