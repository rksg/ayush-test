import { useState } from 'react'

import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import {
  CompatibleAlertBanner,
  EdgeDetailCompatibilityDrawer,
  useEdgeMdnsDetailsCompatibilitiesData
} from '@acx-ui/rc/components'
import {
  ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY,
  CompatibilityDeviceEnum,
  IncompatibilityFeatures,
  getCompatibilityFeatureDisplayName
} from '@acx-ui/rc/utils'

export const CompatibilityCheck = ({ serviceId }: { serviceId: string }) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState<boolean>(false)

  const { compatibilities, isLoading } = useEdgeMdnsDetailsCompatibilitiesData({ serviceId })

  const toggleCompatibilityDrawer = (open: boolean) => {
    setVisible(open)
  }

  const data = get(compatibilities, IncompatibilityFeatures.EDGE_MDNS_PROXY)
  const edgeCount = data?.incompatible ?? 0

  return !isLoading && edgeCount
    ? <>
      <CompatibleAlertBanner
        title={$t({
          defaultMessage: `{featureName} is not able to be 
               brought up on {edgeInfo} due to their firmware incompatibility.` },
        {
          // eslint-disable-next-line max-len
          featureName: getCompatibilityFeatureDisplayName(IncompatibilityFeatures.EDGE_MDNS_PROXY),
          // eslint-disable-next-line max-len
          edgeInfo: $t({ defaultMessage: '{edgeCount} {edgeCount, plural, one {RUCKUS Edge} other {RUCKUS Edges}}' }, { edgeCount })
        })}
        cacheKey={ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY}
        onClick={() => toggleCompatibilityDrawer(true)}
      />
      <EdgeDetailCompatibilityDrawer
        visible={visible}
        featureName={IncompatibilityFeatures.EDGE_MDNS_PROXY}
        data={{ [CompatibilityDeviceEnum.EDGE]: data }}
        onClose={() => toggleCompatibilityDrawer(false)}
      />
    </>
    : null
}