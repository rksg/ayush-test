import React from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'


import Header               from '../../components/Header'
import NetworkHistoryWidget from '../../components/NetworkHistory'

function Incidents () {
  const { $t } = useIntl()
  return <>
    <Header title={$t({ defaultMessage: 'Incidents' })} />
    <Row gutter={[20, 20]}>
      <Col span={4}>
        <div>bar chart</div>
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
