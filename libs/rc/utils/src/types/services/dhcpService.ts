import { Venue } from '../index'
export interface DHCPDetailInstances {
  id: string,
  venue: Venue,
  aps: number
  switches: number
  health: number,
  successfulAllocations: number,
  unsuccessfulAllocations: number,
  droppedPackets: number,
  capacity: number
}

export interface DHCPSaveData {
  id?: string;
  dhcpPools: [];
}
