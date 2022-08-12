import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import {
  calculateSeverity,
  Incident,
  useShortDescription
} from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill } from '@acx-ui/components'

import { IncidentAttributes } from '../IncidentAttributes'

export const IncidentDetailsTemplate = (props: Incident) => {
  const { $t } = useIntl()
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

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Incident Details' })}
        titleExtra={<SeverityPill severity={calculateSeverity(props.severity)!} />}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
        ]}
        subTitle={<p>{useShortDescription(props)}</p>}
      />
      <Row gutter={[20, 20]}>
        <Col span={4}>
          <IncidentAttributes {...props} visibleFields={attributeList} />
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
  )
}

export default IncidentDetailsTemplate
