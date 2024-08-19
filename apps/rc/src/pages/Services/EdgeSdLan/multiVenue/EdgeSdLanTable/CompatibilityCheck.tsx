import { find, sumBy } from 'lodash'
import { useIntl }     from 'react-intl'

import { ApCompatibilityToolTip, CompatibilityWarningCircleIcon }                    from '@acx-ui/rc/components'
import { CompatibilityDeviceEnum, EdgeSdLanApCompatibility, EdgeSdLanCompatibility } from '@acx-ui/rc/utils'

interface CompatibilityCheckProps {
  serviceId: string,
  sdLanCompatibilityData?: Record<string, EdgeSdLanCompatibility[] | EdgeSdLanApCompatibility[]>
}
export const CompatibilityCheck = (props: CompatibilityCheckProps) => {
  const { $t } = useIntl()
  const { serviceId, sdLanCompatibilityData } = props

  // eslint-disable-next-line max-len
  const edgeIncompatibleData = (find(sdLanCompatibilityData?.[CompatibilityDeviceEnum.EDGE], { serviceId }) as EdgeSdLanCompatibility)?.clusterEdgeCompatibilities
  const edgeIncompatible = sumBy(edgeIncompatibleData, (data) => data.incompatible)
  // eslint-disable-next-line max-len
  const apIncompatibleData = (find(sdLanCompatibilityData?.[CompatibilityDeviceEnum.AP], { serviceId }) as EdgeSdLanApCompatibility)?.venueSdLanApCompatibilities
  const apIncompatible = sumBy(apIncompatibleData, (data) => data.incompatible)

  const deviceTypes = edgeIncompatible && apIncompatible
    ? $t({ defaultMessage: 'SmartEdges and access points' })
    : (edgeIncompatible ?
      $t({ defaultMessage: 'SmartEdges' })
      : $t({ defaultMessage: 'access points' }))

  const isIncompatible = Boolean(edgeIncompatible || apIncompatible)
  return isIncompatible
    ? <ApCompatibilityToolTip
    // eslint-disable-next-line max-len
      title={$t({ defaultMessage: 'This SD-LAN is not able to be brought up on some {deviceTypes} due to thier firmware incompatibility.' },
        { deviceTypes })}
      visible={false}
      icon={<CompatibilityWarningCircleIcon />}
      onClick={() => {}}
    />
    : null
}