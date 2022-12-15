import {
  DHCPConfigTypeEnum
} from '../../constants'
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

export enum LeaseUnit {
  HOURS = 'leaseTimeHours',
  MINUTES = 'leaseTimeMinutes'
}

export interface DHCPPool {
  id: string;
  name: string;
  description?: string;
  // allowWired: boolean;
  subnetAddress: string;
  subnetMask: string;
  startIpAddress: string;
  endIpAddress: string;
  primaryDnsIp: string;
  secondaryDnsIp: string;

  leaseTime?: number;
  leaseUnit?: LeaseUnit;

  leaseTimeHours?: number;
  leaseTimeMinutes?: number;

  vlanId: number;
  dhcpOptions: DHCPOption[];
  activated?: boolean;
}

export interface DHCPOption{
  optId: string;
  id: number;
  optName: string;
  format: string;
  value: string;
}
export interface CreateDHCPFormFields {
  serviceName: string;
  dhcpMode: DHCPConfigTypeEnum;
  dhcpPools: DHCPPool[];
}
export interface DHCPSaveData extends CreateDHCPFormFields {
  id?: string;
  venueIds: string[];
}
