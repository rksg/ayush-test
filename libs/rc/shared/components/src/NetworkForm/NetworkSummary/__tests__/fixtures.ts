import { WlanSecurityEnum, PassphraseFormatEnum, PassphraseExpirationEnum, NetworkTypeEnum } from '@acx-ui/rc/utils'

export const mockAaaNetworkSummary = {
  name: 'test',
  type: NetworkTypeEnum.AAA,
  isCloudpathEnabled: false,
  venues: [
    {
      venueId: '6cf550cdb67641d798d804793aaa82db',
      name: 'My-Venue'
    }
  ],
  wlanSecurity: WlanSecurityEnum.WPA2Enterprise,
  passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
  passphraseLength: 18,
  expiration: PassphraseExpirationEnum.UNLIMITED,
  enableAccountingService: false,
  enableAuthProxy: true,
  authRadius: {
    primary: {
      ip: '1.1.1.1',
      port: 1812,
      sharedSecret: 'xxxxxxxx'
    },
    secondary: {
      ip: '2.2.2.2',
      port: 1812,
      sharedSecret: 'xxxxxxxx'
    }
  },
  accountingRadius: {
    primary: {
      ip: '1.1.1.1',
      port: 1813,
      sharedSecret: 'xxxxxxxx'
    },
    secondary: {
      ip: '2.2.2.2',
      port: 1813,
      sharedSecret: 'xxxxxxxx'
    }
  },
  wlan: {
    macAddressAuthenticationConfiguration: {
      macAddressAuthentication: true
    }
  }
}

export const mockOpenNetworkSummary = {
  name: 'test',
  type: NetworkTypeEnum.OPEN,
  isCloudpathEnabled: false,
  venues: [
    {
      venueId: '6cf550cdb67641d798d804793aaa82db',
      name: 'My-Venue'
    }
  ],
  wlanSecurity: WlanSecurityEnum.OWE,
  passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
  passphraseLength: 18,
  expiration: PassphraseExpirationEnum.UNLIMITED,
  enableAccountingService: false,
  enableAuthProxy: true,
  authRadius: {
    primary: {
      ip: '1.1.1.1',
      port: 1812,
      sharedSecret: 'xxxxxxxx'
    },
    secondary: {
      ip: '2.2.2.2',
      port: 1812,
      sharedSecret: 'xxxxxxxx'
    }
  },
  accountingRadius: {
    primary: {
      ip: '1.1.1.1',
      port: 1813,
      sharedSecret: 'xxxxxxxx'
    },
    secondary: {
      ip: '2.2.2.2',
      port: 1813,
      sharedSecret: 'xxxxxxxx'
    }
  },
  wlan: {
    macAddressAuthenticationConfiguration: {
      macAddressAuthentication: true
    },
    macAddressAuthentication: true
  }
}