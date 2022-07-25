import { Col, Row } from 'antd'

import { incidentInformation } from '@acx-ui/analytics/utils'
import { PageHeader, Pill }    from '@acx-ui/components'

import { IncidentAttributes } from '../IncidentAttributes'

import type { IncidentDetailsProps } from '../types'

export const IncidentDetailsTemplate = (props: IncidentDetailsProps) => {
  const info = incidentInformation[props.code as keyof typeof incidentInformation]
  const attributeList = [
    'clientImpactCount',
    'incidentCategory',
    'incidentSubCategory',
    'type',
    'scope',
    'duration',
    'eventStartTime',
    'eventEndTime'
  ]

  return <>
    <PageHeader
      title='Incident Details'
      sideHeader={<Pill value='123' trend='positive' />}
    />
    <Row gutter={[20, 20]}>
      <Col span={4}>
        <IncidentAttributes {...props} {...info} visibleFields={attributeList}/>
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

export default IncidentDetailsTemplate
