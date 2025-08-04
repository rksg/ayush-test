import { Badge } from 'antd'

import { OltCageStateEnum, OltStatusEnum } from '@acx-ui/olt/utils'
import { getIntl }                         from '@acx-ui/utils'

const statusMapping = (status: OltStatusEnum | OltCageStateEnum) => {
  const { $t } = getIntl()
  const transformedStatus = status?.toLowerCase()

  switch (transformedStatus) {
    case OltStatusEnum.ONLINE:
    case OltCageStateEnum.UP:
      return {
        color: 'var(--acx-semantics-green-50)',
        text: $t({ defaultMessage: 'Online' })
      }
    case OltStatusEnum.OFFLINE:
    case OltCageStateEnum.DOWN:
      return {
        color: 'var(--acx-neutrals-50)',
        text: $t({ defaultMessage: 'Offline' })
      }
    default:
      return {
        color: 'var(--acx-neutrals-50)',
        text: $t({ defaultMessage: 'Unknown' })
      }
  }
}
interface OltStatusProps {
  status: OltStatusEnum | OltCageStateEnum
  showText?: boolean
  className?: string
}

export const OltStatus = (props: OltStatusProps) => {
  const { status, showText, className } = props
  const { text, color } = statusMapping(status)
  return <Badge
    className={className}
    color={color}
    text={showText ? text : ''}
  />
}