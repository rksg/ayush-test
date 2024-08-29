export const VenueLoadBalancingSettings_LoadBalanceOn = {
  enabled: true,
  loadBalancingMethod: 'BASED_ON_CLIENT_COUNT',
  bandBalancingEnabled: true,
  bandBalancingClientPercent24G: 25,
  steeringMode: 'BASIC',
  stickyClientSteeringEnabled: true,
  stickyClientSnrThreshold: 15,
  stickyClientNbrApPercentageThreshold: 20
}

export const VenueLoadBalancingSettings_LoadBalanceOff = {
  enabled: false,
  loadBalancingMethod: 'BASED_ON_CLIENT_COUNT',
  bandBalancingEnabled: true,
  bandBalancingClientPercent24G: 25,
  steeringMode: 'BASIC',
  stickyClientSteeringEnabled: true,
  stickyClientSnrThreshold: 15,
  stickyClientNbrApPercentageThreshold: 20
}

export const StickyClientSteeringSettings_VenueSettingOn = {
  useVenueSettings: true,
  enabled: true,
  snrThreshold: 20,
  neighborApPercentageThreshold: 30
}

export const StickyClientSteeringSettings_VenueSettingOff = {
  useVenueSettings: false,
  enabled: true,
  snrThreshold: 15,
  neighborApPercentageThreshold: 20
}

export const ApCapabilities_SupportOn = {
  model: 'R550',
  version: '7.0.0.104.1432',
  lanPorts: [
    {
      id: '1',
      defaultType: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      trunkPortOnly: false,
      supportDisable: true,
      isPoePort: false,
      isPoeOutPort: false
    },
    {
      id: '2',
      defaultType: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      trunkPortOnly: false,
      supportDisable: false,
      isPoePort: true,
      isPoeOutPort: false
    }
  ],
  allowDfsCountry: [
    'US',
    'SG'
  ],
  allowCbandCountry: [
    'GB'
  ],
  lldpEnable: true,
  lldpAdInterval: 30,
  lldpHoldTime: 120,
  lldpMgmtEnable: true,
  ledOn: true,
  isOutdoor: false,
  has160MHzChannelBandwidth: false,
  canSupportPoeOut: false,
  canSupportPoeMode: true,
  canSupportLacp: true,
  requireOneEnabledTrunkPort: true,
  poeModeCapabilities: [
    'Auto',
    '802.3af',
    '802.3at'
  ],
  lanPortPictureDownloadUrl: '',
  pictureDownloadUrl: '',
  canSupportCellular: false,
  simCardPrimaryEnabled: true,
  simCardPrimaryRoaming: true,
  simCardSecondaryEnabled: true,
  simCardSecondaryRoaming: true,
  capabilityScore: 140,
  supportTriRadio: false,
  supportDual5gMode: false,
  supportChannel144: true,
  support11AX: true,
  support11BE: false,
  maxChannelization24G: 40,
  maxChannelization5G: 80,
  supportMesh: true,
  supportBandCombination: false,
  supportAntennaType: false,
  supportApStickyClientSteering: true
}

export const ApCapabilities_SupportOff = {
  model: 'R550',
  version: '7.0.0.104.1432',
  lanPorts: [
    {
      id: '1',
      defaultType: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      trunkPortOnly: false,
      supportDisable: true,
      isPoePort: false,
      isPoeOutPort: false
    },
    {
      id: '2',
      defaultType: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      trunkPortOnly: false,
      supportDisable: false,
      isPoePort: true,
      isPoeOutPort: false
    }
  ],
  allowDfsCountry: [
    'US',
    'SG'
  ],
  allowCbandCountry: [
    'GB'
  ],
  lldpEnable: true,
  lldpAdInterval: 30,
  lldpHoldTime: 120,
  lldpMgmtEnable: true,
  ledOn: true,
  isOutdoor: false,
  has160MHzChannelBandwidth: false,
  canSupportPoeOut: false,
  canSupportPoeMode: true,
  canSupportLacp: true,
  requireOneEnabledTrunkPort: true,
  poeModeCapabilities: [
    'Auto',
    '802.3af',
    '802.3at'
  ],
  lanPortPictureDownloadUrl: '',
  pictureDownloadUrl: '',
  canSupportCellular: false,
  simCardPrimaryEnabled: true,
  simCardPrimaryRoaming: true,
  simCardSecondaryEnabled: true,
  simCardSecondaryRoaming: true,
  capabilityScore: 140,
  supportTriRadio: false,
  supportDual5gMode: false,
  supportChannel144: true,
  support11AX: true,
  support11BE: false,
  maxChannelization24G: 40,
  maxChannelization5G: 80,
  supportMesh: true,
  supportBandCombination: false,
  supportAntennaType: false,
  supportApStickyClientSteering: false
}

export const ApDeep = {
  serialNumber: '302002030366',
  name: 'R550-302002030366',
  apGroupId: '8c0219e575d34e82b8e62f5caa5737e1',
  venueId: '0e2f68ab79154ffea64aa52c5cc48826',
  tags: [
    ''
  ],
  model: 'R550',
  macAddress: '34:20:E3:1D:0C:50',
  firmwareVersion: '7.0.0.104.1432',
  uptime: 2172051,
  lastUpdatedTime: '2024-07-05T01:53:03.318Z',
  lastSeenTime: '2024-08-28T10:36:57.508Z',
  statusSeverity: '2_Operational',
  status: '2_00_Operational',
  meshRole: 'DISABLED',
  networkStatus: {
    ipAddress: '10.206.78.138',
    externalIpAddress: '210.58.90.254',
    ipAddressType: 'dynamic',
    netmask: '255.255.254.0',
    gateway: '10.206.79.254',
    primaryDnsServer: '10.10.10.10',
    secondaryDnsServer: '10.10.10.10',
    managementTrafficVlan: 1
  },
  lanPortStatuses: [
    {
      id: '0',
      physicalLink: 'Down  '
    },
    {
      id: '1',
      physicalLink: 'Up 1000Mbps full'
    }
  ],
  radioStatuses: [
    {
      id: 0,
      band: '2.4G',
      transmitterPower: 'max',
      channel: 11,
      channelBandwidth: '20',
      rssi: 50
    },
    {
      id: 1,
      band: '5G',
      transmitterPower: 'max',
      channel: 120,
      channelBandwidth: '40',
      rssi: 16
    }
  ],
  afcStatus: {
    geoLocationSource: 'NO_LOCATION'
  }
}

export const Venue = {
  id: '0e2f68ab79154ffea64aa52c5cc48826',
  name: 'My-Venue',
  description: 'My-Venue',
  address: {
    country: 'United States',
    city: 'New York',
    addressLine: '198 Main St,New York,United States',
    latitude: 40.7359744,
    longitude: -73.8250952,
    timezone: 'America/New_York'
  },
  isTemplate: false
}
