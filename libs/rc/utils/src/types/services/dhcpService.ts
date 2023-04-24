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
  allowWired?: boolean;
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
  startAddress: string;
  endAddress: string;
  networkAddress: string;
  numberOfHosts?: number;
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
  name?: string;
  usage: DHCPUsage[];
  venueIds?: string[];
}
export interface DHCPUsage {
  venueId: string;
  totalIpCount: number;
  usedIpCount: number;
}

export interface VenueDHCPProfile {
  serviceProfileId: string,
  enabled: boolean,
  dhcpServiceAps: DHCPProfileAps[],
  wanPortSelectionMode: string,
  id: string
}

export interface DHCPProfileAps {
  serialNumber: string,
  role: string
}

export enum DHCPLeasesStatusEnum {
  OFFLINE = 'Offline',
  ONLINE = 'Online'
}

export interface DHCPLeases {
  hostname: string,
  ipAddress: string,
  dhcpPoolId: string,
  dhcpPoolName: string,
  macAddress: string,
  status: DHCPLeasesStatusEnum,
  leaseExpiration: string
}
export interface VenueDHCPPoolInst {
  name: string,
  vlanId: number,
  subnetAddress: string,
  subnetMask: string,
  startIpAddress: string,
  endIpAddress: string,
  primaryDnsIp: string,
  secondaryDnsIp: string,
  leaseTimeHours: number,
  leaseTimeMinutes: number,
  totalIpCount: number,
  usedIpCount: number
  active: boolean,
  id: string,

}
