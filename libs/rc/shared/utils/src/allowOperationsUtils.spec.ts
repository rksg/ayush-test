
import { genAllowOperationsPath } from './allowOperationsUtils'

describe('AllowOperationsUtils', () => {
  it('should gen allow operations path correctly', async () => {
    const mockApiInfo = {
      method: 'get',
      url: '/venues/:venueId/devices/:deviceId'
    }
    const result = genAllowOperationsPath(mockApiInfo)

    expect(result).toBe('GET:/venues/{id}/devices/{id}')
  })

  it('should gen allow operations path correctly with opsApi field', async () => {
    const mockApiInfo = {
      method: 'get',
      url: '/venues/:venueId/devices/:deviceId',
      opsApi: 'GET:/venues/{id}/test/{id}'
    }
    const result = genAllowOperationsPath(mockApiInfo)

    expect(result).toBe('GET:/venues/{id}/test/{id}')
  })
})