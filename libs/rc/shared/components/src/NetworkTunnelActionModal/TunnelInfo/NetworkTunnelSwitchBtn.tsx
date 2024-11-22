import { Switch, Tooltip } from 'antd'
import { useIntl }         from 'react-intl'

import { EdgeMvSdLanViewData } from '@acx-ui/rc/utils'

import { messageMappings }       from '../messageMappings'
import { NetworkTunnelTypeEnum } from '../types'

interface NetworkTunnelSwitchBtnProps {
  tunnelType: NetworkTunnelTypeEnum
  onClick: (checked: boolean) => void
  venueSdLanInfo: EdgeMvSdLanViewData | undefined
  disabled?: boolean
  tooltip?: string
}

export const NetworkTunnelSwitchBtn = (props: NetworkTunnelSwitchBtnProps) => {
  const { $t } = useIntl()
  const { tunnelType, onClick, venueSdLanInfo } = props
  // eslint-disable-next-line max-len
  const isTheLastSdLanWlan = (venueSdLanInfo?.tunneledWlans?.length ?? 0) === 1 && tunnelType === NetworkTunnelTypeEnum.SdLan
  const needDisabled = isTheLastSdLanWlan || tunnelType === NetworkTunnelTypeEnum.Pin
  const tooltip = isTheLastSdLanWlan
    ? $t(messageMappings.disable_deactivate_last_network)
    : undefined

  return<Tooltip title={props.tooltip || tooltip}>
    <Switch
      checked={tunnelType !== NetworkTunnelTypeEnum.None}
      disabled={props.disabled || needDisabled}
      onClick={onClick}
    />
  </Tooltip>
}