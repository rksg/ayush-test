import {
  Amazon,
  Android,
  Apple,
  Blackberry,
  Chrome,
  GamingOutlined,
  GenericDeviceOutlined,
  GenericOs,
  HomeAvOutlined,
  IotOutlined,
  LaptopOutlined,
  Linux,
  Microsoft,
  MobilePhoneOutlined,
  PrinterOutlined,
  TabletOutlined,
  Ubuntu,
  VoIpOutlined,
  WdsOutlined
} from '@acx-ui/icons'

export const getDeviceTypeIcon = (deviceType: string) => {
  type Type = keyof typeof deviceIconMap
  const type = deviceType ? deviceType.toLowerCase() : ''
  const defaultIcon = <GenericDeviceOutlined />
  const deviceIconMap = {
    'laptop': <LaptopOutlined />,
    'smartphone': <MobilePhoneOutlined />,
    'tablet': <TabletOutlined />,
    'voip': <VoIpOutlined />,
    'gaming': <GamingOutlined />,
    'printer': <PrinterOutlined />,
    'iot': <IotOutlined />,
    'wds': <WdsOutlined />,
    'iot device': <IotOutlined />,
    'home av equipment': <HomeAvOutlined />,
    'wds device': <WdsOutlined />
  }
  return deviceIconMap[type as Type] || defaultIcon
}

export const getOsTypeIcon = (osType: string) => {
  type Type = keyof typeof osIconMap
  const type = convertClientOsType(osType)
  const defaultIcon = <GenericOs />
  const osIconMap = { // TODO: Add icons (Waiting for designer)
    apple: <Apple />,
    // avaya:
    android: <Android />,
    blackberry: <Blackberry />,
    // bose:
    // brother:
    // canon:
    chrome: <Chrome />,
    // cisco:
    // dell:
    // epson:
    // panasonic:
    // nortel:
    // nintendo:
    // nest:
    linux: <Linux />,
    // linksys:
    // libratone:
    kindle: <Amazon />,
    // hp:
    // playstation:
    // roku:
    // samsung:
    // sonos:
    // sony:
    ubuntu: <Ubuntu />,
    // wemo:
    windows: <Microsoft />
    // xbox:
    // xerox:
    // 'wifi smart plug':
  }
  return osIconMap[type as Type] || defaultIcon
}

export const getClientHealthClass = (healthStatus: string) => {
  switch (healthStatus) {
    case 'Good':
      return 'good'
    case 'Average':
      return 'average'
    case 'Poor':
      return 'poor'
    default:
      return 'default'
  }
}

const convertClientOsType = (origOsType: string) => {
  const osType = origOsType ? origOsType.toLowerCase() : ''

  // for backward compatible
  if (osType.includes('ios') || osType.includes('mac') || osType.includes('apple')) {
    return 'apple'
  } else if (osType.includes('android')) {
    return 'android'
  } else if (osType.includes('windows')) {
    return 'windows'
  } else if (osType.includes('linux')) {
    return 'linux'
  } else if (osType.includes('kindle')) {
    return 'kindle'
  } else if (osType.includes('chrome')) {
    return 'chrome'
  } else if (osType.includes('blackberry')) {
    return 'blackberry'
  }

  return osType
}

