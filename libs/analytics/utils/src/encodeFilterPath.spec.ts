import { encodeFilterPath } from './encodeFilterPath'

describe('encodeFilterPath', () => {
  it('should return analytics filter correctly', () => {
    const filter = encodeFilterPath('analytics', [{ type: 'network', name: 'Network' }])
    expect(filter).toMatch('analyticsNetworkFilter=')
  })
  it('should return report filter correctly', () => {
    const filter = encodeFilterPath('report', [{ type: 'network', name: 'Network' }])
    expect(filter).toMatch('reportsNetworkFilter=')
  })
})
