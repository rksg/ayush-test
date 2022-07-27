import React from 'react'

import { Row } from 'antd'

import Header               from '../../components/Header'
import NetworkHistoryWidget from '../../components/NetworkHistory'

import { Button, PageHeader, DashboardCol } from '@acx-ui/components'
import IncidentBySeverityWidget from '../../components/IncidentBySeverity'


function Incidents () {
  return <>
    <Header title='Incidents' />
    <Row gutter={[20, 20]}>
      <Col span={4}>
        <div>bar chart</div>
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
