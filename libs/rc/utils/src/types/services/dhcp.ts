import {
  DHCPConfigTypeEnum
} from '../../constants'

export interface CreateDHCPFormFields {
  name: string;
  tags: string[];
  dhcpConfig: DHCPConfigTypeEnum;
  dhcpPools?: DHCPConfigTypeEnum[];
  venues: DHCPVenue[];
}

export interface DHCPSaveData extends CreateDHCPFormFields {
  id?: string;
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
