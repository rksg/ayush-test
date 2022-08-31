export interface DHCPPool {
  name: string;
  description?: string;
  allowWired: boolean;
  ip: string;
  mask: string;
  excludedRangeStart?: string;
  excludedRangeEnd?: string;
  primaryDNS: string;
  secondaryDNS: string;
  leaseTime: number;
  vlan: number;
  dhcpOptions: DHCPOption[];
}

export interface DHCPOption{
  id: string;
  name: string;
  format: string;
  value: string;
}
