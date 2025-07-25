import { isNumber } from 'lodash'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { useConfigTemplate } from '../../configTemplate'

export const gpsToFixed = (val?: string | number): string => {
  if (!val) {
    return ''
  }

  if (isNumber(val)) {
    return (val as number).toFixed(6)
  }

  return parseFloat(val.toString()).toFixed(6)
}

export function useSelectValidatorByIpModeFF<T> (
  ipv4Validator: (value: T) => Promise<unknown>,
  ipv6Validator: (value: T) => Promise<unknown>
): (value: T) => Promise<unknown> {
  const { isTemplate } = useConfigTemplate()
  const isApIpModeFFEnabled = useIsSplitOn(Features.WIFI_EDA_IP_MODE_CONFIG_TOGGLE)

  return (value: T) => {
    if (isApIpModeFFEnabled && !isTemplate) {
      return ipv6Validator(value)
    }
    return ipv4Validator(value)
  }
}