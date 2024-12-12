import { TimeSeriesChartData } from '@acx-ui/analytics/utils';
import { DonutChartData } from '@acx-ui/components'

export interface RuckusAiConversation {
  sessionId: string,
  nextStep: RuckusAiConfigurationStepsEnum,
  payload: string,
  description: string,
  hasChanged?: boolean
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
  chartOption: DonutChartData[] & TimeSeriesChartData[]; // TODO enhance to more type of chart data
}

export interface RuckusAiChat {
  sessionId: string,
  messages: ChatMessage[]
}

export interface ChatMessage {
  id: string,
  role: string,
  text: string,
  widgets?: ChatWidget[]
}

export interface ChatWidget {
  title: string,
  chartType: string,
}

export interface WidgetListData {
  id: string,
  title: string,
  chartType: string,
  sessionId: string,
  chatId: string
}