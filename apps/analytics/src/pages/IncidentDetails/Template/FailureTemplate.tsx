import { Col, Row }                  from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { incidentInformation } from '@acx-ui/analytics/utils'
import { PageHeader, Pill }    from '@acx-ui/components'

import { incidentDetailsMap }                                      from '..'
import { getImpactedArea, IncidentAttributes, formattedSliceType } from '../IncidentAttributes'

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

  return (
    <>
      <PageHeader
        title={$t({ id: 'title', defaultMessage: 'Incident Details' })}
        sideHeader={<Pill value='123' trend='positive' />}
        breadcrumb={[
          { text: $t({ defaultMessage: 'AI Analytics' }), link: '/analytics' },
          { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' },
          { text: $t({ defaultMessage: 'Incident Details' }),
            link: `/analytics/incidents/${props.id}` }
        ]}
        subTitle={shortDescription(props)}
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
  )
}

export default IncidentDetailsTemplate
