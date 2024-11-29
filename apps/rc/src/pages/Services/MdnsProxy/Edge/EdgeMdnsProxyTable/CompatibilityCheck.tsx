import { find, sumBy } from 'lodash'
import { useIntl }     from 'react-intl'

import { ApCompatibilityToolTip, CompatibilityWarningTriangleIcon } from '@acx-ui/rc/components'
import { CompatibilityDeviceEnum, EdgeServiceCompatibility }        from '@acx-ui/rc/utils'

interface CompatibilityCheckProps {
  serviceId: string,
  compatibilityData?: Record<string, EdgeServiceCompatibility[]>
}
export const CompatibilityCheck = (props: CompatibilityCheckProps) => {
  const { $t } = useIntl()
  const { serviceId, compatibilityData } = props

  // eslint-disable-next-line max-len
  const edgeIncompatibleData = (find(compatibilityData?.[CompatibilityDeviceEnum.EDGE], { serviceId }) as EdgeServiceCompatibility)?.clusterEdgeCompatibilities
  const edgeIncompatibleCount = sumBy(edgeIncompatibleData, (data) => data.incompatible)
  const edgeIncompatible = edgeIncompatibleCount > 0

  const isIncompatible = Boolean(edgeIncompatible)

  return isIncompatible
    ? <ApCompatibilityToolTip
    // eslint-disable-next-line max-len
      title={$t({
        defaultMessage: `This Edge mDNS Proxy is not able to be brought up
        on some {edgeInfo} due to their firmware incompatibility.` },
      {
        edgeInfo: (edgeIncompatible
        // eslint-disable-next-line max-len
          ? $t({ defaultMessage: '{edgeCount, plural, one {RUCKUS Edge} other {RUCKUS Edges}}' }, { edgeCount: edgeIncompatibleCount })
          : '')
      })}
      visible={false}
      icon={<CompatibilityWarningTriangleIcon />}
      onClick={() => {}}
    />
    : null
}