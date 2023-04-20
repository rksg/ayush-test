import {
  AccessAction,
  ACLDirection,
  AddressType,
  DdosAttackType,
  ProtocolType
} from '../../models/EdgeFirewallEnum'

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

export interface DdosRateLimitingRule {
  // ddosAttackType is unique
  ddosAttackType: DdosAttackType;
  rateLimiting: number;
}

export interface StatefulAcl {
  name: string;
  description?: string;
  direction: ACLDirection;
  rules: StatefulAclRule[];
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
