import { Col, Row }                  from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { incidentInformation, calculateSeverity } from '@acx-ui/analytics/utils'
import { PageHeader, Pill }                       from '@acx-ui/components'

import { incidentDetailsMap }                                      from '..'
import { getImpactedArea, IncidentAttributes, formattedSliceType } from '../IncidentAttributes'
import * as UI                                                     from '../syledComponents'

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

  const { $t } = useIntl()
  const shortDescription = (incident: IncidentDetailsProps) => {
    const incidentInfo = incidentInformation[incident.code as keyof typeof incidentDetailsMap]
    /* eslint-disable-next-line max-len */
    const scope = `${formattedSliceType(incident.sliceType)}: ${getImpactedArea(incident.path, incident.sliceValue)}`
    const { shortDescription } = incidentInfo
    const messageProps = {
      id: incident.id,
      defaultMessage: shortDescription,
      values: { scope }
    }
    return <FormattedMessage {...messageProps}/>
  }
  const severityValue = calculateSeverity(props.severity)!

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Incident Details' })}
        sideHeader={<Pill value={severityValue} trend={severityValue} />}
        breadcrumb={[
          { text: $t({ defaultMessage: 'AI Analytics' }), link: '/analytics' },
          { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
        ]}
        subTitle={shortDescription(props)}
      />
      <Row>
        <UI.LeftColumn span={4}>
          <IncidentAttributes {...props} {...info} visibleFields={attributeList}/>
        </UI.LeftColumn>
        <UI.RightColumn span={20}>
          <Row>
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
        </UI.RightColumn>
      </Row>
    </>
  )
}

export default IncidentDetailsTemplate
