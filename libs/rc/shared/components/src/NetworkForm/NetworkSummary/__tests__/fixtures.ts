import { WlanSecurityEnum, PassphraseFormatEnum, PassphraseExpirationEnum, NetworkTypeEnum, NetworkSaveData } from '@acx-ui/rc/utils'

export const mockMacRegListData = {
  content: [
    {
      id: 'mac-reg-list-1',
      name: 'Test MAC Registration List 1',
      autoCleanup: true,
      enabled: true,
      registrationCount: 5,
      defaultAccess: 'ACCEPT'
    },
    {
      id: 'mac-reg-list-2',
      name: 'Test MAC Registration List 2',
      autoCleanup: false,
      enabled: true,
      registrationCount: 10,
      defaultAccess: 'REJECT'
    }
  ],
  pageable: {
    sort: { unsorted: true, sorted: false, empty: true },
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 2,
  last: true,
  sort: { unsorted: true, sorted: false, empty: true },
  numberOfElements: 2,
  first: true,
  size: 10,
  number: 0,
  empty: false
}

export const baseMockSummary = {
  name: 'test-network',
  type: 'psk' as NetworkTypeEnum,
  isCloudpathEnabled: false,
  venues: [
    {
      venueId: '6cf550cdb67641d798d804793aaa82db',
      name: 'My-Venue'
    }
  ]
} as NetworkSaveData

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