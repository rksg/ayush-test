export interface VenueSaveData {
  name?: string;
  description?: string;
  notes?: string;
  address?: Address;
  latitude?: number;
  longitude?: number;
  networkCount?: number;
  apCount?: number;
  clientCount?: number;
  activeNetworksToolTip?: string;
  //activatedNetworks?: Array<any>;
  disabledActivation?: boolean;
  allApDisabled?: boolean;
  dataFulfilled?: boolean;
  disabledBySSIDActivated?: boolean;
  disableByMaxReached?: boolean;
  mesh?: MeshOptions;
  dhcp?: DhcpOptions;
  id?: string;
}

export interface Address {
  addressLine?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  timezone?: string;
}

interface MeshOptions {
  enabled: boolean;
}

interface DhcpOptions {
  enabled: boolean;
  mode: DhcpModeEnum;
}

enum DhcpModeEnum {
  DHCPMODE_EACH_AP = 'DHCPMODE_EACH_AP',
  DHCPMODE_MULTIPLE_AP = 'DHCPMODE_MULTIPLE_AP',
  DHCPMODE_HIERARCHICAL_AP = 'DHCPMODE_HIERARCHICAL_AP'
}