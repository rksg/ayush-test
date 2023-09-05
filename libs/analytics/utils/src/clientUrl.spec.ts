import { getClientUrlWithHostname } from './clientUrl'

describe('getClientUrlWithHostname', () => {
  it('should return correctly with macAddr', () => {
    let link = getClientUrlWithHostname('testMac')
    expect(link).toMatch('users/wifi/clients/testmac/details/overview')

    link = getClientUrlWithHostname(['firstMac', 'secondMac'])
    expect(link).toMatch('users/wifi/clients/firstmac/details/overview')
  })

  it('should return correctly with hostname', () => {
    let link = getClientUrlWithHostname('testMac', 'testHost')
    expect(link).toMatch('users/wifi/clients/testmac/details/overview?hostname=testHost')

    link = getClientUrlWithHostname('filterMac', ['filterMac', 'legitHost', 'Unknown'])
    expect(link)
      .toMatch('users/wifi/clients/filtermac/details/overview?hostname=legitHost, Unknown')
  })

  it('should return correctly with period', () => {
    let link = getClientUrlWithHostname('periodMac', undefined, 'periodTest')
    expect(link).toMatch('users/wifi/clients/periodmac/details/overview?period=periodTest')
  })
})
