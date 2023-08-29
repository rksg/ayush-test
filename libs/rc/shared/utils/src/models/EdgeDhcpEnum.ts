export enum LeaseTimeUnit {
  DAYS = 'DAYS',
  HOURS = 'HOURS',
  MINUTES = 'MINUTES'
}

export enum EdgeDhcpHostStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export enum EdgeDhcpOptionsEnum {
  DOMAIN_SERVER = '6',
  DOMAIN_NAME = '15',
  NTP_SERVERS = '42',
  VENDOR_ENCAPSULATED_OPTIONS = '43',
  NETBIOS_SCOPE = '47',
  VENDOR_CLASS_IDENTIFIER = '60',
  SERVER_NAME = '66',
  BOOTFILE_NAME = '67'
}

export enum LeaseTimeType {
  LIMITED = 'Limited',
  INFINITE = 'Infinite'
}
