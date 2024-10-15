import { Switch, Tooltip } from 'antd'

import { NetworkTunnelTypeEnum } from '../types'

interface NetworkTunnelSwitchBtnProps {
  tunnelType: NetworkTunnelTypeEnum
  disabled: boolean
  tooltip: string | undefined
  onClick: (checked: boolean) => void
}

export const NetworkTunnelSwitchBtn = (props: NetworkTunnelSwitchBtnProps) => {
  const { tunnelType, disabled, tooltip, onClick } = props
  return<Tooltip title={tooltip}>
    <Switch
      checked={tunnelType !== NetworkTunnelTypeEnum.None}
      disabled={disabled}
      onClick={onClick}
    />
  </Tooltip>
}