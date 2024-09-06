/* eslint-disable no-console */
import type { Incident }    from '@acx-ui/analytics/utils'
import { GridRow, GridCol } from '@acx-ui/components'

import { FixedAutoSizer }                                   from '../../DescriptionSection/styledComponents'
import { ImpactedSwitchDDoSTable }                          from '../Charts/ImpactedSwitchDDoSTable'
import { IncidentAttributes, Attributes }                   from '../IncidentAttributes'
import { Insights }                                         from '../Insights'
import { NetworkImpact, NetworkImpactProps }                from '../NetworkImpact'
import { NetworkImpactChartTypes, NetworkImpactQueryTypes } from '../NetworkImpact/config'

import { IncidentHeader } from './IncidentHeader'

export const SwitchTcpSynDDoS = (incident: Incident) => {
  const attributeList = [
    Attributes.IncidentCategory,
    Attributes.IncidentSubCategory,
    Attributes.Type,
    Attributes.Scope,
    Attributes.Duration,
    Attributes.EventStartTime,
    Attributes.EventEndTime
  ]

  console.log({ incident })


  const networkImpactCharts: NetworkImpactProps['charts'] = [
    {
      chart: NetworkImpactChartTypes.AirtimeRx,
      query: NetworkImpactQueryTypes.Distribution,
      type: 'airtimeMetric',
      dimension: 'airtimeRx'
    }
  ]

  return <>
    <IncidentHeader incident={incident} />
    <GridRow>
      <GridCol col={{ span: 4 }}>
        <FixedAutoSizer>
          {({ width }) => (<div style={{ width }}>
            <IncidentAttributes incident={incident} visibleFields={attributeList} />
          </div>)}
        </FixedAutoSizer>
      </GridCol>
      <GridCol col={{ span: 20 }}>
        <Insights incident={incident} />
      </GridCol>
      <GridCol col={{ offset: 4, span: 5 }} style={{ minHeight: '129px' }}>
        <NetworkImpact incident={incident} charts={networkImpactCharts} />
      </GridCol>
      <GridCol col={{ span: 15 }} style={{ minHeight: '129px' }}>
        <ImpactedSwitchDDoSTable incident={incident} />
      </GridCol>
      <GridCol col={{ offset: 4, span: 20 }} style={{ minHeight: '326px' }}>
        <h1>Timeseries Chart</h1>
      </GridCol>
    </GridRow>
  </>
}
