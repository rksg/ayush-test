import { find, sumBy } from 'lodash'
import { useIntl }     from 'react-intl'

import {
  CompatibilityDeviceEnum,
  EdgeSdLanApCompatibility,
  EdgeServiceApCompatibility,
  EdgeServiceCompatibility,
  EdgeServiceCompatibilityV1_1,
  EntityCompatibilityV1_1,
  getCompatibilityFeatureDisplayName,
  IncompatibilityFeatures
} from '@acx-ui/rc/utils'

import { ApCompatibilityToolTip }           from '../../../ApCompatibility/ApCompatibilityToolTip'
import { CompatibilityWarningTriangleIcon } from '../../styledComponents'

interface EdgeTableCompatibilityWarningTooltipProps {
  serviceId: string,
  featureName: IncompatibilityFeatures,
  // eslint-disable-next-line max-len
  compatibility?: Record<string, EdgeServiceCompatibilityV1_1[] | EdgeServiceCompatibility[] | EdgeSdLanApCompatibility[] | EdgeServiceApCompatibility[]>
}
// eslint-disable-next-line max-len
export const EdgeTableCompatibilityWarningTooltip = (props: EdgeTableCompatibilityWarningTooltipProps) => {
  const { $t, formatList } = useIntl()
  const { serviceId, featureName, compatibility } = props

  // eslint-disable-next-line max-len
  const edgeIncompatibleData = (find(compatibility?.[CompatibilityDeviceEnum.EDGE], { serviceId }) as (EdgeServiceCompatibilityV1_1 | EdgeServiceCompatibility))?.clusterEdgeCompatibilities
  // eslint-disable-next-line max-len
  const edgeIncompatibleCount = sumBy(edgeIncompatibleData as EntityCompatibilityV1_1[], (data) => data.incompatible)
  const edgeIncompatible = edgeIncompatibleCount > 0

  // eslint-disable-next-line max-len
  const apIncompatibleData = (find(compatibility?.[CompatibilityDeviceEnum.AP], { serviceId }) as (EdgeSdLanApCompatibility | EdgeServiceApCompatibility))
  const isNewDataModel = apIncompatibleData?.hasOwnProperty('venueEdgeServiceApCompatibilities')
  const apData = (isNewDataModel
    ? (apIncompatibleData as EdgeServiceApCompatibility)?.venueEdgeServiceApCompatibilities
    : (apIncompatibleData as EdgeSdLanApCompatibility)?.venueSdLanApCompatibilities) ?? []

  const apIncompatibleCount = sumBy(apData, (data) => data.incompatible)
  const apIncompatible = apIncompatibleCount > 0

  const isIncompatible = Boolean(edgeIncompatible || apIncompatible)

  const infos = []
  if (edgeIncompatible) {
    // eslint-disable-next-line max-len
    infos.push($t({ defaultMessage: '{edgeCount, plural, one {RUCKUS Edge} other {RUCKUS Edges}}' }, { edgeCount: edgeIncompatibleCount }))
  }

  if (apIncompatible) {
    // eslint-disable-next-line max-len
    infos.push($t({ defaultMessage: '{apCount, plural, one {access point} other {access points}}' }, { apCount: apIncompatibleCount }))
  }

  return isIncompatible
    ? <ApCompatibilityToolTip
    // eslint-disable-next-line max-len
      title={$t({
        defaultMessage: `This {featureName} is not able to be brought up
        on some {infos} due to their firmware incompatibility.` },
      {
        featureName: getCompatibilityFeatureDisplayName(featureName),
        infos: formatList(infos, { type: 'conjunction' })
      })}
      showDetailButton={false}
      icon={<CompatibilityWarningTriangleIcon />}
    />
    : null
}