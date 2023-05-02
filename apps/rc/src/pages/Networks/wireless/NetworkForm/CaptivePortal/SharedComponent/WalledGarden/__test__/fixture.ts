import { NetworkSaveData,NetworkTypeEnum } from '@acx-ui/rc/utils'

export const MockNetworkSetting : NetworkSaveData = {
  type: NetworkTypeEnum.CAPTIVEPORTAL,
  guestPortal: {
    enableSelfService: true,
    enableSmsLogin: false,
    maxDevices: 1,
    endOfDayReauthDelay: false,
    macCredentialsDuration: 240,
    lockoutPeriod: 120,
    lockoutPeriodEnabled: false,
    guestPage: {
      wifi4Eu: false
    },
    socialEmails: false,
    userSessionTimeout: 1440,
    userSessionGracePeriod: 60,
    walledGardens: [
      'devalto.ruckuswireless.com'
    ]
  },
  tenantId: '4c39ee6b1107452c83a03c2358a4388c',
  enableDhcp: false,
  enableAuthProxy: false,
  enableAccountingProxy: false,
  portalServiceProfileId: 'e7a01792-63c0-4231-b205-711db0dddfb6',
  name: 'AAA',
  id: '674ff0a3f5a74e018b0ceeacb790516d'
}