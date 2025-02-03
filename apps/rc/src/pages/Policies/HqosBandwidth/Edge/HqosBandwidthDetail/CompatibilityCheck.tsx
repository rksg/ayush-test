import { EdgeDetailCompatibilityBanner }                                                       from '@acx-ui/rc/components'
import { useGetHqosEdgeCompatibilitiesQuery }                                                  from '@acx-ui/rc/services'
import { CompatibilityDeviceEnum, getFeaturesIncompatibleDetailData, IncompatibilityFeatures } from '@acx-ui/rc/utils'


export const CompatibilityCheck = ({ policyId }: { policyId: string }) => {
  // eslint-disable-next-line max-len
  const { hqosCompatibilityData = [], isLoading } = useGetHqosEdgeCompatibilitiesQuery({ payload: { filters: { serviceIds: [policyId] } } }, {
    skip: !policyId,
    selectFromResult: ({ data, isLoading }) => {
      return {
        hqosCompatibilityData: data?.compatibilities,
        isLoading
      }
    }
  })

  return isLoading ? null : <EdgeDetailCompatibilityBanner
    // eslint-disable-next-line max-len
    compatibilities={{ [CompatibilityDeviceEnum.EDGE]: getFeaturesIncompatibleDetailData(hqosCompatibilityData?.[0]) }}
    isLoading={isLoading}
    featureNames={[IncompatibilityFeatures.HQOS]}
  />
}