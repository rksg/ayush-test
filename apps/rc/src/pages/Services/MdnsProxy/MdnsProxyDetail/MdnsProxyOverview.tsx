import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card }              from '@acx-ui/components'
import { MdnsProxyFormData } from '@acx-ui/rc/utils'

export interface MdnsProxyOverviewProps {
  data: MdnsProxyFormData
}

export function MdnsProxyOverview (props: MdnsProxyOverviewProps) {
  const { $t } = useIntl()
  const { data } = props

  return (
    <Card>
      <Card.Title>{$t({ defaultMessage: 'Forwarding Rules' })}</Card.Title>
      <Typography.Paragraph>{data.rules?.length}</Typography.Paragraph>
    </Card>
  )
}
