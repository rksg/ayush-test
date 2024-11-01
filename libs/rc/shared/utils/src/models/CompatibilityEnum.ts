export enum CompatibilityType {
  DEVICE = 'device',
  FEATURE = 'feature',
  VENUE = 'venue'
}

export enum CompatibilityDeviceEnum {
  AP = 'Ap',
  EDGE = 'Edge'
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
  HA_AA = 'HA-AA',
  HQOS = 'HQoS',
  DHCP = 'DHCP',
  PIN = 'PIN',
  EDGE_MDNS_PROXY = 'Edge mDNS Proxy'
}