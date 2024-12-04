import { find, sumBy } from 'lodash'
import { useIntl }     from 'react-intl'

import { ApCompatibilityToolTip, CompatibilityWarningTriangleIcon } from '@acx-ui/rc/components'
import {
  CompatibilityDeviceEnum,
  EdgeSdLanApCompatibility,
  EdgeServiceApCompatibility,
  EdgeServiceCompatibility
} from '@acx-ui/rc/utils'

interface CompatibilityCheckProps {
  serviceId: string,
  // eslint-disable-next-line max-len
  sdLanCompatibilityData?: Record<string, EdgeServiceCompatibility[] | EdgeSdLanApCompatibility[] | EdgeServiceApCompatibility[]>
}
export const CompatibilityCheck = (props: CompatibilityCheckProps) => {
  const { $t } = useIntl()
  const { serviceId, sdLanCompatibilityData } = props

  // eslint-disable-next-line max-len
  const edgeIncompatibleData = (find(sdLanCompatibilityData?.[CompatibilityDeviceEnum.EDGE], { serviceId }) as EdgeServiceCompatibility)?.clusterEdgeCompatibilities
  const edgeIncompatibleCount = sumBy(edgeIncompatibleData, (data) => data.incompatible)
  const edgeIncompatible = edgeIncompatibleCount > 0

  // eslint-disable-next-line max-len
  const apIncompatibleData = (find(sdLanCompatibilityData?.[CompatibilityDeviceEnum.AP], { serviceId }) as EdgeSdLanApCompatibility)
  const isNewDataModel = apIncompatibleData?.hasOwnProperty('venueEdgeServiceApCompatibilities')
  const apData = (isNewDataModel
    ? (apIncompatibleData as EdgeServiceApCompatibility)?.venueEdgeServiceApCompatibilities
    : (apIncompatibleData as EdgeSdLanApCompatibility)?.venueSdLanApCompatibilities) ?? []

  const apIncompatibleCount = sumBy(apData, (data) => data.incompatible)
  const apIncompatible = apIncompatibleCount > 0

  const isIncompatible = Boolean(edgeIncompatible || apIncompatible)

  return isIncompatible
    ? <ApCompatibilityToolTip
    // eslint-disable-next-line max-len
      title={$t({
        defaultMessage: `This SD-LAN is not able to be brought up
        on some {edgeInfo} {hasAnd} {apInfo} due to their firmware incompatibility.` },
      {
        edgeInfo: (edgeIncompatible
        // eslint-disable-next-line max-len
          ? $t({ defaultMessage: '{edgeCount, plural, one {RUCKUS Edge} other {RUCKUS Edges}}' }, { edgeCount: edgeIncompatibleCount })
          : ''),
        hasAnd: ((edgeIncompatible && apIncompatible) ? $t({ defaultMessage: 'and' }) : ''),
        apInfo: (apIncompatible
        // eslint-disable-next-line max-len
          ? $t({ defaultMessage: '{apCount, plural, one {access point} other {access points}}' }, { apCount: apIncompatibleCount })
          : '')
      })}
      visible={false}
      icon={<CompatibilityWarningTriangleIcon />}
      onClick={() => {}}
    />
    : null
}