import { useState } from 'react'

import { isNull }  from 'lodash'
import { useIntl } from 'react-intl'

import { GridRow, GridCol, Loader, cssStr } from '@acx-ui/components'
import { formatter }                        from '@acx-ui/formatter'
import { CloseSymbol }                      from '@acx-ui/icons'
import type { AnalyticsFilter }             from '@acx-ui/utils'

import {
  titleConfig,
  Stages,
  getFormattedToFunnel,
  DrilldownSelection,
  CONNECTIONFAILURE,
  TTC

} from './config'
import { FunnelChart }                                       from './funnelChart'
import { HealthPieChart }                                    from './healthPieChart'
import { ImpactedClientsTable }                              from './impactedClientTable'
import { useTtcDrilldownQuery, useConnectionDrilldownQuery } from './services'
import { Point, Separator, Title, DrillDownRow }             from './styledComponents'

const HealthDrillDown = (props: {
  filters: AnalyticsFilter;
  drilldownSelection: DrilldownSelection;
  setDrilldownSelection: CallableFunction;
}) => {
  const { drilldownSelection, setDrilldownSelection, filters } = props
  const { $t } = useIntl()
  const colors = [
    cssStr('--acx-accents-blue-80'),
    cssStr('--acx-accents-blue-70'),
    cssStr('--acx-accents-blue-60'),
    cssStr('--acx-accents-blue-55'),
    cssStr('--acx-accents-blue-50')
  ]
  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate
  }
  const [selectedStage, setSelectedStage] = useState<Stages | null>(null)
  const [xPos, setXpos] = useState<number | null>(null)
  const setStage = (width: number, stage: Stages) => {
    setSelectedStage(stage)
    setXpos(width - 10)
  }
  const connectionFailureResults = useConnectionDrilldownQuery(payload, {
    selectFromResult: (result) => {
      const { data, ...rest } = result
      const connectionDrilldown = data?.network?.connectionDrilldown
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
    skip: !Boolean(drilldownSelection === CONNECTIONFAILURE)
  })
  const ttcResults = useTtcDrilldownQuery(payload, {
    selectFromResult: (result) => {
      const { data, ...rest } = result
      const ttcFailureTypes = data?.network?.hierarchyNode?.ttcDrilldown?.ttcByFailureTypes
      const auth = ttcFailureTypes?.ttcByAuth
      const assoc = ttcFailureTypes?.ttcByAssoc
      const eap = ttcFailureTypes?.ttcByEap
      const radius = ttcFailureTypes?.ttcByRadius
      const dhcp = ttcFailureTypes?.ttcByDhcp

      return {
        data: {
          authFailure: auth?.[0] ?? null,
          assoFailure: assoc?.[0] ?? null,
          eapFailure: eap?.[0] ?? null,
          radiusFailure: radius?.[0] ?? null,
          dhcpFailure: dhcp?.[0] ?? null
        },
        ...rest
      }
    },
    skip: !Boolean(drilldownSelection === TTC)
  })
  const isConnectionFailure = drilldownSelection === CONNECTIONFAILURE
  const funnelChartData = isConnectionFailure ? connectionFailureResults : ttcResults
  const format = formatter(isConnectionFailure ? 'countFormat' : 'durationFormat')
  const height = '355px'
  return drilldownSelection ? (
    <DrillDownRow>
      <GridCol col={{ span: 24 }}>
        <GridRow>
          <GridCol col={{ span: 12 }}>
            <Title>{$t(titleConfig?.[drilldownSelection])}</Title>
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ alignItems: 'end' }}>
            <CloseSymbol
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setDrilldownSelection(null)
              }}
            />
          </GridCol>
        </GridRow>
        <Loader states={[funnelChartData]}>
          <FunnelChart
            valueLabel='Fail'
            height={140}
            stages={getFormattedToFunnel(drilldownSelection, {
              ...funnelChartData?.data
            })}
            colors={colors}
            selectedStage={selectedStage}
            onSelectStage={setStage}
            valueFormatter={format}
          />
        </Loader>
      </GridCol>
      {selectedStage && (
        <>
          <GridCol col={{ span: 24 }} style={{ height: '15px' }}>
            <Separator><Point $xPos={xPos}/></Separator>
          </GridCol>
          <GridCol col={{ span: 8 }} style={{ height }}>
            <HealthPieChart
              filters={filters}
              queryType={drilldownSelection}
              selectedStage={selectedStage}
              valueFormatter={format}
            />
          </GridCol>
          <GridCol col={{ span: 16 }} style={{ height, overflow: 'auto' }}>
            <ImpactedClientsTable filters={filters}
              selectedStage={selectedStage}
              drillDownSelection={drilldownSelection}
            />
          </GridCol>
        </>
      )}
    </DrillDownRow>
  ) : null
}
export { HealthDrillDown }
