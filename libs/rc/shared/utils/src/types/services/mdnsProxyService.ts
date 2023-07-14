import { BonjourGatewayRule } from '../../models/BonjourGatewayRule'

export class MdnsProxyForwardingRule extends BonjourGatewayRule {
  id?: string
}

export interface MdnsProxyScopeData {
  venueId: string;
  venueName?: string;
  aps: { serialNumber: string, name?: string }[]
}

export interface MdnsProxyFormData {
  id?: string;
  name: string;
  rules?: MdnsProxyForwardingRule[];
  scope?: MdnsProxyScopeData[];
}

export interface MdnsProxyCreateApiPayload {
  serviceName: string;
  rules?: MdnsProxyForwardingRule[];
  aps?: string[]
}

export interface MdnsProxyGetApiResponse {
  id: string;
  serviceName: string;
  rules?: MdnsProxyForwardingRule[];
  aps?: { serialNumber: string, venueId: string }[]
}

export interface MdnsProxyAp {
  serialNumber: string;
  apName: string;
  venueId: string;
  venueName: string;
  serviceId: string;
  serviceName: string;
  rules: MdnsProxyForwardingRule[]
}

export interface MdnsProxyViewModel {
  id: string;
  name: string;
  rules: MdnsProxyForwardingRule[];
  tenantId: string;
  venueIds?: string[];
}
