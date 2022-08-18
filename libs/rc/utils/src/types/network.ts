import {
  NetworkTypeEnum,
  PassphraseExpirationEnum,
  PassphraseFormatEnum,
  WlanSecurityEnum
} from '../constants'

export interface CreateNetworkFormFields {
  name: string;
  description?: string;
  type: NetworkTypeEnum;
  isCloudpathEnabled?: boolean;
  cloudpathServerId?: string;
  venues: NetworkVenue[];
}

export interface NetworkSaveData {
  name?: string;
  description?: string;
  type?: NetworkTypeEnum;
  enableAccountingService?: boolean;
  enableAccountingProxy?: boolean;
  enableAuthProxy?: boolean;
  enableSecondaryAuthServer?: boolean;
  enableSecondaryAcctServer?: boolean;
  isCloudpathEnabled?: boolean;
  cloudpathServerId?: string;
  venues?: NetworkVenue[];
  wlan?: {
    ssid?: string;
    vlanId?: number;
    enable?: boolean;
    advancedCustomization?: IOpenWlanAdvancedCustomization;
  };
  wlanSecurity?: WlanSecurityEnum;
  dpskWlanSecurity?: WlanSecurityEnum;
  authRadius?: {
    primary: {
      ip: string;
      port: string;
      sharedSecret: string;
    };
    secondary: {
      ip: string;
      port: string;
      sharedSecret: string;
    };
  };
  accountingRadius?: {
    primary: {
      ip: string;
      port: string;
      sharedSecret: string;
    };
    secondary: {
      ip: string;
      port: string;
      sharedSecret: string;
    };
  };
  passphraseLength?: number;
  passphraseFormat?: PassphraseFormatEnum;
  expiration?: PassphraseExpirationEnum;
}

export interface NetworkVenue {
  id?: string
  name?: string
  apGroups: string[]
  scheduler: {
    type: string
  }
  isAllApGroups: boolean
  allApGroupsRadio: string
  allApGroupsRadioTypes: string[]
  venueId: string
  networkId: string
}

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

export enum IsolatePacketsTypeEnum {
  UNICAST = 'UNICAST',
  MULTICAST = 'MULTICAST',
  UNICAST_MULTICAST = 'UNICAST_MULTICAST',
}

export enum RfBandUsageEnum {
  _2_4GHZ = '2.4GHZ',
  _5_0GHZ = '5.0GHZ',
  BOTH = 'BOTH',
}

export enum BssMinimumPhyRateEnum {
  _1 = '1',
  _2 = '2',
  _5_5 = '5.5',
  _12 = '12',
  _24 = '24',
  _default = 'default',
}

export enum BssMinimumPhyRateEnum6G {
  _6 = '6',
  _9 = '9',
  _12 = '12',
  _18 = '18',
  _24 = '24',
}

export enum PhyTypeConstraintEnum {
  OFDM = 'OFDM',
  NONE = 'NONE',
}

export enum ManagementFrameMinimumPhyRateEnum {
  _1 = '1',
  _2 = '2',
  _5_5 = '5.5',
  _6 = '6',
  _9 = '9',
  _11 = '11',
  _12 = '12',
  _18 = '18',
  _24 = '24',
}

export enum ManagementFrameMinimumPhyRateEnum6G {
  _6 = '6',
  _9 = '9',
  _12 = '12',
  _18 = '18',
  _24 = '24',
}

export interface IClientIsolationOptions {
  packetsType?: IsolatePacketsTypeEnum;
  // if client isolation is enabled and packetsType is null, packetsType will be set to \"UNICAST\".
  autoVrrp?: boolean; // Automatic support for VRRP/HSRP. default false
}

export interface IWlanRadioCustomization {
  rfBandUsage: RfBandUsageEnum; //default RfBandUsageEnum.BOTH
  bssMinimumPhyRate: BssMinimumPhyRateEnum; // BSS (basic service set) minimum PHY rate, default BssMinimumPhyRateEnum._default
  bssMinimumPhyRate6G: BssMinimumPhyRateEnum6G; // BSS (basic service set) minimum PHY rate for radio 6G, default BssMinimumPhyRateEnum6G._6
  phyTypeConstraint: PhyTypeConstraintEnum; // OFDM improves network performance but prevents 802.11b devices from connecting to the network. default PhyTypeConstraintEnum.OFDM
  managementFrameMinimumPhyRate: ManagementFrameMinimumPhyRateEnum; // Management Frame Minimum PHY Rate, default ManagementFrameMinimumPhyRateEnum._6
  managementFrameMinimumPhyRate6G: ManagementFrameMinimumPhyRateEnum6G; // Management Frame Minimum PHY Rate for radio 6G, default ManagementFrameMinimumPhyRateEnum6G._6
}

export interface IVlanPool {
  tenantId?: string;
  name?: string; // The name of the VLAN pool
  description?: string; // The description of the VLAN pool
  vlanMembers?: string[]; // The VLAN pool members. Expected format is a list of single and/or range of vlans, e.g.: 5, 40-50
  id?: string;
}

export interface IDnsProxyRule {
  domainName: string;
  ipList: string[];
}

export interface IDnsProxy {
  dnsProxyRules?: IDnsProxyRule[];
}

