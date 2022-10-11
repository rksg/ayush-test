import { Row, Col, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { Card } from '@acx-ui/components'

export function MdnsProxyOverview () {
  const { $t } = useIntl()

  // TODO
  const mockedData = {
    tags: 'tag 1, tag2, tag3',
    forwardingRuleCount: 4
  }

  return (
    <Card>
      <Row gutter={[24, 8]} style={{ width: '100%' }}>
        <Col span={6}>
          <Typography.Title level={4}>{$t({ defaultMessage: 'Tags' })}</Typography.Title>
          <Typography.Text>{mockedData.tags}</Typography.Text>
        </Col>
        <Col span={6}>
          <Typography.Title level={4}>{$t({ defaultMessage: 'Forwardig Rules' })}</Typography.Title>
          <Typography.Text>{mockedData.forwardingRuleCount}</Typography.Text>
        </Col>
      </Row>
    </Card>
  )
}
