import { Col, Row } from 'antd'

import { BulbOutlined } from '@acx-ui/icons'

import { IncidentHeader } from '../styledComponents'

function Auth () {
  return <>
    <IncidentHeader
      title='Incident Details'
      extra={<BulbOutlined />}
    />
    <Row gutter={[20, 20]}>
      <Col span={4}>
        <div>incident attribute Auth</div>
      </Col>
      <Col span={20}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <div>Insights</div>
          </Col>
          <Col span={24}>
            <div>network impact</div>
          </Col>
          <Col span={24}>
            <div>time series section</div>
          </Col>
        </Row>
      </Col>
    </Row>
  </>
}
export default Auth
