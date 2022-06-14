
export interface APRadio {
  channel: number,
  band: string,
  radioId: number,
  txPower: string,
  Rssi: string
}
export interface ApList {
  IP: string
  apMac: string
  apStatusData?: {
    APRadio?: Array<APRadio>
  },
  clients: number,
  deviceGroupId: string,
  deviceGroupName: string,
  deviceStatus: string,
  meshRole: string,
  model: string,
  name: string,
  serialNumber: string,
  tags: string,
  venueId: string,
  venueName: string
}

