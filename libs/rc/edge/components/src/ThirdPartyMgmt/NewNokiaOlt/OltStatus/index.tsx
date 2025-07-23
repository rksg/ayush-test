import { Badge } from 'antd'

import { EdgeNokiaCageStateEnum, EdgeNokiaOltStatusEnum } from '@acx-ui/rc/utils'
import { getIntl }                                        from '@acx-ui/utils'

const statusMapping = (status: EdgeNokiaOltStatusEnum | EdgeNokiaCageStateEnum) => {
  const { $t } = getIntl()
  const transformedStatus = status?.toLowerCase()

  switch (transformedStatus) {
    case EdgeNokiaOltStatusEnum.ONLINE:
    case EdgeNokiaCageStateEnum.UP:
      return {
        color: 'var(--acx-semantics-green-50)',
        text: $t({ defaultMessage: 'Online' })
      }
    case EdgeNokiaOltStatusEnum.OFFLINE:
    case EdgeNokiaCageStateEnum.DOWN:
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
interface EdgeNokiaOltStatusProps {
  status: EdgeNokiaOltStatusEnum | EdgeNokiaCageStateEnum
  showText?: boolean
  className?: string
}

export const EdgeNewNokiaOltStatus = (props: EdgeNokiaOltStatusProps) => {
  const { status, showText, className } = props
  const { text, color } = statusMapping(status)
  return <Badge
    className={className}
    color={color}
    text={showText ? text : ''}
  />
}