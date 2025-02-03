import { useState } from 'react'

import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import {
  ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY,
  ApCompatibility,
  CompatibilityDeviceEnum,
  IncompatibilityFeatures,
  getCompatibilityFeatureDisplayName
} from '@acx-ui/rc/utils'

import { transformEdgeCompatibilitiesWithFeatureName } from '../../../useEdgeActions/compatibility'
import { CompatibleAlertBanner }                       from '../../CompatibleAlertBanner'
import { EdgeDetailCompatibilityDrawer }               from '../EdgeDetailCompatibilityDrawer'

import { StyledSpace } from './styledComponents'

type ApEdgeCompatibilityResult = Record<string, {
  isAll: boolean,
  isOneOf: boolean,
  isEdge: boolean,
  isAp: boolean,
  edgeCount: number,
  apCount: number
}>
export const resolveApEdgeCompatibilityInfo = (
  featureNames: IncompatibilityFeatures[],
  edgeData: Partial<Record<IncompatibilityFeatures, ApCompatibility>> | undefined,
  apData: Partial<Record<IncompatibilityFeatures, ApCompatibility>> | undefined
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

export interface EdgeCompatibilityAlertBannerProps {
  // eslint-disable-next-line max-len
  compatibilities: Partial<Record<CompatibilityDeviceEnum, Partial<Record<IncompatibilityFeatures, ApCompatibility>>>>
  featureNames: IncompatibilityFeatures[]
  isLoading?: boolean
}

const emptyData = {}
export const EdgeDetailCompatibilityBanner = (props: EdgeCompatibilityAlertBannerProps) => {
  const { $t, formatList } = useIntl()
  const { compatibilities, featureNames, isLoading = false } = props

  const [drawerFeature, setDrawerFeature] = useState<string|undefined>()

  const toggleCompatibilityDrawer = (feature: string | undefined) => {
    setDrawerFeature(feature)
  }

  let hasIncompatible = false
  let incompatibleInfo: ApEdgeCompatibilityResult = {}
  if (compatibilities) {
    const edgeData = compatibilities?.[CompatibilityDeviceEnum.EDGE]
    const apData = compatibilities?.[CompatibilityDeviceEnum.AP]

    incompatibleInfo = resolveApEdgeCompatibilityInfo(
      featureNames,
      edgeData, apData)

    hasIncompatible = Object.keys(incompatibleInfo)
      .some(name => incompatibleInfo[name].isOneOf)
  }

  return !isLoading && hasIncompatible
    ? <>
      <StyledSpace size={0} direction='vertical'>
        {Object.entries(incompatibleInfo).map(([featureName, incompatibleResult]) => {
          const {
            isAp, apCount,
            isEdge, edgeCount
          } = incompatibleResult

          const infos = []
          if (isEdge) {
            // eslint-disable-next-line max-len
            infos.push($t({ defaultMessage: '{edgeCount} {edgeCount, plural, one {RUCKUS Edge} other {RUCKUS Edges}}' }, { edgeCount }))
          }

          if (isAp) {
            // eslint-disable-next-line max-len
            infos.push($t({ defaultMessage: '{apCount} {apCount, plural, one {AP} other {APs}}' }, { apCount }))
          }

          return !!infos.length
            ? <CompatibleAlertBanner
              key={featureName}
              title={$t({
                defaultMessage: `{featureName} is not able to be 
               brought up on {infos} due to their firmware incompatibility.` },
              {
              // eslint-disable-next-line max-len
                featureName: getCompatibilityFeatureDisplayName(featureName as IncompatibilityFeatures),
                infos: formatList(infos, { type: 'conjunction' })
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
          : emptyData}
        onClose={() => toggleCompatibilityDrawer(undefined)}
      />
    </>
    : null
}