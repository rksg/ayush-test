import { useState } from 'react'

import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import {
  CompatibleAlertBanner,
  EdgeDetailCompatibilityDrawer,
  transformEdgeCompatibilitiesWithFeatureName,
  useEdgeSdLanDetailsCompatibilitiesData
} from '@acx-ui/rc/components'
import {
  ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY,
  ApCompatibility,
  CompatibilityDeviceEnum,
  IncompatibilityFeatures,
  edgeSdLanRequiredFeatures,
  getCompatibilityFeatureDisplayName
} from '@acx-ui/rc/utils'

import { StyledSpace } from './styledComponents'

type ApEdgeCompatibilityResult = Record<string, {
  isAll: boolean,
  isOneOf: boolean,
  isEdge: boolean,
  isAp: boolean,
  edgeCount: number,
  apCount: number
}>
const checkApEdgeCompatibility = (
  featureNames: IncompatibilityFeatures[],
  edgeData: Record<string, ApCompatibility> | undefined,
  apData: Record<string, ApCompatibility> | undefined
): ApEdgeCompatibilityResult => {
  const mapping = {} as ApEdgeCompatibilityResult
  featureNames.forEach(featureName => {
    const edgeCount = get(edgeData, featureName)?.incompatible ?? 0
    const isEdge = edgeCount > 0

    const apCount = get(apData, featureName)?.incompatible ?? 0
    const isAp = apCount > 0

    const isAll = isEdge && isAp
    const isOneOf = isEdge || isAp

    mapping[featureName] = {
      isAll,
      isOneOf,
      isEdge,
      isAp,
      edgeCount,
      apCount
    }
  })
  return mapping
}

export const CompatibilityCheck = ({ serviceId }: { serviceId: string }) => {
  const { $t } = useIntl()
  const [drawerFeature, setDrawerFeature] = useState<string|undefined>()

  const { compatibilities, isLoading } = useEdgeSdLanDetailsCompatibilitiesData({ serviceId })

  const toggleCompatibilityDrawer = (feature: string | undefined) => {
    setDrawerFeature(feature)
  }

  let hasIncompatible = false
  let incompatibleInfo: ApEdgeCompatibilityResult = {}
  if (compatibilities) {
    const edgeData = compatibilities?.[CompatibilityDeviceEnum.EDGE]
    const apData = compatibilities?.[CompatibilityDeviceEnum.AP]

    incompatibleInfo = checkApEdgeCompatibility(edgeSdLanRequiredFeatures, edgeData, apData)

    hasIncompatible = Object.keys(incompatibleInfo)
      .some(name => incompatibleInfo[name].isOneOf)
  }

  return !isLoading && hasIncompatible
    ? <>
      <StyledSpace size={0} direction='vertical'>
        {Object.entries(incompatibleInfo).map(([featureName, incompatibleResult]) => {
          const {
            isOneOf, isAll,
            isAp, apCount,
            isEdge, edgeCount
          } = incompatibleResult

          return isOneOf
            ? <CompatibleAlertBanner
              key={featureName}
              title={$t({
                defaultMessage: `{featureName} is not able to be 
               brought up on {edgeInfo} {hasAnd} {apInfo} due to their firmware incompatibility.` },
              {
              // eslint-disable-next-line max-len
                featureName: getCompatibilityFeatureDisplayName(featureName as IncompatibilityFeatures),
                edgeInfo: (isEdge
                // eslint-disable-next-line max-len
                  ? $t({ defaultMessage: '{edgeCount} {edgeCount, plural, one {RUCKUS Edge} other {RUCKUS Edges}}' }, { edgeCount })
                  : ''),
                hasAnd: (isAll ? $t({ defaultMessage: 'and' }) : ''),
                apInfo: (isAp
                // eslint-disable-next-line max-len
                  ? $t({ defaultMessage: '{apCount} {apCount, plural, one {AP} other {APs}}' }, { apCount })
                  : '')
              })}
              cacheKey={ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY}
              onClick={() => toggleCompatibilityDrawer(featureName)}
            />
            : null
        })}
      </StyledSpace>
      <EdgeDetailCompatibilityDrawer
        visible={!!drawerFeature}
        featureName={drawerFeature as IncompatibilityFeatures}
        data={drawerFeature
          ? transformEdgeCompatibilitiesWithFeatureName(compatibilities, drawerFeature)
          : {}}
        onClose={() => toggleCompatibilityDrawer(undefined)}
      />
    </>
    : null
}