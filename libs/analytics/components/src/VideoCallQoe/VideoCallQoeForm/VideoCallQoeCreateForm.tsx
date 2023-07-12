import { Col, Row } from 'antd'

import * as FormItems from './FormItems'

export function VideoCallQoeCreateForm () {

  return <Row gutter={20}>
    <Col span={10} xl={8} xxl={6}>
      <FormItems.TestName />
    </Col>
  </Row>
}
