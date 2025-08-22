import { Badge }                            from 'antd'
import { defineMessage, MessageDescriptor } from 'react-intl'

import { OltCageStateEnum, OltStatusEnum, OltPortStatusEnum } from '@acx-ui/olt/utils'
import { getIntl }                                            from '@acx-ui/utils'

type StatusType = 'olt' | 'cage' | 'port'
type StatusValue = OltStatusEnum | OltCageStateEnum | OltPortStatusEnum

interface OltStatusProps {
  type?: 'olt' | 'cage' | 'port'
  status?: OltStatusEnum | OltCageStateEnum | OltPortStatusEnum
  showText?: boolean
  style?: React.CSSProperties
}

// eslint-disable-next-line max-len
const STATUS_CONFIG: Record<StatusType, Record<string, { color: string; text: MessageDescriptor }>> = {
  olt: {
    [OltStatusEnum.ONLINE]: {
      color: 'var(--acx-semantics-green-50)',
      text: defineMessage({ defaultMessage: 'Online' })
    },
    [OltStatusEnum.OFFLINE]: {
      color: 'var(--acx-neutrals-50)',
      text: defineMessage({ defaultMessage: 'Offline' })
    }
  },
  cage: {
    [OltCageStateEnum.UP]: {
      color: 'var(--acx-semantics-green-50)',
      text: defineMessage({ defaultMessage: 'Up' })
    },
    [OltCageStateEnum.DOWN]: {
      color: 'var(--acx-neutrals-50)',
      text: defineMessage({ defaultMessage: 'Down' })
    }
  },
  port: {
    [OltCageStateEnum.UP]: {
      color: 'var(--acx-semantics-green-50)',
      text: defineMessage({ defaultMessage: 'Up' })
    },
    [OltCageStateEnum.DOWN]: {
      color: 'var(--acx-neutrals-50)',
      text: defineMessage({ defaultMessage: 'Down' })
    }
  }
}

const getStatusInfo = (type: StatusType, status: StatusValue) => {
  const key = status.toLowerCase()
  return STATUS_CONFIG[type][key] ?? {
    color: 'var(--acx-neutrals-50)',
    text: defineMessage({ defaultMessage: 'Unknown' })
  }
}

export const OltStatus = (props: OltStatusProps) => {
  const { $t } = getIntl()
  const { type = 'olt', status = OltStatusEnum.UNKNOWN, showText, style } = props
  const { color, text } = getStatusInfo(type, status)

  return <Badge
    style={style}
    color={color}
    text={showText ? $t(text) : ''}
  />
}