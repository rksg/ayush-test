import { IntlShape } from 'react-intl'

import { cssStr } from '@acx-ui/components'
import {
  Amazon,
  Android,
  Apple,
  ApOutlined,
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
  PoSDeviceOutlined,
  RouterOutlined,
  StorageDeviceOutlined,
  TabletOutlined,
  Ubuntu,
  VoIpOutlined,
  WdsOutlined,
  Avaya,
  Bose,
  Brother,
  Canon,
  Cisco,
  Dell,
  Epson,
  Panasonic,
  Nortel,
  Nintendo,
  Nest,
  Libratone,
  Linksys,
  Hp,
  Roku,
  Playstation,
  Sonos,
  Sony,
  Samsung,
  Wemo,
  Xerox,
  Xbox,
  WifiSmartPlug,
  Telnet
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
    'bridge': <WdsOutlined />,
    'home av equipment': <HomeAvOutlined />,
    'ap': <ApOutlined />,
    'router': <RouterOutlined />,
    'storage': <StorageDeviceOutlined />,
    'pos': <PoSDeviceOutlined />,
    'point of sale': <PoSDeviceOutlined />
  }

  const matchKey = Object.keys(deviceIconMap).find((key) => (type === key) || type.match(key))
  return deviceIconMap[matchKey as Type] || defaultIcon
}

export const getOsTypeIcon = (osType: string) => {
  type Type = keyof typeof osIconMap
  const type = convertClientOsType(osType)
  const defaultIcon = <GenericOs />
  const osIconMap = {
    'apple': <Apple />,
    'avaya': <Avaya />,
    'android': <Android />,
    'blackberry': <Blackberry />,
    'bose': <Bose />,
    'brother': <Brother />,
    'canon': <Canon />,
    'chrome': <Chrome />,
    'cisco': <Cisco />,
    'dell': <Dell />,
    'epson': <Epson />,
    'panasonic': <Panasonic />,
    'nortel': <Nortel />,
    'nintendo': <Nintendo />,
    'nest': <Nest />,
    'linux': <Linux />,
    'linksys': <Linksys />,
    'libratone': <Libratone />,
    'kindle': <Amazon />,
    'hp': <Hp />,
    'playstation': <Playstation />,
    'roku': <Roku />,
    'samsung': <Samsung />,
    'sonos': <Sonos />,
    'sony': <Sony />,
    'telnet': <Telnet />,
    'ubuntu': <Ubuntu />,
    'wemo': <Wemo />,
    'windows': <Microsoft />,
    'xbox': <Xbox />,
    'xerox': <Xerox />,
    'wifi smart plug': <WifiSmartPlug />
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
      return 'good'
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

