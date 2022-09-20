export interface MdnsProxyForwardingRule {
  type: string;
  fromVlan: number;
  toVlan: number;
}

export interface MdnsProxyScopeData {
  venueId: string;
  venueName?: string;
  aps: { serialNumber: string, name?: string }[]
}

export interface MdnsProxyFormData {
  id?: string;
  name: string;
  tags?: string;
  forwardingRules: MdnsProxyForwardingRule[];
  scope: MdnsProxyScopeData[];
}
