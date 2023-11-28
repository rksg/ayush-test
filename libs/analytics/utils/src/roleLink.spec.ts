import { encodeFilterPath, roleLink } from './roleLink'

describe('roleLink', () => {
  beforeEach(() => jest.resetAllMocks())
  it('should return base link', () => {
    const link = roleLink({ base: { routePath: '/base/test' } }, 'report-only')
    expect(link).toMatch('/base/test')
  })
  it('should return base link with altRoute', () => {
    const link = roleLink({ base: { routePath: '/base/test', altPath: '/alt' } }, 'admin')
    expect(link).toMatch('/alt')
  })
  it('should return role link', () => {
    const link = roleLink({
      'base': { routePath: '/base/test' },
      'report-only': { routePath: '/report-only/' }
    }, 'report-only')
    expect(link).toMatch('/report-only')
  })
  it('should return role link with altRoute', () => {
    const link = roleLink({
      'base': { routePath: '/base/test' },
      'report-only': { routePath: '/report-only/', altPath: '/alt-report' }
    }, 'report-only')
    expect(link).toMatch('/alt-report')
  })
})

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
