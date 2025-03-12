import { getSummary } from './services'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtHeaders: jest.fn().mockImplementation(() => ({ Authorization: 'Bearer token' }))
}))

describe('getSummary', () => {
  const originalFetch = global.fetch
  let requestHeaders = {}

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((_, requestInit) => {
      requestHeaders = requestInit.headers
      return Promise.resolve({
        json: () => Promise.resolve({ summary: 'summary' })
      })
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    requestHeaders = {}
  })

  it('should call with auth header', async () => {
    await getSummary()
    expect(requestHeaders).toHaveProperty('Authorization')
  })
})