export interface IOpenWlanAdvancedCustomization {
  clientIsolation?: boolean;
  devicePolicyId?: string;
  l2AclPolicyId?: string;
  l3AclPolicyId?: string;
  applicationPolicyId?: string;
  accessControlProfileId?: string;
  userUplinkRateLimiting?: number; // Mbps
  userDownlinkRateLimiting?: number; // Mbps
  totalUplinkRateLimiting?: number; // Mbps
  totalDownlinkRateLimiting?: number; // Mbps
  maxClientsOnWlanPerRadio: number;
  enableBandBalancing?: boolean;
  clientIsolationOptions: IClientIsolationOptions; // Client isolation custom settings
  hideSsid?: boolean; // Network will not broadcast its SSID publicly, but users who know the SSID will be able to connect.
  forceMobileDeviceDhcp?: boolean; // Forces clients to obtain a valid IP address from DHCP. This prevents clients configured with a static IP address from connecting to this network.
  clientLoadBalancingEnable?: boolean;
  directedThreshold: number;
  enableNeighborReport?: boolean; // Enhances roaming by providing a list of neighbor APs to the client device. APs build a neighbor AP list via background scanning, and when the client plans to roam, it will request this list from the AP. This list is then used to perform efficient scanning to find a roaming candidate.
  radioCustomization: IWlanRadioCustomization;
  enableSyslog?: boolean;
  clientInactivityTimeout: number;
  accessControlEnable?: boolean;
  respectiveAccessControl?: boolean;
  vlanPool: IVlanPool | null;
  applicationPolicyEnable?: boolean;
  l2AclEnable?: boolean;
  l3AclEnable?: boolean;
  wifiCallingEnabled?: boolean;
  wifiCallingIds?: string[];
  proxyARP?: boolean;
  enableAirtimeDecongestion?: boolean;
  enableJoinRSSIThreshold?: boolean;
  joinRSSIThreshold: number;
  enableTransientClientManagement?: boolean;
  joinWaitTime: number;
  joinExpireTime: number;
  joinWaitThreshold: number;
  enableOptimizedConnectivityExperience?: boolean;
  broadcastProbeResponseDelay: number;
  rssiAssociationRejectionThreshold: number;
  enableAntiSpoofing?: boolean;
  enableArpRequestRateLimit?: boolean;
  arpRequestRateLimit: number;
  enableDhcpRequestRateLimit?: boolean;
  dhcpRequestRateLimit: number;
  dnsProxyEnabled?: boolean;
  dnsProxy?: IDnsProxy;
  tunnelWlanEnable?: boolean;
}

export interface IDpskWlanAdvancedCustomization {
  devicePolicyId?: string;
  l2AclPolicyId?: string;
  l3AclPolicyId?: string;
  applicationPolicyId?: string;
  accessControlProfileId?: string;
  userUplinkRateLimiting?: number;
  userDownlinkRateLimiting?: number;
  totalUplinkRateLimiting?: number;
  totalDownlinkRateLimiting?: number;
  maxClientsOnWlanPerRadio: number;
  enableBandBalancing?: boolean;
    // Prevents client access to other clients connected to this network. Usually enabled in public networks.
  clientIsolation?: boolean;
  // Client isolation custom settings
  clientIsolationOptions: IClientIsolationOptions;
  // Network will not broadcast its SSID publicly, but users who know the SSID will be able to connect.
  hideSsid?: boolean;
  // Forces clients to obtain a valid IP address from DHCP. This prevents clients configured with a static IP address from connecting to this network.
  forceMobileDeviceDhcp?: boolean;
  clientLoadBalancingEnable?: boolean;
  enableAaaVlanOverride?: boolean;
  // This is a per radio client count at which an AP will stop converting group addressed data traffic to unicast. The directed threshold value (and action) is checked by the AP after it has performed other multicast handling actions (e.g. SmartCast), such as application detection and checking IGMP subscription of clients. Due to the order of actions on some traffic, the directed threshold may not be the final determinant in multicast frame handling.
  directedThreshold: number;
  // Enhances roaming by providing a list of neighbor APs to the client device. APs build a neighbor AP list via background scanning, and when the client plans to roam, it will request this list from the AP. This list is then used to perform efficient scanning to find a roaming candidate.
  enableNeighborReport?: boolean;
  radioCustomization: IWlanRadioCustomization;
  enableSyslog?: boolean;
  // Client will be disconnected after being idle for this number of seconds.
  clientInactivityTimeout: number;
  accessControlEnable?: boolean;
  respectiveAccessControl?: boolean;
  vlanPool: IVlanPool | null;
  applicationPolicyEnable?: boolean;
  l2AclEnable?: boolean;
  l3AclEnable?: boolean;
  wifiCallingEnabled?: boolean;
  wifiCallingIds?: string[];
  proxyARP?: boolean;
  enableAirtimeDecongestion?: boolean;
  enableJoinRSSIThreshold?: boolean;
  joinRSSIThreshold: number;
  enableTransientClientManagement?: boolean;
  joinWaitTime: number;
  joinExpireTime: number;
  joinWaitThreshold: number;
  enableOptimizedConnectivityExperience?: boolean;
  broadcastProbeResponseDelay: number;
  rssiAssociationRejectionThreshold: number;
  enableAntiSpoofing?: boolean;
  enableArpRequestRateLimit?: boolean;
  arpRequestRateLimit: number;
  enableDhcpRequestRateLimit?: boolean;
  dhcpRequestRateLimit: number;
  dnsProxyEnabled?: boolean;
  dnsProxy?: DnsProxy;
  tunnelWlanEnable?: boolean;
}

export interface DnsProxy {
  dnsProxyRules?: DnsProxyRule[];
}

export interface DnsProxyRule {
  domainName: string;
  ipList: string[];
}
