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

import * as UI from './styledComponents'

export const IncidentDetailsTemplate = (props: IncidentDetailsProps) => {
  const { $t } = useIntl()
  const shortDescription = (incident: IncidentDetailsProps) => {
    const incidentInfo = incidentInformation[incident.code as keyof typeof incidentDetailsMap]
    const scope = `${formattedSliceType(incident.sliceType)}:` +
      impactedArea(incident.path, incident.sliceValue)
    const { shortDescription } = incidentInfo
    const messageProps = {
      id: incident.id,
      defaultMessage: shortDescription,
      values: { scope }
    }
    return <FormattedMessage {...messageProps}/>
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
            <div>incident attributes</div>
          </UI.LeftColumn>
        </Col>
        <Col span={20}>
          <Row gutter={[20, 20]}>
            <Col span={24}>
              <div>insights</div>
            </Col>
            <Col span={24}>
              <div>network impact</div>
            </Col>
            <Col span={24}>
              <div>charts</div>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}

export default IncidentDetailsTemplate
