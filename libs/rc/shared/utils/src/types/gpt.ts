export interface GptConversation {
  sessionId: string,
  nextStep: GptConfigurationStepsEnum,
  payload: string,
  description: string
}

export enum GptConfigurationStepsEnum {
  WLANS = 'ssidProfile',
  WLANDETAIL = 'ssid',
  VLAN = 'vlan',
  SUMMARY = 'apply'
}
