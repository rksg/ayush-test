import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { ClientProperties } from './ClientProperties'

export function ClientOverviewTab () {
  const { $t } = useIntl()
  return <Row gutter={24}>
    <Col span={18}>
      {$t({ defaultMessage: 'ClientOverviewTab' })}
    </Col>
    <Col span={6}>
      <ClientProperties />
    </Col>
  </Row>
}