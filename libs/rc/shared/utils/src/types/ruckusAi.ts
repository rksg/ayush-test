export interface RuckusAiChat {
  sessionId: string,
  messages: ChatMessage[]
}

export interface ChatMessage {
  id: string,
  type: string,
  text: string,
  widgets?: ChatWidget[]
}

export interface ChatWidget {
  chartType: string,
  payload: string
}


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
