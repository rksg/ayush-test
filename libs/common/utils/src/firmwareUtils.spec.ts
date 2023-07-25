import { compareVersions } from './firmwareUtils'

describe('FirmwareUtils parser', () => {

  it('should compare versions correctly', () => {
    const BASE_VERSION = '6.2.0'

    const mockedAVersion = '6.1.0.103.514'
    const mockedBVersion = '6.2.0.103.544'
    const mockedCVersion = '7.0.0'

    expect(compareVersions(mockedAVersion, BASE_VERSION) < 0).toBe(true)
    expect(compareVersions(mockedBVersion, BASE_VERSION) === 0).toBe(true)
    expect(compareVersions(mockedCVersion, BASE_VERSION) > 0).toBe(true)
  })

})

