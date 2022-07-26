import { Col, Row } from 'antd'

import { incidentInformation, severitiesDefinition } from '@acx-ui/analytics/utils'
import { PageHeader, Pill }    from '@acx-ui/components'

import { incidentDetailsMap } from '..'

import { useIntl, FormattedMessage } from 'react-intl'

import type { IncidentDetailsProps } from '../types'

import { getImpactedArea, IncidentAttributes } from '../IncidentAttributes'

// export const severities = new Map(
//   Object
//     .keys(severitiesDefinition)
//     .map(key => [key, severitiesDefinition[key]])
//     .sort(([, { lte }], [, { lte2 }]) => lte - lte2)
// )

export const nodeType = {
  network: 'Network',
  zoneName: 'Zone',
  zone: 'Zone',
  apGroupName: 'AP Group',
  apGroup: 'AP Group',
  apMac: 'Access Point',
  ap: 'Access Point',
  AP: 'Access Point',
  switchGroup: 'Switch Group',
  switch: 'Switch'
}

export const sliceTypePrettyNames = (type: string) => nodeType[type as keyof typeof nodeType] || type

export const IncidentDetailsTemplate = (props: IncidentDetailsProps) => {
  const { $t } = useIntl()
  const shortDescription = (incident: IncidentDetailsProps) => {
    const incidentInfo = incidentInformation[incident.code as keyof typeof incidentDetailsMap]
    /* eslint-disable-next-line max-len */
    const scope = `${sliceTypePrettyNames(incident.sliceType)}: ${getImpactedArea(incident.path, incident.sliceValue)}`
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
          { text: $t({ defaultMessage: 'Incident Details' }), link: `/analytics/incidents/${props.id}` }
        ]}
        subTitle={shortDescription(props)}
      />
      <Row gutter={[20, 20]}>
        <Col span={4}>
          <IncidentAttributes visibleFields={[]} category={''} subCategory={''} shortDescription={''} longDescription={''} incidentType={''} {...props}/>
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
