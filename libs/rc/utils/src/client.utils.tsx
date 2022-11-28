import { IntlShape } from 'react-intl'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { cssStr } from '@acx-ui/components'
import {
  AndroidOutlined,
  AppleSolid,
  WindowsSolid
} from '@acx-ui/icons'

export function convertClientOsType (origOsType: string) {
  const osType = origOsType ? origOsType.toLowerCase() : ''
  const osList = ['ios', 'mac', 'apple', 'android', 'windows',
    'linux', 'kindle', 'chrome', 'blackberry'
  ]
  const type = osList.filter(t => osType.includes(t))?.[0] || null
  if (type) {
    return type === 'ios' || type === 'mac' ? 'apple' : type
  }
  return osType
}

export function getOsTypeIcon (iconType: string) {
  const type = convertClientOsType(iconType)
  const iconMap = {
    android: <AndroidOutlined />,
    apple: <AppleSolid />,
    windows: <WindowsSolid />
  }
  return (iconMap[type as keyof typeof iconMap] ?? '') as React.ReactNode
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