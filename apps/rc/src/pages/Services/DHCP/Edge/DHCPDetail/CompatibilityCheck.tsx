import { EdgeDetailCompatibilityBanner, useEdgeDhcpDetailsCompatibilitiesData } from '@acx-ui/rc/components'
import { CompatibilityDeviceEnum, IncompatibilityFeatures }                     from '@acx-ui/rc/utils'

export const CompatibilityCheck = ({ serviceId }: { serviceId: string }) => {
  // eslint-disable-next-line max-len
  const { compatibilities, isLoading } = useEdgeDhcpDetailsCompatibilitiesData({ serviceId: serviceId })

  return isLoading ? null : <EdgeDetailCompatibilityBanner
    // eslint-disable-next-line max-len
    compatibilities={{ [CompatibilityDeviceEnum.EDGE]: compatibilities }}
    isLoading={isLoading}
    featureNames={[IncompatibilityFeatures.DHCP]}
  />
}