import { Col, Row }                  from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { incidentInformation, severitiesDefinition } from '@acx-ui/analytics/utils'
import { PageHeader, Pill, TrendType }               from '@acx-ui/components'

import { incidentDetailsMap }                  from '..'
import { getImpactedArea, IncidentAttributes } from '../IncidentAttributes'
import * as UI                                 from '../syledComponents'

import type { IncidentDetailsProps, SeveritiesProps } from '../types'

export const severities = new Map(
  Object
    .keys(severitiesDefinition)
    .map(key => [key, severitiesDefinition[key as keyof typeof severitiesDefinition]])
    .sort((a: (string | SeveritiesProps)[], b: (string | SeveritiesProps)[]) => {
      const [, { lte }] = a as SeveritiesProps[]
      const [, { lte: lte2 }] = b as SeveritiesProps[]
      return lte2 - lte
    }) as Iterable<readonly [string, SeveritiesProps]>
) as Map<string, SeveritiesProps>

export function calculateSeverity (severity: number): TrendType | void {
  for (let [p, filter] of severities) {
    if (severity > filter.gt) {
      return p as TrendType
    }
  }
}

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

export const sliceTypePrettyNames = (type: string) => {
  return nodeType[type as keyof typeof nodeType] || type
}

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
  const severityValue = calculateSeverity(props.severity)!

  return (
    <>
      <PageHeader 
        title={$t({ id: 'title', defaultMessage: 'Incident Details' })}
        sideHeader={<Pill value={severityValue} trend={severityValue} />}
        breadcrumb={[
          { text: $t({ defaultMessage: 'AI Analytics' }), link: '/analytics' },
          { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
        ]}
        subTitle={shortDescription(props)}
      />
      <Row>
        <UI.LeftColumn span={4}>
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
