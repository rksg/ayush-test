
export interface ApList {
  IP: string
  apMac: string
  apStatus: {
    APRadio: []
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

