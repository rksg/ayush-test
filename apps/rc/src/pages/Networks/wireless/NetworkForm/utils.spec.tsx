import { DpskWlanAdvancedCustomization, GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { hasAccountingRadius, hasAuthRadius, hasVxLanTunnelProfile } from './utils'

describe('Network utils test', () => {
  it('Test network types for show the RADIUS Options settings', () => {
    // AAA network type
    const aaaData = { type: NetworkTypeEnum.AAA }
    const aaaWlanData = { }
    expect(hasAuthRadius(aaaData, aaaWlanData)).toBeTruthy()

    // open/psk network type
    const openData = { type: NetworkTypeEnum.OPEN }
    const pskData = { type: NetworkTypeEnum.PSK }
    let wlanData = {
      wlan: {
        macAddressAuthentication: true,
        isMacRegistrationList: true
      }
    }
    expect(hasAuthRadius(openData, wlanData)).toBeFalsy()
    expect(hasAuthRadius(pskData, wlanData)).toBeFalsy()

    wlanData = {
      wlan: {
        macAddressAuthentication: false,
        isMacRegistrationList: false
      }
    }
    expect(hasAuthRadius(openData, wlanData)).toBeFalsy()
    expect(hasAuthRadius(pskData, wlanData)).toBeFalsy()

    wlanData = {
      wlan: {
        macAddressAuthentication: true,
        isMacRegistrationList: false
      }
    }
    expect(hasAuthRadius(openData, wlanData)).toBeTruthy()
    expect(hasAuthRadius(pskData, wlanData)).toBeTruthy()

    // dpsk network type
    const dpskData = { type: NetworkTypeEnum.DPSK }
    let dpskWlanData = { isCloudpathEnabled: true }
    expect(hasAuthRadius(dpskData, dpskWlanData)).toBeTruthy()
    dpskWlanData = { isCloudpathEnabled: false }
    expect(hasAuthRadius(dpskData, dpskWlanData)).toBeFalsy()

    // captive portal network type
    let guestData = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.Cloudpath
      }
    }
    expect(hasAuthRadius(guestData, {})).toBeTruthy()

    guestData = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.WISPr
      }
    }

    const guestWlanData = {
      guestPortal: {
        wisprPage: {
          customExternalProvider: true
        }
      }
    }
    expect(hasAuthRadius(guestData, guestWlanData)).toBeTruthy()

    const guestAlwayAccessWlanData = {
      guestPortal: {
        wisprPage: {
          customExternalProvider: true,
          authType: 'ALWAYS_ACCEPT'
        }
      }
    }
    expect(hasAuthRadius(guestData, guestAlwayAccessWlanData)).toBeFalsy()

    const guestAccountData = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      enableAccountingService: true,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.WISPr
      }
    }
    expect(hasAuthRadius(guestAccountData, guestAlwayAccessWlanData)).toBeTruthy()

    expect(hasAuthRadius({ }, {})).toBeFalsy()
  })

  // eslint-disable-next-line max-len
  it('Test network settings for show the SingleSessionIdAccounting of the RADIUS Options', () => {
    let wlanData = { }

    // AAA/open/psk/dpsk network type
    let aaaData = { type: NetworkTypeEnum.AAA, enableAccountingService: false }
    let openData = { type: NetworkTypeEnum.OPEN, enableAccountingService: false }
    let pskData = { type: NetworkTypeEnum.PSK, enableAccountingService: false }
    expect(hasAccountingRadius(aaaData, wlanData)).toBeFalsy()
    expect(hasAccountingRadius(openData, wlanData)).toBeFalsy()
    expect(hasAccountingRadius(pskData, wlanData)).toBeFalsy()

    aaaData = { type: NetworkTypeEnum.AAA, enableAccountingService: true }
    openData = { type: NetworkTypeEnum.OPEN, enableAccountingService: true }
    pskData = { type: NetworkTypeEnum.PSK, enableAccountingService: true }
    expect(hasAccountingRadius(aaaData, wlanData)).toBeTruthy()
    expect(hasAccountingRadius(openData, wlanData)).toBeTruthy()
    expect(hasAccountingRadius(pskData, wlanData)).toBeTruthy()


    // captive portal network type
    let guestData = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      enableAccountingService: false,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.WISPr
      }
    }

    let guestWlanData = {
      guestPortal: {
        wisprPage: {
          customExternalProvider: false,
          externalProviderName: 'Height8'
        }
      }
    }
    expect(hasAccountingRadius(guestData, guestWlanData)).toBeFalsy()

    guestWlanData = {
      guestPortal: {
        wisprPage: {
          customExternalProvider: false,
          externalProviderName: 'Aislelabs'
        }
      }
    }
    expect(hasAccountingRadius(guestData, guestWlanData)).toBeTruthy()

    guestWlanData = {
      guestPortal: {
        wisprPage: {
          customExternalProvider: true,
          externalProviderName: 'Other Provider'
        }
      }
    }

    expect(hasAccountingRadius(guestData, guestWlanData)).toBeFalsy()


    guestData = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      enableAccountingService: true,
      guestPortal: {
        guestNetworkType: GuestNetworkTypeEnum.WISPr
      }
    }
    expect(hasAccountingRadius(guestData, guestWlanData)).toBeTruthy()

    expect(hasAccountingRadius({ }, {})).toBeFalsy()
  })

  it('test hasVxlanTunnelProfile',async () => {
    const dpskWlanWithTunnelProfile = {
      name: 'testVxlanDisplay',
      type: 'dpsk',
      wlan: {
        advancedCustomization: {
          tunnelProfileId: 'test123'
        } as DpskWlanAdvancedCustomization
      }
    } as NetworkSaveData
    expect(hasVxLanTunnelProfile(dpskWlanWithTunnelProfile)).toBeTruthy()

    const dpskWlanWithoutTunnelProfile = {
      name: 'testVxlanDisplay',
      type: 'dpsk'
    } as NetworkSaveData
    expect(hasVxLanTunnelProfile(dpskWlanWithoutTunnelProfile)).toBeFalsy()
  })
})