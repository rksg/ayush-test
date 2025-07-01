import { isEqualLanPort } from './lanPortUtils'
import { WifiApSetting }  from './types'
import { VenueLanPorts }  from './types/venue'

describe('lanPortUtils', () => {

  const originalVenueLanPort: VenueLanPorts = {
    lanPorts: [
      {
        defaultType: 'TRUNK',
        type: 'TRUNK',
        untagId: 100,
        vlanMembers: '1-4094',
        portId: '1',
        enabled: true,
        id: '1',
        isPoeOutPort: false,
        isPoePort: true,
        supportDisable: false,
        trunkPortOnly: false,
        vni: 1
      },
      {
        defaultType: 'TRUNK',
        type: 'TRUNK',
        untagId: 1,
        vlanMembers: '1-4094',
        portId: '2',
        enabled: true,
        id: '2',
        isPoeOutPort: false,
        isPoePort: false,
        supportDisable: true,
        trunkPortOnly: false,
        vni: 1
      }
    ],
    model: 'R710',
    poeMode: 'Auto'
  }

  const defaultVenueLanPort: VenueLanPorts = {
    lanPorts: [
      {
        defaultType: 'TRUNK',
        type: 'TRUNK',
        ethernetPortProfileId: 'tenant-id_TRUNK',
        untagId: 1,
        vlanMembers: '1-4094',
        portId: '1',
        enabled: true,
        id: '1',
        isPoeOutPort: false,
        isPoePort: true,
        supportDisable: false,
        trunkPortOnly: false,
        vni: 1
      },
      {
        defaultType: 'ACCESS',
        type: 'ACCESS',
        ethernetPortProfileId: 'tenant-id_ACCESS',
        untagId: 1,
        vlanMembers: '1',
        portId: '2',
        enabled: true,
        id: '2',
        isPoeOutPort: false,
        isPoePort: false,
        supportDisable: true,
        trunkPortOnly: false,
        vni: 1
      }
    ],
    model: 'R710',
    poeMode: 'Auto'
  }

  const originApLanPorts: WifiApSetting = {
    poeMode: 'Auto',
    lanPorts: [
      {
        defaultType: 'TRUNK',
        type: 'TRUNK',
        untagId: 101,
        vlanMembers: '1-4094',
        portId: '1',
        enabled: true,
        id: '1',
        isPoeOutPort: false,
        isPoePort: false,
        trunkPortOnly: false,
        supportDisable: true,
        vni: 1
      },
      {
        defaultType: 'TRUNK',
        type: 'TRUNK',
        untagId: 1,
        vlanMembers: '1-4094',
        portId: '2',
        enabled: true,
        id: '2',
        isPoeOutPort: false,
        isPoePort: true,
        supportDisable: false,
        trunkPortOnly: false,
        vni: 1
      }
    ],
    useVenueSettings: true
  }

  const defaultApLanPorts: WifiApSetting = {
    poeMode: 'Auto',
    lanPorts: [
      {
        defaultType: 'ACCESS',
        type: 'ACCESS',
        ethernetPortProfileId: 'tenant-id_ACCESS',
        untagId: 1,
        vlanMembers: '1',
        portId: '1',
        enabled: true,
        id: '1',
        isPoeOutPort: false,
        isPoePort: false,
        trunkPortOnly: false,
        supportDisable: true,
        vni: 1
      },
      {
        defaultType: 'TRUNK',
        type: 'TRUNK',
        ethernetPortProfileId: 'tenant-id_TRUNK',
        untagId: 1,
        vlanMembers: '1-4094',
        portId: '2',
        enabled: true,
        id: '2',
        isPoeOutPort: false,
        isPoePort: true,
        supportDisable: false,
        trunkPortOnly: false,
        vni: 1
      }
    ],
    useVenueSettings: true
  }

  it('check same default venue lan port equality should be true', () => {

    const eqOriginLanPorts = isEqualLanPort(defaultVenueLanPort, defaultVenueLanPort)

    expect(eqOriginLanPorts).toEqual(true)
  })

  it('check different venue lan port equality should be false', () => {

    const eqDefaultLanPorts = isEqualLanPort(originalVenueLanPort, defaultVenueLanPort)

    expect(eqDefaultLanPorts).toEqual(false)
  })

  it('check same ap lan port equality should be true', () => {

    const eqOriginLanPorts = isEqualLanPort(originApLanPorts, originApLanPorts)

    expect(eqOriginLanPorts).toEqual(true)
  })

  it('check different ap lan port equality should be false', () => {

    const eqDefaultLanPorts = isEqualLanPort(originApLanPorts, defaultApLanPorts)

    expect(eqDefaultLanPorts).toEqual(false)
  })

  it('check same default ap lan port equality should be true', () => {
    const eqDefaultLanPorts = isEqualLanPort(defaultApLanPorts, defaultApLanPorts)

    expect(eqDefaultLanPorts).toEqual(true)
  })
})