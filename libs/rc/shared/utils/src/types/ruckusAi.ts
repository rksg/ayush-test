export interface RuckusAiConversation {
  sessionId: string,
  nextStep: RuckusAiConfigurationStepsEnum,
  payload: string,
  description: string
}

export interface RuckusAiConfiguration {
  content: string,
  id: string,
  name: string,
  sessionId: string
}
export enum RuckusAiConfigurationStepsEnum {
  WLANS = 'ssidProfile',
  WLANDETAIL = 'ssid',
  VLAN = 'vlan',
  SUMMARY = 'apply'
}
