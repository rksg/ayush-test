export enum CompatibilityType {
  DEVICE = 'device',
  FEATURE = 'feature',
  VENUE = 'venue'
}

export enum CompatibilityDeviceEnum {
  AP = 'Ap',
  EDGE = 'Edge',
  SWITCH = 'Switch'
}

export enum IncompatibilityFeatures {
  AP_70 = 'WIFI7 302MHz',
  BETA_DPSK3 = 'DSAE',
  AP_NEIGHBORS = 'AP Neighbors',
  BSS_COLORING = 'BSS Coloring',
  QOS_MIRRORING = 'QoS Mirroring',
  TRUNK_PORT_VLAN_UNTAG_ID = 'Trunk Port VLAN Untag Id',
  SD_LAN = 'SD-LAN',
  TUNNEL_PROFILE = 'Tunnel Profile',
  NAT_TRAVERSAL = 'NAT Traversal',
  HA_AA = 'HA-AA',
  HQOS = 'HQoS',
  DHCP = 'DHCP',  // edge DHCP
  PIN = 'PIN',
  PIN_DS = 'PIN_DS',
  PIN_AS = 'PIN_AS',
  EDGE_MDNS_PROXY = 'MDNS_PROXY', // edge mDNS
  ARP_TERMINATION = 'ARP_TERMINATION',
  L2OGRE = 'L2oGRE',
  DUAL_WAN = 'Dual WAN',
  MULTI_NAT_IP = 'Multi NAT IP',
  CORE_ACCESS_SEPARATION = 'Core/Access Ports Separation'
}

export enum IncompatibilityFeatureGroups {
  TUNNEL_PROFILE = 'TUNNEL_PROFILE'
}

export enum EdgeCompatibilityFeatureEnum {
  SD_LAN = 'SD-LAN',
  TUNNEL_PROFILE = 'Tunnel Profile',
  NAT_TRAVERSAL = 'NAT Traversal',
  HA_AA = 'HA-AA',
  HQOS = 'HQoS',
  DHCP = 'DHCP',
  MDNS_PROXY = 'MDNS_PROXY',
  ARP_TERMINATION = 'ARP_TERMINATION',
  DUAL_WAN = 'Dual WAN'
}
