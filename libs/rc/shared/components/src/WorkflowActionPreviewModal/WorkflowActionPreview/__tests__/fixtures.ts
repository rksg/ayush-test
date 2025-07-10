import { ActionType, DataPromptAction, MacRegAction, MacRegistrationPool } from '@acx-ui/rc/utils'

export const mockDataPrompt:DataPromptAction = {
  title: 'My Title',
  messageHtml: 'My test message.',
  displayTitle: true,
  actionType: ActionType.DATA_PROMPT,
  displayMessageHtml: true,
  name: 'test-name',
  backButtonText: 'Back',
  continueButtonText: 'Continue',
  id: 'my-test-data-prompt',
  displayBackButton: true,
  displayContinueButton: true,
  description: '',
  version: 1,
  variables: [{ label: 'Thing 1', type: 'EMAIL' }, { label: 'Thing 2', type: 'INPUT_FIELD_1' }],
  valid: true
}

export const mockMacReg:MacRegAction = {
  identityGroupId: 'mac_reg_ig1',
  macRegListId: 'mac-reg-list1',
  identityId: '',
  actionType: ActionType.MAC_REG,
  name: 'mac-regtest-name',
  id: 'my-test-mac-reg',
  description: 'sothing',
  version: 1,
  valid: true
}
export const mockMacRegList: MacRegistrationPool = {
  id: 'mac-list-1',
  name: 'mac-list-1',
  networkIds: [
    'c9d5f4c771c34ad2898f7078cebbb191'
  ],
  autoCleanup: false,
  enabled: false,
  registrationCount: 0,
  defaultAccess: ''
}

export const mockedNetworkList = {
  totalCount: 10,
  page: 1,
  data: [
    {
      aps: 1,
      clients: 0,
      id: 'c9d5f4c771c34ad2898f7078cebbb191',
      name: 'network-01',
      nwSubType: 'psk',
      ssid: 'ssid-01',
      venues: { count: 3, names: ['pingtung', 'My-Venue', '101'] },
      count: 3,
      names: ['pingtung', 'My-Venue', '101'],
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: 'WPA3'
        }
      }
    },
    {
      aps: 0,
      captiveType: 'ClickThrough',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd8798',
      name: 'network-02',
      nwSubType: 'guest',
      ssid: 'ssid-02',
      venues: { count: 0, names: [] },
      vlan: 1
    }
  ]
}
