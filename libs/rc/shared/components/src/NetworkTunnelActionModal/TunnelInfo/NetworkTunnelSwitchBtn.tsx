import { Switch, Tooltip } from 'antd'
import { useIntl }         from 'react-intl'

import { EdgeMvSdLanViewData } from '@acx-ui/rc/utils'

import { NetworkTunnelTypeEnum } from '../types'

interface NetworkTunnelSwitchBtnProps {
  tunnelType: NetworkTunnelTypeEnum
  disabled: boolean | undefined
  tooltip: string | undefined
  onClick: (checked: boolean) => void
  venueSdLanInfo: EdgeMvSdLanViewData | undefined
}

export const NetworkTunnelSwitchBtn = (props: NetworkTunnelSwitchBtnProps) => {
  const { $t } = useIntl()
  const { tunnelType, onClick, venueSdLanInfo } = props
  // eslint-disable-next-line max-len
  const isTheLastSdLanWlan = (venueSdLanInfo?.tunneledWlans?.length ?? 0) === 1 && tunnelType === NetworkTunnelTypeEnum.SdLan
  const needDisabled = isTheLastSdLanWlan || tunnelType === NetworkTunnelTypeEnum.Pin
  const tooltip = isTheLastSdLanWlan
  // eslint-disable-next-line max-len
    ? $t({ defaultMessage: 'Cannot deactivate the last network at this <venueSingular></venueSingular>' })
    : undefined

  return<Tooltip title={props.tooltip || tooltip}>
    <Switch
      checked={tunnelType !== NetworkTunnelTypeEnum.None}
      disabled={props.disabled || needDisabled}
      onClick={onClick}
    />
  </Tooltip>
}