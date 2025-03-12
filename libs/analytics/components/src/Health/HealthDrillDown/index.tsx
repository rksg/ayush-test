import { useEffect, useState } from 'react'

import { isNull } from 'lodash'
import AutoSizer  from 'react-virtualized-auto-sizer'

import { EventParams, GridCol, GridRow, Loader, cssStr } from '@acx-ui/components'
import { formatter }                                     from '@acx-ui/formatter'
import type { AnalyticsFilter }                          from '@acx-ui/utils'

import {
  Stages,
  getFormattedToFunnel,
  DrilldownSelection,
  CONNECTIONFAILURE,
  TTC
} from './config'
import { FunnelChart }                                       from './funnelChart'
import { HealthPieChart, PieChartData, TabKeyType }          from './healthPieChart'
import { ImpactedClientsTable }                              from './impactedClientTable'
import { useTtcDrilldownQuery, useConnectionDrilldownQuery } from './services'
import { Point, Separator }                                  from './styledComponents'

const HealthDrillDown = (props: {
  filters: AnalyticsFilter;
  drilldownSelection: DrilldownSelection;
}) => {
  const [pieFilter, setPieFilter] = useState<PieChartData | null>(null)
  const [chartKey, setChartKey] = useState<TabKeyType>('wlans')
  const [pieList, setPieList] = useState<PieChartData[]>([])
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null)

  const onPieClick = (e: EventParams) => {
    const selectedData = e.data as PieChartData
    setPieFilter((selectedData?.name === pieFilter?.name) ? null: (e.data as PieChartData))
  }
  const onLegendClick = (data: PieChartData) => {
    setPieFilter((data.name === pieFilter?.name) ? null: data)
  }

  const { drilldownSelection, filters } = props
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
    setPieFilter(null)
    setSelectedSlice(null)
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

  useEffect(() => { setPieFilter(null) }, [selectedStage])

  return drilldownSelection ? (
    <GridRow>
      <GridCol col={{ span: 24 }}>
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
            <Separator><Point $xPos={xPos} /></Separator>
          </GridCol>
          <GridCol col={{ span: 9 }}>
            <AutoSizer>{(size) =>
              <HealthPieChart
                size={size}
                filters={filters}
                queryType={drilldownSelection}
                selectedStage={selectedStage}
                valueFormatter={format}
                pieFilter={pieFilter}
                setPieFilter={setPieFilter}
                chartKey={chartKey}
                setChartKey={setChartKey}
                onPieClick={onPieClick}
                onLegendClick={onLegendClick}
                setPieList={setPieList}
                selectedSlice={selectedSlice}
                setSelectedSlice={setSelectedSlice}
              />
            }</AutoSizer>
          </GridCol>
          <GridCol col={{ span: 15 }}>
            <ImpactedClientsTable
              filters={filters}
              selectedStage={selectedStage}
              drillDownSelection={drilldownSelection}
              pieFilter={pieFilter}
              chartKey={chartKey}
              pieList={pieList}
            />
          </GridCol>
        </>
      )}
    </GridRow>
  ) : null
}
export { HealthDrillDown }
