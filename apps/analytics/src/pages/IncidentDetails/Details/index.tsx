import { Col, Row } from 'antd'

import { IncidentAttributes } from '../IncidentAttributes'

import { PageHeader } from '@acx-ui/components'

import type { IncidentDetailsProps } from '../types'

export const IncidentDetailsTemplate = (props: IncidentDetailsProps) => <>
  <PageHeader 
    title='Incident Details'
    sideHeader={<div>pill</div>}
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

export default IncidentDetailsTemplate
