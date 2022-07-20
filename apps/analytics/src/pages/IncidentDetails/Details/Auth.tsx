import { Col, Row } from 'antd'

import { BulbOutlined } from '@acx-ui/icons'

import { IncidentHeader } from '../styledComponents'

import { IncidentAttributes } from '../IncidentAttributes'
import type { IncidentDetailsProps } from '../types'

export const IncidentDetailsTemplate = (props: IncidentDetailsProps) => <>
  <IncidentHeader
    title='Incident Details'
    extra={<BulbOutlined />}
  />
  <Row gutter={[20, 20]}>
    <Col span={4}>
      <IncidentAttributes {...props}/>
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

export default IncidentDetailsTemplate // as Auth
