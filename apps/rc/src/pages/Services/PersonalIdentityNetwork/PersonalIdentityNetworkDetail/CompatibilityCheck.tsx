import {
  EdgeDetailCompatibilityBanner,
  useEdgePinDetailsCompatibilitiesData
} from '@acx-ui/rc/components'
import {
  edgePinRequiredFeatures
} from '@acx-ui/rc/utils'

export const CompatibilityCheck = ({ serviceId }: { serviceId: string }) => {
  const { compatibilities, isLoading } = useEdgePinDetailsCompatibilitiesData({ serviceId })

  return isLoading ? null : <EdgeDetailCompatibilityBanner
    compatibilities={compatibilities}
    isLoading={isLoading}
    featureNames={edgePinRequiredFeatures}
  />
}