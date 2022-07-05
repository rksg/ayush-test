import React from 'react'

import { Col, Row } from 'antd'

import Header  from '../../components/Header'

function Incidents () {
  return <>
    <Header title='Incidents' />
    <Row gutter={[20, 20]}>
      <Col span={4}>
        <div>bar chart</div>
      </Col>
      <Col span={20}>
        timeseries
      </Col>
      <Col span={24}>
        table
      </Col>
    </Row>
  </>
}
export default Incidents
