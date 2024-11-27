import {DonutChartData} from "@acx-ui/components";

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

// Ruckus AI Chat
export interface WidgetData {
  id: number;
  chartOption: DonutChartData[]; // TODO enhance to more type of chart data
}

export interface RuckusAiChatResponse {
  sql: string,
  data: string,
  answer: string
}
