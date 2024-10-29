import { useState } from 'react'

import { find, sumBy } from 'lodash'
import { useIntl }     from 'react-intl'

import { CompatibleAlertBanner, EdgeDetailCompatibilityDrawer }                                                                                            from '@acx-ui/rc/components'
import { useGetDhcpEdgeCompatibilitiesQuery }                                                                                                              from '@acx-ui/rc/services'
import { ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY, ApCompatibility, CompatibilityDeviceEnum, getFeaturesIncompatibleDetailData, IncompatibilityFeatures } from '@acx-ui/rc/utils'


export const CompatibilityCheck = ({ serviceId }: { serviceId: string }) => {
  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false)

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

  // eslint-disable-next-line max-len
  const edgeIncompatibleData = find(dhcpCompatibilityData, { serviceId: serviceId })?.clusterEdgeCompatibilities
  const edgeIncompatibleCount = sumBy(edgeIncompatibleData, (data) => data.incompatible)
  const isIncompatible = edgeIncompatibleCount > 0
  const drawerDetails = (isIncompatible ?
    {
      // eslint-disable-next-line max-len
      [CompatibilityDeviceEnum.EDGE]: getFeaturesIncompatibleDetailData(dhcpCompatibilityData?.[0])[IncompatibilityFeatures.DHCP]
    } : {}) as Record<CompatibilityDeviceEnum, ApCompatibility>

  return !isLoading && isIncompatible ?
    <>
      <CompatibleAlertBanner
        key={IncompatibilityFeatures.DHCP}
        title={$t({
          defaultMessage: `{featureName} is not able to be 
          brought up on {edgeInfo} due to their firmware incompatibility.` },
        {
          featureName: IncompatibilityFeatures.DHCP,
          // eslint-disable-next-line max-len
          edgeInfo: $t({ defaultMessage: '{edgeIncompatibleCount} {edgeIncompatibleCount, plural, one {RUCKUS Edge} other {RUCKUS Edges}}' }, { edgeIncompatibleCount })
        })}
        cacheKey={ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY}
        onClick={() => setDrawerVisible(true)}
      />
      <EdgeDetailCompatibilityDrawer
        visible={drawerVisible}
        featureName={IncompatibilityFeatures.DHCP}
        data={drawerDetails}
        onClose={() => setDrawerVisible(false)}
      />
    </> : null
}