// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import 'whatwg-fetch'
import '@testing-library/jest-dom'

import { graphql }     from 'msw'
import { setupServer } from 'msw/node'

export const server = setupServer()
export const mockRTKQuery = (
  url: string,
  key: string,
  result: { data?: object, error?: object }
) => {
  const api = graphql.link(url)
  server.use(
    api.query(key, (req, res, ctx) => {
      return result.error
        ? res(ctx.errors([result.error]))
        : res(ctx.data(result.data||{}))
    })
  )
}

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
