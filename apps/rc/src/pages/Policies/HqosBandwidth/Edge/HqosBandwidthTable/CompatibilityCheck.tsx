import { find, sumBy } from 'lodash'
import { useIntl }     from 'react-intl'

import { ApCompatibilityToolTip, CompatibilityWarningTriangleIcon } from '@acx-ui/rc/components'
import { EdgeServiceCompatibility }                                 from '@acx-ui/rc/utils'

interface CompatibilityCheckProps {
  serviceId: string,
  compatibilityData: EdgeServiceCompatibility[]
}
export const CompatibilityCheck = (props: CompatibilityCheckProps) => {
  const { $t } = useIntl()
  const { serviceId, compatibilityData } = props

  const edgeIncompatibleData = find(compatibilityData, { serviceId })?.clusterEdgeCompatibilities
  const edgeIncompatibleCount = sumBy(edgeIncompatibleData, (data) => data.incompatible)
  const isIncompatible = edgeIncompatibleCount > 0


  return isIncompatible
    ? <ApCompatibilityToolTip
    // eslint-disable-next-line max-len
      title={$t({
        defaultMessage: `This HQoS is not able to be brought up
        on some {edgeInfo} due to their firmware incompatibility.` },
      {
        // eslint-disable-next-line max-len
        edgeInfo: $t({ defaultMessage: '{edgeCount, plural, one {RUCKUS Edge} other {RUCKUS Edges}}' }, { edgeCount: edgeIncompatibleCount })
      })}
      visible={false}
      icon={<CompatibilityWarningTriangleIcon />}
      onClick={() => {}}
    />
    : null
}