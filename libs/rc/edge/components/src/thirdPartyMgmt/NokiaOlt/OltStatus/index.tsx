import { Badge } from 'antd'

import { EdgeNokiaOltStatusEnum } from '@acx-ui/rc/utils'

interface EdgeNokiaOltStatusProps {
  config: Record<string, { color: string, text: string }>
  status: EdgeNokiaOltStatusEnum | undefined
}
export const EdgeNokiaOltStatus = (props: EdgeNokiaOltStatusProps) => {
  const { config, status } = props

  return <Badge
    color={config[status]?.color}
    text={showText ? (config[data]?.text || data) : ''}
  />
}