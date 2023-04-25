import { enableNewApi,
  isDev, isIntEnv,
  isLocalHost, isQA,
  isScale, isMSP,
  isStage, isProdEnv,
  getHostNameForMSPDataStudio } from './apiService'

describe('ApiInfo', () => {
  it('Check the envrionment', async () => {
    expect(isLocalHost()).toBe(true)
    expect(isDev()).toBe(false)
    expect(isQA()).toBe(false)
    expect(isScale()).toBe(false)
    expect(isIntEnv()).toBe(false)
    expect(isStage()).toBe(false)
    expect(isProdEnv()).toBe(false)
    expect(isMSP()).toBe(false)
  })

  it('should return original domain for msp-ec case', async () => {
    expect(getHostNameForMSPDataStudio(
      'https://some-msp-user.msp.eu.ruckus.cloud.com')).toBe('https://eu.ruckus.cloud.com')
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

    expect(enableNewApi(apiInfo1)).toBe(true)
    expect(enableNewApi(apiInfo2)).toBe(false)
  })
})
