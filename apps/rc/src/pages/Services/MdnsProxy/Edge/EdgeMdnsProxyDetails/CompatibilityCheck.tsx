import {
  EdgeDetailCompatibilityBanner,
  useEdgeMdnsDetailsCompatibilitiesData
} from '@acx-ui/rc/components'
import {
  CompatibilityDeviceEnum,
  IncompatibilityFeatures } from '@acx-ui/rc/utils'

export const CompatibilityCheck = ({ serviceId }: { serviceId: string }) => {
  const { compatibilities, isLoading } = useEdgeMdnsDetailsCompatibilitiesData({ serviceId })

  return isLoading ? null : <EdgeDetailCompatibilityBanner
    compatibilities={{ [CompatibilityDeviceEnum.EDGE]: compatibilities }}
    isLoading={isLoading}
    featureNames={[IncompatibilityFeatures.EDGE_MDNS_PROXY]}
  />
}