export interface MdnsProxyForwardingRule {
  type: string;
  fromVlan: number;
  toVlan: number;
}

export interface MdnsProxyScope {
  venueId: string;
  venueName?: string;
  aps: { id: string, name: string }[]
}

export interface MdnsProxyFormData {
  name: string;
  tags?: string;
  forwardingRules: MdnsProxyForwardingRule[];
  scope: MdnsProxyScope[];
}
