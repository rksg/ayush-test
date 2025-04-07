import {
  EdgeDetailCompatibilityBanner,
  useEdgeSdLanDetailsCompatibilitiesData
} from '@acx-ui/rc/components'
import { edgeSdLanRequiredFeatures } from '@acx-ui/rc/utils'

export const CompatibilityCheck = ({ serviceId }: { serviceId: string }) => {
  const { compatibilities, isLoading } = useEdgeSdLanDetailsCompatibilitiesData({ serviceId })

  return !isLoading
    ? <EdgeDetailCompatibilityBanner
      compatibilities={compatibilities}
      isLoading={isLoading}
      featureNames={edgeSdLanRequiredFeatures}
    />
    : null
}