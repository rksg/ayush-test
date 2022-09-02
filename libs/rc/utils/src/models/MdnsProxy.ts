export interface MdnsProxyRule {
  type: string;
  fromVlan: number;
  toVlan: number;
}

export interface MdnsProxySaveData {
  name: string;
  tags?: string;
  rules: MdnsProxyRule[];
  apIdList: string[];
}
