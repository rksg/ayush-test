import { DHCPPool }   from '../..'
import {
  DHCPConfigTypeEnum,
  ServiceTechnology
} from '../../constants'



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

export interface DHCPVenue {
  id?: string
  name?: string
  scheduler: {
    type: string
  }
  venueId: string
  dhcpId: string
}
