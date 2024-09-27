import { useState } from 'react'

import { find, sumBy } from 'lodash'
import { useIntl }     from 'react-intl'

import { CompatibleAlertBanner, EdgeDetailCompatibilityDrawer }                                                                                                                      from '@acx-ui/rc/components'
import { useGetHqosEdgeCompatibilitiesQuery }                                                                                                                                        from '@acx-ui/rc/services'
import { ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY, ApCompatibility, CompatibilityDeviceEnum, EdgeServiceCompatibility, getFeaturesIncompatibleDetailData, IncompatibilityFeatures } from '@acx-ui/rc/utils'


export const CompatibilityCheck = ({ policyId }: { policyId: string }) => {
  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false)

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

  // eslint-disable-next-line max-len
  const edgeIncompatibleData = find(hqosCompatibilityData, { serviceId: policyId })?.clusterEdgeCompatibilities
  const edgeIncompatibleCount = sumBy(edgeIncompatibleData, (data) => data.incompatible)
  const isIncompatible = edgeIncompatibleCount > 0
  const drawerDetails = (isIncompatible ?
    {
      // eslint-disable-next-line max-len
      [CompatibilityDeviceEnum.EDGE]: getFeaturesIncompatibleDetailData(hqosCompatibilityData?.[0])[IncompatibilityFeatures.HQOS]
    } : {}) as Record<CompatibilityDeviceEnum, ApCompatibility>

  return !isLoading && isIncompatible ?
    <>
      <CompatibleAlertBanner
        key={IncompatibilityFeatures.HQOS}
        title={$t({
          defaultMessage: `{featureName} is not able to be 
          brought up on {edgeInfo} due to their firmware incompatibility.` },
        {
          featureName: IncompatibilityFeatures.HQOS,
          // eslint-disable-next-line max-len
          edgeInfo: $t({ defaultMessage: '{edgeIncompatibleCount} {edgeIncompatibleCount, plural, one {RUCKUS Edge} other {RUCKUS Edges}}' }, { edgeIncompatibleCount })
        })}
        cacheKey={ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY}
        onClick={() => setDrawerVisible(true)}
      />
      <EdgeDetailCompatibilityDrawer
        visible={drawerVisible}
        featureName={IncompatibilityFeatures.HQOS}
        data={drawerDetails}
        onClose={() => setDrawerVisible(false)}
      />
    </> : null
}