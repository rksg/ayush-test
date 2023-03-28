import { useState } from 'react'

import {  Divider } from 'antd'
import { isNull }   from 'lodash'

import { AnalyticsFilter }          from '@acx-ui/analytics/utils'
import { GridRow, GridCol, Loader } from '@acx-ui/components'
import { formatter }                from '@acx-ui/formatter'
import { CloseSymbol }              from '@acx-ui/icons'

import { titleConfig, Stages,getFormattedToFunnel, DrilldownSelection } from './config'
import { FunnelChart, valueFormatter }                                  from './funnelChart'
import { useTtcDrilldownQuery, useConnectionDrilldownQuery }            from './services'
import { Title }                                                        from './styledComponents'

const HealthDrillDown = (props: {
  filters: AnalyticsFilter;
  drilldownSelection: DrilldownSelection;
  setDrilldownSelection: CallableFunction;
}) => {
  const { drilldownSelection, setDrilldownSelection,filters } = props
  const payload = {
    path: filters.path,
    start: filters.startDate,
    end: filters.endDate
  }
  const [ selectedStage, setSelectedStage ] = useState<Stages>(null)
  const connectionFailureResults = useConnectionDrilldownQuery(payload, {
    selectFromResult: (result) => {
      const { data, ...rest } = result
      const connectionDrilldown = data?.connectionDrilldown
      const auth = connectionDrilldown?.authSuccessAndAttemptCount?.[0]
      const assoc = connectionDrilldown?.assocSuccessAndAttemptCount?.[0]
      const eap = connectionDrilldown?.eapSuccessAndAttemptCount?.[0]
      const radius = connectionDrilldown?.radiusSuccessAndAttemptCount?.[0]
      const dhcp = connectionDrilldown?.dhcpSuccessAndAttemptCount?.[0]
      return {
        data: {
          authFailure:
            !isNull(auth?.[1]) && !isNull(auth?.[0]) && auth ? auth?.[1] - auth?.[0] : null,
          assoFailure:
            !isNull(assoc?.[1]) && !isNull(assoc?.[0]) && assoc ? assoc?.[1] - assoc?.[0] : null,
          eapFailure: !isNull(eap?.[1]) && !isNull(eap?.[0]) && eap ? eap?.[1] - eap?.[0] : null,
          radiusFailure:
            !isNull(radius?.[1]) && !isNull(radius?.[0]) && radius
              ? radius?.[1] - radius?.[0]
              : null,
          dhcpFailure:
            !isNull(dhcp?.[1]) && !isNull(dhcp?.[0]) && dhcp ? dhcp?.[1] - dhcp?.[0] : null
        },
        ...rest
      }
    },
    skip: !Boolean(drilldownSelection === 'connectionFailure' || drilldownSelection)
  })
  const ttcResults = useTtcDrilldownQuery(payload, {
    selectFromResult: (result) => {
      const { data, ...rest } = result
      const ttcFailureTypes = data?.network?.hierarchyNode?.ttcDrilldown?.ttcByFailureTypes
      const auth = ttcFailureTypes?.ttcByAuth
      const assoc = ttcFailureTypes?.ttcByAssoc
      const eap = ttcFailureTypes?.ttcByEap
      const radius =ttcFailureTypes?.ttcByRadius
      const dhcp = ttcFailureTypes?.ttcByDhcp

      return { data: {
        authFailure: auth?.[0] ?? null,
        assoFailure: assoc?.[0] ?? null,
        eapFailure: eap?.[0] ?? null,
        radiusFailure: radius?.[0] ?? null,
        dhcpFailure: dhcp?.[0] ?? null
      }, ...rest }
    },
    skip: Boolean(drilldownSelection === 'connectionFailure' || drilldownSelection)
  }
  )
  const funnelChartData =
    drilldownSelection === 'connectionFailure' ? connectionFailureResults : ttcResults
  return drilldownSelection ? (
    <Loader states={[connectionFailureResults]}>
      <GridRow style={{ marginTop: 25 }}>
        <GridCol col={{ span: 24 }}>
          <GridRow>
            <GridCol col={{ span: 12 }}>
              <Title>{titleConfig?.[drilldownSelection]}</Title>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ alignItems: 'end' }}>
              <CloseSymbol onClick={() => setDrilldownSelection(null)} />
            </GridCol>
          </GridRow>
          <FunnelChart
            valueLabel='Fail'
            height={140}
            stages={getFormattedToFunnel(drilldownSelection, {
              ...funnelChartData?.data
            })}
            colors={['#194f70', '#176291', '#1b79b5', '#208fd5', '#35b1ff']}
            selectedStage={selectedStage}
            onSelectStage={(stage : Stages) => setSelectedStage(stage)}
            valueFormatter={
              drilldownSelection === 'connectionFailure' ? formatter('countFormat') : valueFormatter
            }
          />
        </GridCol>
        <Divider />
        {selectedStage && (
          <>
            <GridCol col={{ span: 12 }} style={{ height: '210px' }}>
            PIE chart
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '210px' }}>
            Table
            </GridCol>
          </>
        )}
      </GridRow>
    </Loader>
  ) : null
}
export { HealthDrillDown }
