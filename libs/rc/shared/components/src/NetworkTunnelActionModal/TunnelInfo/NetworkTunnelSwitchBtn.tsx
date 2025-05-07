import { Switch, Tooltip } from 'antd'
import { useIntl }         from 'react-intl'

import { EdgeMvSdLanViewData } from '@acx-ui/rc/utils'

import { messageMappings }       from '../messageMappings'
import { NetworkTunnelTypeEnum } from '../types'
import { usePermissionResult }   from '../usePermissionResult'

interface NetworkTunnelSwitchBtnProps {
  tunnelType: NetworkTunnelTypeEnum
  onClick: (checked: boolean) => Promise<void> | void
  venueSdLanInfo: EdgeMvSdLanViewData | undefined
  disabled?: boolean
  tooltip?: string
}

export const NetworkTunnelSwitchBtn = (props: NetworkTunnelSwitchBtnProps) => {
  const { $t } = useIntl()
  const { tunnelType, onClick, venueSdLanInfo } = props
  const {
    hasPartialPermission,
    hasEdgeSdLanPermission,
    hasSoftGrePermission
  } = usePermissionResult()

  // eslint-disable-next-line max-len
  const isTheLastSdLanWlan = (venueSdLanInfo?.tunneledWlans?.length ?? 0) === 1 && tunnelType === NetworkTunnelTypeEnum.SdLan
  const hasPermission = (
    tunnelType === NetworkTunnelTypeEnum.None && hasPartialPermission
  ) || (
    (tunnelType === NetworkTunnelTypeEnum.SdLan && hasEdgeSdLanPermission) ||
    (tunnelType === NetworkTunnelTypeEnum.SoftGre && hasSoftGrePermission)
  )
  // eslint-disable-next-line max-len
  const needDisabled = isTheLastSdLanWlan || tunnelType === NetworkTunnelTypeEnum.Pin || !hasPermission
  const tooltip = isTheLastSdLanWlan
    ? $t(messageMappings.disable_deactivate_last_network)
    : undefined

  const handleOnClick = async (val: boolean) => {
    try {
      await onClick(val)
    } catch {
      // no-op
    }
  }

  return <Tooltip title={props.tooltip || tooltip}>
    <Switch
      checked={tunnelType !== NetworkTunnelTypeEnum.None}
      disabled={props.disabled || needDisabled}
      onClick={handleOnClick}
    />
  </Tooltip>
}