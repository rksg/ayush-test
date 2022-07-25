import { Col, Row } from 'antd'

import { incidentInformation } from '@acx-ui/analytics/utils'
import { PageHeader, Pill }    from '@acx-ui/components'

import { incidentDetailsMap } from '..'
import { IncidentAttributes } from '../IncidentAttributes'

import type { IncidentDetailsProps } from '../types'

export const IncidentDetailsTemplate = (props: IncidentDetailsProps) => <>
  <PageHeader 
    title='Incident Details'
    sideHeader={<Pill value='123' trend='positive' />}
    breadcrumb={[
      { text: 'AI Analytics', link: '/analytics' },
      { text: 'Incidents', link: '/analytics/incidents' },
      { text: 'Incident Details', link: '/' }
    ]}
    subTitle={incidentInformation[props?.code as keyof typeof incidentDetailsMap].shortDescription}
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
