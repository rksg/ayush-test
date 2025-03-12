import { responseBody, uploadRes }                     from './__tests__/fixtures'
import { AskMelissaBody, queryAskMelissa, uploadFile } from './services'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtHeaders: jest.fn().mockImplementation(() => ({ Authorization: 'Bearer token' }))
}))

describe('queryAskMelissa', () => {
  const originalFetch = global.fetch
  let requestHeaders = {}

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((_, requestInit) => {
      requestHeaders = requestInit.headers
      return Promise.resolve({
        json: () => Promise.resolve(responseBody)
      })
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    requestHeaders = {}
  })

  it('should call with auth header', async () => {
    await queryAskMelissa({} as AskMelissaBody)
    expect(requestHeaders).toHaveProperty('Authorization')
  })
})

describe('uploadFile', () => {
  const originalFetch = global.fetch
  let requestHeaders = {}

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((_, requestInit) => {
      requestHeaders = requestInit.headers
      return Promise.resolve({
        json: () => Promise.resolve(uploadRes)
      })
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    requestHeaders = {}
  })

  it('should call with auth header', async () => {
    await uploadFile('id', {} as FormData)
    expect(requestHeaders).toHaveProperty('Authorization')
  })
})
