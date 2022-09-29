export enum MdnsProxyForwardingRuleTypeEnum {
  AIRDISK = 'AIRDISK',
  AIRPLAY = 'AIRPLAY',
  AIRPORT_MANAGEMENT = 'AIRPORT_MANAGEMENT',
  AIRPRINT = 'AIRPRINT',
  AIRTUNES = 'AIRTUNES',
  APPLE_FILE_SHARING = 'APPLE_FILE_SHARING',
  APPLE_MOBILE_DEVICES = 'APPLE_MOBILE_DEVICES',
  APPLETV = 'APPLETV',
  ICLOUD_SYNC = 'ICLOUD_SYNC',
  ITUNES_REMOTE = 'ITUNES_REMOTE',
  ITUNES_SHARING = 'ITUNES_SHARING',
  OPEN_DIRECTORY_MASTER = 'OPEN_DIRECTORY_MASTER',
  OPTICAL_DISK_SHARING = 'OPTICAL_DISK_SHARING',
  OTHER = 'OTHER',
  SCREEN_SHARING = 'SCREEN_SHARING',
  SECURE_FILE_SHARING = 'SECURE_FILE_SHARING',
  SECURE_SHELL = 'SECURE_SHELL',
  WWW_HTTP = 'WWW_HTTP',
  WWW_HTTPS = 'WWW_HTTPS',
  XGRID = 'XGRID',
  GOOGLE_CHROMECAST = 'GOOGLE_CHROMECAST',
}

export interface MdnsProxyForwardingRule {
  type: MdnsProxyForwardingRuleTypeEnum;
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
  forwardingRules?: MdnsProxyForwardingRule[];
  scope?: MdnsProxyScopeData[];
}
