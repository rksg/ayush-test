import { Col, Row }                  from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import {
  incidentInformation,
  calculateSeverity,
  impactedArea,
  formattedSliceType,
  IncidentDetailsProps
} from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill } from '@acx-ui/components'

import { incidentDetailsMap } from '..'
import { IncidentAttributes } from '../IncidentAttributes'

import * as UI from './styledComponents'

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

  const { $t } = useIntl()
  const shortDescription = (incident: IncidentDetailsProps) => {
    const code = incident.code as keyof typeof incidentDetailsMap
    const { shortDescription } = incidentInformation[code]
    const scope = `${formattedSliceType(incident.sliceType)}:` +
      impactedArea(incident.path, incident.sliceValue)
    return <FormattedMessage
      {...shortDescription}
      values={{ scope }}
    />
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Incident Details' })}
        titleExtra={<SeverityPill severity={calculateSeverity(props.severity)!} />}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
        ]}
        subTitle={shortDescription(props)}
      />
      <Row>
        <Col span={4}>
          <UI.LeftColumn offsetTop={200}>
            <IncidentAttributes {...props} {...info} visibleFields={attributeList}/>
          </UI.LeftColumn>
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
