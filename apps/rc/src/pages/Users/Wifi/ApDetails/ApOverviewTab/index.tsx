import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { ClientProperties } from './ClientProperties'

export function ApOverviewTab () {
  const { $t } = useIntl()
  return <>
    {$t({ defaultMessage: 'ApOverviewTab' })}
    <Row gutter={24}>
      <Col span={18}>
        widget
      </Col>
      <Col span={6}>
        <ClientProperties />
      </Col>
    </Row>
  </>
}