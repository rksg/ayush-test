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
})