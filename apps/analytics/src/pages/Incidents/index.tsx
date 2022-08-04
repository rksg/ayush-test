import React from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import Header                   from '../../components/Header'
import IncidentBySeverityWidget from '../../components/IncidentBySeverity'
import NetworkHistoryWidget     from '../../components/NetworkHistory'

function Incidents () {
  const { $t } = useIntl()
  return <>
    <Header title={$t({ defaultMessage: 'Incidents' })} />
    <Row gutter={[0, 20]}>
      <Col span={4} style={{ display: 'flex', height: 220 }}>
        <IncidentBySeverityWidget />
      </Col>
      <Col span={20} style={{ display: 'flex', height: 220 }}>
        <NetworkHistoryWidget hideTitle/>
      </Col>
      <Col span={24}>
        table
      </Col>
    </Row>
  </>
}
export default Incidents
