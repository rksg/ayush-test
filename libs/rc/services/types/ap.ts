
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

