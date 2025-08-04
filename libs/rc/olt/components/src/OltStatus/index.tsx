import { Badge }                            from 'antd'
import { defineMessage, MessageDescriptor } from 'react-intl'

import { OltCageStateEnum, OltStatusEnum } from '@acx-ui/olt/utils'
import { getIntl }                         from '@acx-ui/utils'

type StatusType = 'olt' | 'cage'
type StatusValue = OltStatusEnum | OltCageStateEnum

interface OltStatusProps {
  type?: 'olt' | 'cage'
  status: OltStatusEnum | OltCageStateEnum
  showText?: boolean
  className?: string
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
      text: defineMessage({ defaultMessage: 'UP' })
    },
    [OltCageStateEnum.DOWN]: {
      color: 'var(--acx-neutrals-50)',
      text: defineMessage({ defaultMessage: 'DOWN' })
    }
  }
}

const getStatusInfo = (type: StatusType, status: StatusValue) => {
  const key = status?.toLowerCase?.() ?? ''
  return STATUS_CONFIG[type][key] ?? {
    color: 'var(--acx-neutrals-50)',
    text: defineMessage({ defaultMessage: 'Unknown' })
  }
}

export const OltStatus = (props: OltStatusProps) => {
  const { $t } = getIntl()
  const { type = 'olt', status, showText, className } = props
  const { color, text } = getStatusInfo(type, status)
  return <Badge
    className={className}
    color={color}
    text={showText ? $t(text) : ''}
  />
}