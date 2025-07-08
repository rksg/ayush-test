import { Switch, Tooltip } from 'antd'

import { EdgeMvSdLanViewData } from '@acx-ui/rc/utils'

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
  const { tunnelType, onClick } = props
  const {
    hasPartialPermission,
    hasEdgeSdLanPermission,
    hasSoftGrePermission
  } = usePermissionResult()

  const hasPermission = (
    tunnelType === NetworkTunnelTypeEnum.None && hasPartialPermission
  ) || (
    (tunnelType === NetworkTunnelTypeEnum.SdLan && hasEdgeSdLanPermission) ||
    (tunnelType === NetworkTunnelTypeEnum.SoftGre && hasSoftGrePermission)
  )

  const needDisabled = tunnelType === NetworkTunnelTypeEnum.Pin || !hasPermission

  const handleOnClick = async (val: boolean) => {
    try {
      await onClick(val)
    } catch {
      // no-op
    }
  }

  return <Tooltip title={props.tooltip}>
    <Switch
      checked={tunnelType !== NetworkTunnelTypeEnum.None}
      disabled={props.disabled || needDisabled}
      onClick={handleOnClick}
    />
  </Tooltip>
}