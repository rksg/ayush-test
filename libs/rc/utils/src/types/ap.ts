
export interface APRadio {
  channel?: number,
  band: string,
  radioId: number,
  txPower?: string,
  Rssi: string
}
export interface AP {
  IP?: string
  apMac?: string
  apStatusData?: {
    APRadio?: Array<APRadio>
  },
  clients?: number,
  deviceGroupId: string,
  deviceGroupName?: string,
  deviceStatus: string,
  meshRole: string,
  model: string,
  name?: string,
  serialNumber: string,
  tags: string,
  venueId: string,
  venueName: string
}

export interface ApExtraParams {
  channel24: boolean,
  channel50: boolean,
  channelL50: boolean,
  channelU50: boolean,
  channel60: boolean
}

export interface ApStatusDetails {
  name: string,
  serialNumber: string
}
export interface APMesh {
  IP?: string
  apMac?: string
  apStatusData?: {
    APRadio?: Array<APRadio>
  },
  clients?: number,
  deviceGroupId?: string,
  deviceGroupName?: string,
  deviceStatus?: string,
  meshRole: string,
  hops?: number,
  downlink?: APMesh,
  uplink?: uplink[],
  model: string,
  name?: string,
  serialNumber: string,
  tags: string,
  venueId: string,
  venueName: string,
  apUpRssi?: number,
  apDownRssi?: number,
  rssi?: number,
  children: APMesh
}

interface uplink{
  txFrames: string,
  rssi: number,
  rxBytes: string,
  txBytes: string,
  rxFrames: string,
  type: number,
  upMac: string
}