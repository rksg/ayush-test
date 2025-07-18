import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { useConfigTemplate } from '@acx-ui/rc/utils'

export function ipModeValidatorSelector<T>(
    ipv4Validator: (value: T) => Promise<any>,
    ipv6Validator: (value: T) => Promise<any>
  ): (value: T) => Promise<any> {
    const { isTemplate } = useConfigTemplate()
    const isApIpModeFFEnabled = useIsSplitOn(Features.WIFI_EDA_IP_MODE_CONFIG_TOGGLE)
    
    return (value: T) => {
      if (isApIpModeFFEnabled && !isTemplate) {
        return ipv6Validator(value)
      }
      return ipv4Validator(value)
    }
  }
  