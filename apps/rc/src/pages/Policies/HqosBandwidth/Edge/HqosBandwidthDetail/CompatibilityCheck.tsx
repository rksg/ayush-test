import { EdgeDetailCompatibilityBanner, useEdgeHqosDetailsCompatibilitiesData } from '@acx-ui/rc/components'
import { CompatibilityDeviceEnum, IncompatibilityFeatures }                     from '@acx-ui/rc/utils'


export const CompatibilityCheck = ({ policyId }: { policyId: string }) => {
  // eslint-disable-next-line max-len
  const { compatibilities, isLoading } = useEdgeHqosDetailsCompatibilitiesData({ serviceId: policyId })

  return isLoading ? null : <EdgeDetailCompatibilityBanner
    compatibilities={{ [CompatibilityDeviceEnum.EDGE]: compatibilities }}
    isLoading={isLoading}
    featureNames={[IncompatibilityFeatures.HQOS]}
  />
}