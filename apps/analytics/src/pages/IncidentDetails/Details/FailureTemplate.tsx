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
      <Row gutter={[20, 20]}>
        <Col span={4}>
          <UI.FixedAutoSizer>
            {({ width }) => (
              <div style={{ width }}>incident attributes</div>
            )}
          </UI.FixedAutoSizer>
        </Col>
        <Col span={20}>
          <div>insights</div>
        </Col>
        <Col offset={4} span={20}>
          <div>network impact</div>
        </Col>
        <Col offset={4} span={20}>
          <div>charts</div>
        </Col>
      </Row>
    </>
  )
}

export default IncidentDetailsTemplate
