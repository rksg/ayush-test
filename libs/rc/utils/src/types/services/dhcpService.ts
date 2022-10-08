import {
  DHCPConfigTypeEnum,
  ServiceTechnology
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

export interface DHCPOption{
  optId: string;
  id: number;
  optName: string;
  format: string;
  value: string;
}

export interface DHCPVenue {
  id?: string
  name?: string
  scheduler: {
    type: string
  }
  venueId: string
  dhcpId: string
}

export interface DHCPPool {
  id: number;
  name: string;
  description?: string;
  allowWired: boolean;
  ip: string;
  mask: string;
  excludedRangeStart?: string;
  excludedRangeEnd?: string;
  primaryDNS: string;
  secondaryDNS: string;
  leaseTime: number;
  leaseUnit: string;
  vlan: number;
  dhcpOptions: DHCPOption[];
}
export interface CreateDHCPFormFields {
  name: string;
  tags: string[];
  createType: ServiceTechnology;
  dhcpConfig: DHCPConfigTypeEnum;
  dhcpPools: DHCPPool[];
  venues: DHCPVenue[];
}

export interface DHCPSaveData extends CreateDHCPFormFields {
  id?: string;
}
