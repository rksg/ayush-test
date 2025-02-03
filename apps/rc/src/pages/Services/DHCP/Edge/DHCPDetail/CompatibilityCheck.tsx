import { EdgeDetailCompatibilityBanner }                                                       from '@acx-ui/rc/components'
import { useGetDhcpEdgeCompatibilitiesQuery }                                                  from '@acx-ui/rc/services'
import { CompatibilityDeviceEnum, getFeaturesIncompatibleDetailData, IncompatibilityFeatures } from '@acx-ui/rc/utils'

export const CompatibilityCheck = ({ serviceId }: { serviceId: string }) => {
  // eslint-disable-next-line max-len
  const { dhcpCompatibilityData = [], isLoading } = useGetDhcpEdgeCompatibilitiesQuery({ payload: { filters: { serviceIds: [serviceId] } } }, {
    skip: !serviceId,
    selectFromResult: ({ data, isLoading }) => {
      return {
        dhcpCompatibilityData: data?.compatibilities,
        isLoading
      }
    }
  })

  return isLoading ? null : <EdgeDetailCompatibilityBanner
    // eslint-disable-next-line max-len
    compatibilities={{ [CompatibilityDeviceEnum.EDGE]: getFeaturesIncompatibleDetailData(dhcpCompatibilityData?.[0]) }}
    isLoading={isLoading}
    featureNames={[IncompatibilityFeatures.DHCP]}
  />
}