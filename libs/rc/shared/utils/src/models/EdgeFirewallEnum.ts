export enum DdosAttackType {
  ALL = 'ALL',
  ICMP = 'ICMP',
  TCP_SYN = 'TCP_SYN',
  // removed due to device limitation.
  // IP_FRAGMENT = 'IP_FRAGMENT',
  DNS_RESPONSE = 'DNS_RESPONSE',
  NTP_REFLECTION = 'NTP_REFLECTION'
}

export enum ACLDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND'
}

export enum AccessAction {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK',
  INSPECT = 'INSPECT'
}

export enum ProtocolType {
  ANY = 'ANY',
  ICMP = 'ICMP',
  IGMP = 'IGMP',
  TCP = 'TCP',
  UDP = 'UDP',
  ESP = 'ESP',
  AH = 'AH',
  SCTP = 'SCTP',
  CUSTOM = 'CUSTOM'
}

export enum AddressType {
  ANY_IP_ADDRESS = 'ANY_IP_ADDRESS',
  SUBNET_ADDRESS = 'SUBNET_ADDRESS',
  IP_ADDRESS = 'IP_ADDRESS'
}