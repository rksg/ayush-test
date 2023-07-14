import { IntlShape } from 'react-intl'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { cssStr } from '@acx-ui/components'
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

export function getRssiStatus (intl: IntlShape, value?: number) {
  const rssi = Number(value)
  if (rssi < -80) {
    return {
      tooltip: intl.$t({ defaultMessage: 'Poor' }),
      color: cssStr('--acx-semantics-red-50')
    }
  } else if (rssi <= -68 && rssi >= -80) {
    return {
      tooltip: intl.$t({ defaultMessage: 'Acceptable' }),
      color: cssStr('--acx-semantics-yellow-40')
    }
  } else if (rssi && rssi > -68) {
    return {
      tooltip: intl.$t({ defaultMessage: 'Good' }),
      color: cssStr('--acx-semantics-green-50')
    }
  }
  return {
    tooltip: '',
    color: ''
  }
}

export function getNoiseFloorStatus (intl: IntlShape, value: number) {
  const noise = Number(value)
  if (noise <= -75) {
    return {
      tooltip: intl.$t({ defaultMessage: 'Low' }),
      color: cssStr('--acx-semantics-green-50')
    }
  }
  return {
    tooltip: intl.$t({ defaultMessage: 'High' }),
    color: cssStr('--acx-semantics-red-50')
  }
}
