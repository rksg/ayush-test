import {
  enableNewApi,
  isDev, isIntEnv,
  isLocalHost, isQA,
  isScale,
  isStage, isProdEnv, createHttpRequest } from './apiService'

describe('ApiInfo', () => {
  it('Check the envrionment', async () => {
    expect(isLocalHost()).toBe(true)
    expect(isDev()).toBe(false)
    expect(isQA()).toBe(false)
    expect(isScale()).toBe(false)
    expect(isIntEnv()).toBe(false)
    expect(isStage()).toBe(false)
    expect(isProdEnv()).toBe(false)
  })

  it('Check enable new API', async () => {
    const apiInfo1 = {
      method: 'post',
      url: '/venues/aaaServers/query',
      oldUrl: '/api/switch/tenant/:tenantId/aaaServer/query',
      newApi: true
    }

    const apiInfo2 = {
      method: 'post',
      url: '/venues/aaaServers/query'
    }

    const httpRequest = {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'post',
      url: 'http://localhost/venues/aaaServers/query'
    }

    expect(enableNewApi(apiInfo1)).toBe(true)
    expect(enableNewApi(apiInfo2)).toBe(false)
    expect(createHttpRequest(apiInfo1)).toStrictEqual(httpRequest)
    expect(createHttpRequest(apiInfo2)).toStrictEqual(httpRequest)
  })

})
