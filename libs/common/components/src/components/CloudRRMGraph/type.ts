export enum BandEnum {
  _2_4_GHz = '2.4',
  _5_GHz = '5',
  _6_GHz = '6',
}

export type CloudRRMNode = {
  apMac: string
  apName: string
  channelWidth: (number|'NaN')[]
  channel: number[]
  txPower: (string|null)[]
}

export type CloudRRMLink = {
  source: string
  target: string
}

export interface CloudRRMGraph {
  nodes: CloudRRMNode[]
  links: CloudRRMLink[]
  interferingLinks: null | string[]
}

export enum CategoryState {
  Highlight = 'highlight',
  Normal = 'normal',
  TxPower = 'txPower'
}

export enum LineStyle {
  Solid = 'solid',
  Dotted = 'dotted'
}

export interface ProcessedCloudRRMLink extends CloudRRMLink {
  category: CategoryState
}

export type AggregatedNodeSet = {
  channelWidth: number| 'NaN'
  channel: number
  txPower: string | null
  group: number | undefined
  channelList: number[]
}

export interface ProcessedCloudRRMNode extends CloudRRMNode {
  aggregate: Array<AggregatedNodeSet & { highlighted: boolean }>
  band: BandEnum
  id: CloudRRMNode['apMac']
  name: CloudRRMNode['apName']
  symbolSize: number
  value: CloudRRMNode['channel']
  category: CategoryState
  showTooltip?: boolean
}

export interface ProcessedCloudRRMGraph {
  nodes: ProcessedCloudRRMNode[]
  links: ProcessedCloudRRMLink[]
  categories: Array<{ name: CategoryState }>
}
