import { Col, Row } from 'antd'

import * as FormItems from './FormItems'

export function VideoCallQoeDetailsForm ({ link }: { link: string }) {
  return <Row gutter={20}>
    <Col xl={13} xxl={11}>
      <FormItems.TestName.FieldSummary />
      <FormItems.TestLink link={link} />
      <FormItems.Prerequisites/>
      <FormItems.Disclaimer/>
    </Col>
  </Row>
}
