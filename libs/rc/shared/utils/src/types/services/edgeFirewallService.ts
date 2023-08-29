import { EdgeAlarmSummary } from '../..'
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

export interface EdgeFirewallViewData {
  id?: string
  tenantId?: string
  firewallName?: string
  tags?: string[]
  ddosEnabled?: boolean
  ddosRateLimitingRules?: {
     [key in DdosAttackType]?: number
  }
  statefulAclEnabled?: boolean
  statefulAcls?: {
        aclName: string,
        aclDirection: ACLDirection,
        aclRuleNum: number
    }[]
  edgeIds?: string[]
  serviceVersions?: Record<string, string>;
  edgeAlarmSummary?: EdgeAlarmSummary[]
}

export interface EdgeFirewallDDoSStatsViewData {
  ddosStatsList: EdgeFirewallDDoSStats[];
}
export interface EdgeFirewallDDoSStats {
  ddosAttackType: DdosAttackType;
  deniedPackets: number;
  passedPackets: number;
}

export interface DDoSRuleStatisticModel
  extends DdosRateLimitingRule, EdgeFirewallDDoSStats {
}

export interface EdgeFirewallBaseStatsPayload {
  venueId: string;
  edgeId: string;
  start: string;
  end: string;
  granularity: string;
}

export interface EdgeFirewallACLStatsViewData {
  direction: ACLDirection;
  permittedSessions: number;
  aclRuleStatsList: EdgeFirewallACLStats[];
}
export interface EdgeFirewallACLStats {
  priority: number;
  packets: number;
  bytes: number;
}

export interface EdgeFirewallACLStatsPayload extends EdgeFirewallBaseStatsPayload {
  direction: ACLDirection;
}

export interface FirewallACLRuleStatisticModel
  extends Omit<StatefulAclRule, 'priority'>, EdgeFirewallACLStats {
}
