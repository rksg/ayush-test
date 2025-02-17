import { BarChartData, TimeSeriesChartData } from '@acx-ui/analytics/utils'
import { DonutChartData, TableColumn }       from '@acx-ui/components'

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

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TableData {
  columns: TableColumn<any, 'text'>[]
  dataSource: any[]
}

// Ruckus AI Chat
export interface ChatHistory {
  id: string,
  name: string,
  updatedDate: string,
}

export interface RuckusAiChat {
  sessionId: string,
  messages: ChatMessage[],
  page: number,
  totalCount: number,
  totalPages: number
}

export interface RuckusAiChats {
  page: number,
  totalCount: number,
  totalPages: number,
  data: ChatMessage[]
}

export interface ChatMessage {
  id: string,
  role: string,
  text: string,
  created?: string,
  widgets?: ChatWidget[]
}

export interface HistoryListItem {
  duration: string
  history: ChatHistory[]
}

export interface ChatWidget {
  title: string,
  chartType: string,
  type?: 'time' & 'category',
  chartOption: DonutChartData[] & TimeSeriesChartData[] & BarChartData & TableData,
}

export interface WidgetListData {
  id: string,
  chatId: string,
  sessionId: string,
  chartType: string,
  chartOption: DonutChartData[] & TimeSeriesChartData[] & BarChartData & TableData,
  title?: string,
  type?: string,
  unit?: { [key:string]: string },
  axisType?: 'time' & 'category', // for line/bar chart
  multiseries?: boolean // for bar chart
  canvasId?: string
  widgetId?: string
  name?: string
}

export interface Canvas {
  id: string,
  name: string,
  content: string
}