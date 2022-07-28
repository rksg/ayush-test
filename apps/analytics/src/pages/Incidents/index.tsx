import React from 'react'

import { Row, Col } from 'antd'

import Header                   from '../../components/Header'
import IncidentBySeverityWidget from '../../components/IncidentBySeverity'
import NetworkHistoryWidget     from '../../components/NetworkHistory'



function Incidents () {
  return <>
    <Header title='Incidents' />
    <Row gutter={[0, 20]}>
      <Col span={4} style={{ display: 'flex', height: 220 }}>
        <IncidentBySeverityWidget />
      </Col>
      <Col span={20} style={{ display: 'flex', height: 220 }}>
        <NetworkHistoryWidget hideTitle useFullheight/>
      </Col>
      <Col span={24}>
        table
      </Col>
    </Row>
  </>
}
export default Incidents
