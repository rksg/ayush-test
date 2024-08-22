import { useState } from 'react'

import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import {
  CompatibleAlertBanner,
  EdgeSdLanDetailCompatibilityDrawer,
  useEdgeSdLanDetailsCompatibilitiesData
} from '@acx-ui/rc/components'
import {
  ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY,
  CompatibilityDeviceEnum,
  IncompatibilityFeatures
} from '@acx-ui/rc/utils'

export const CompatibilityCheck = ({ serviceId }: { serviceId: string }) => {
  const { $t } = useIntl()
  const [isCompatibleDrawerVisible, setIsCompatibleDrawerVisible] = useState<boolean>(false)

  const { sdLanCompatibilities, isLoading } = useEdgeSdLanDetailsCompatibilitiesData(serviceId)

  const toggleCompatibilityDrawer = (toggle: boolean) => {
    setIsCompatibleDrawerVisible(toggle)
  }

  // eslint-disable-next-line max-len
  const edgeIncompatibleCount = (sdLanCompatibilities?.[CompatibilityDeviceEnum.EDGE])?.incompatible ?? 0
  const isEdgeIncompatible = edgeIncompatibleCount > 0
  // eslint-disable-next-line max-len
  const apIncompatibleCount = (sdLanCompatibilities?.[CompatibilityDeviceEnum.AP])?.incompatible ?? 0
  const isApIncompatible = apIncompatibleCount > 0

  const isAllIncompatible = isEdgeIncompatible && isApIncompatible
  const isIncompatible = isEdgeIncompatible || isApIncompatible

  return !isLoading
    ? <Row>
      {isIncompatible
        ? <CompatibleAlertBanner
          title={$t({
            defaultMessage: `SD-LAN is not able to be 
            brought up on {edgeInfo} {hasAnd} {apInfo} due to their firmware incompatibility.` },
          {
            edgeInfo: (isEdgeIncompatible
              // eslint-disable-next-line max-len
              ? $t({ defaultMessage: '{edgeCount} {edgeCount, plural, one {SmartEdge} other {SmartEdges}}' }, { edgeCount: edgeIncompatibleCount })
              : ''),
            hasAnd: (isAllIncompatible ? $t({ defaultMessage: 'and' }) : ''),
            apInfo: (isApIncompatible
              // eslint-disable-next-line max-len
              ? $t({ defaultMessage: '{apCount} {apCount, plural, one {AP} other {APs}}' }, { apCount: apIncompatibleCount })
              : '')
          })}
          cacheKey={ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY}
          onClick={() => toggleCompatibilityDrawer(true)}
        />
        : null}
      <EdgeSdLanDetailCompatibilityDrawer
        visible={isCompatibleDrawerVisible}
        featureName={IncompatibilityFeatures.SD_LAN}
        data={sdLanCompatibilities}
        onClose={() => toggleCompatibilityDrawer(false)}
      />
    </Row>
    : null
}