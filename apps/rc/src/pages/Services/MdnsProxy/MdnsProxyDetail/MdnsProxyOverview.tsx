import { Row, Col, Typography } from 'antd'
import { useIntl }              from 'react-intl'

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
      <Row gutter={[24, 8]} style={{ width: '100%' }}>
        <Col span={6}>
          <Typography.Title level={4}>{$t({ defaultMessage: 'Tags' })}</Typography.Title>
          <Typography.Text>{data.tags}</Typography.Text>
        </Col>
        <Col span={6}>
          <Typography.Title level={4}>{$t({ defaultMessage: 'Forwardig Rules' })}</Typography.Title>
          <Typography.Text>{data.forwardingRules?.length}</Typography.Text>
        </Col>
      </Row>
    </Card>
  )
}
