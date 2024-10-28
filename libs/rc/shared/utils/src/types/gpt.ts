export interface GptConversation {
  sessionId: string,
  nextStep: GptConfigurationStepsEnum,
  payload: string,
  description: string
}

export interface GptConfiguration {
  content: string,
  id: string,
  name: string,
  sessionId: string
}
export enum GptConfigurationStepsEnum {
  WLANS = 'ssidProfile',
  WLANDETAIL = 'ssid',
  VLAN = 'vlan',
  SUMMARY = 'apply'
}
