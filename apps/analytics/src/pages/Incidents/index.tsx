import React from 'react'

import { Col, Row } from 'antd'

import { Button, PageHeader } from '@acx-ui/components'

function Incidents () {
  return <>
    <PageHeader
      title='Incidents'
      extra={[
        <Button key='hierarchy-filter'>network filter</Button>,
        <Button key='date-filter'>date filter</Button>
      ]}
    />
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
