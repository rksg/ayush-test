import { Badge } from 'antd'
import { get }   from 'lodash'

import { EdgeNokiaCageStateEnum, EdgeNokiaOltStatusEnum } from '@acx-ui/rc/utils'

interface EdgeNokiaOltStatusProps {
  config: Record<string, { color: string, text: string }>
  status: EdgeNokiaOltStatusEnum | EdgeNokiaCageStateEnum
  showText?: boolean
  className?: string
}
export const EdgeNokiaOltStatus = (props: EdgeNokiaOltStatusProps) => {
  const { config, status, showText, className } = props

  return <Badge
    className={className}
    color={get(config, status)?.color}
    text={showText ? (get(config, status)?.text || status) : ''}
  />
}