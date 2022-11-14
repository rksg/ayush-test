import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card, GridRow, GridCol } from '@acx-ui/components'
import { MdnsProxyFormData }      from '@acx-ui/rc/utils'

export interface MdnsProxyOverviewProps {
  data: MdnsProxyFormData
}

export function MdnsProxyOverview (props: MdnsProxyOverviewProps) {
  const { $t } = useIntl()
  const { data } = props
  const { Paragraph } = Typography

  return (
    <Card>
      <GridRow>
        <GridCol col={{ span: 6 }}>
          <Card.Title>{$t({ defaultMessage: 'Forwarding Rules' })}</Card.Title>
          <Paragraph>{data.forwardingRules?.length}</Paragraph>
        </GridCol>
      </GridRow>
    </Card>
  )
}
