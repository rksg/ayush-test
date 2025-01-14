import { genAllowOperationsPath } from './allowOperationsUtils'

describe('AllowOperationsUtils', () => {
  it('should gen allow operations path correctly', async () => {
    const mockApiInfo = {
      method: 'get',
      url: '/venues/:venueId/devices/:deviceId'
    }
    const result = genAllowOperationsPath(mockApiInfo)

    expect(result).toBe('GET:/venues/{venueId}/devices/{deviceId}')
  })

  it('should gen allow operations path correctly with opsApiField', async () => {
    const mockApiInfo = {
      method: 'post',
      url: '/venues/:venueId/devices/:deviceId',
      opsApi: 'POST:/venues/{venueId}/devices/{id}'
    }
    const result = genAllowOperationsPath(mockApiInfo)

    expect(result).toBe('POST:/venues/{venueId}/devices/{id}')
  })
})