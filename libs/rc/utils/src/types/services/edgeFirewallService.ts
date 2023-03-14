export interface EdgeFirewallSetting {
  id: string;
  serviceName: string;
  tags: string[];
  edgeIds: string[];
  ddosRateLimitingEnabled: boolean;
  ddosRateLimitingRules: DdosRateLimitingRule[];
  statefulAclEnabled: boolean;
  statefulAcls: StatefulAcl[];
}

export enum DdosAttackType {
  ALL = 'ALL',
  ICMP = 'ICMP',
  TCP_SYN = 'TCP_SYN',
  IP_FRAGMENT = 'IP_FRAGMENT',
  DNS_RESPONSE = 'DNS_RESPONSE',
  NTP_REFLECTION = 'NTP_REFLECTION'
}

export interface DdosRateLimitingRule {
  ddosAttackType: DdosAttackType;
  rateLimiting: number;
}

export enum Direction {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND'
}

export interface StatefulAcl {
  name: string;
  description?: string;
  direction: Direction;
  rules: StatefulAclRule[];
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

export interface StatefulAclRule {
  priority?: number;
  description?: string;
  accessAction: AccessAction;
  protocolType: ProtocolType;
  protocolValue?: number;
  sourceAddressType: AddressType;
  sourceAddress?: string;
  sourceAddressMask?: string;
  sourcePort?: string;
  destinationAddressType: AddressType;
  destinationAddress?: string;
  destinationAddressMask?: string;
  destinationPort?: string;
}
