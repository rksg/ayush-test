import { Col, Row }                  from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { incidentInformation, calculateSeverity } from '@acx-ui/analytics/utils'
import { PageHeader, Pill }                       from '@acx-ui/components'

import { incidentDetailsMap }                                      from '..'
import { getImpactedArea, IncidentAttributes, formattedSliceType } from '../IncidentAttributes'
import * as UI                                                     from '../styledComponents'
import TimeSeries from '../TimeSeries'

import type { IncidentDetailsProps } from '../types'

export const IncidentDetailsTemplate = (props: IncidentDetailsProps) => {
  const { $t } = useIntl()
  const shortDescription = (incident: IncidentDetailsProps) => {
    const incidentInfo = incidentInformation[incident.code as keyof typeof incidentDetailsMap]
    const scope = `${formattedSliceType(incident.sliceType)}: 
      ${getImpactedArea(incident.path, incident.sliceValue)}`
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
          { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
        ]}
        subTitle={shortDescription(props)}
      />
      <Row>
        <Col span={4}>
          <UI.LeftColumn offsetTop={200}>
            <IncidentAttributes
              visibleFields={[]}
              category={''}
              subCategory={''}
              shortDescription={''}
              longDescription={''}
              incidentType={''}
              {...props}
            />
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
              <TimeSeries {...props} type={'clients'}/>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}

export default IncidentDetailsTemplate
