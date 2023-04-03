import { useState } from 'react'

import { isNull }  from 'lodash'
import { useIntl } from 'react-intl'

import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { GridRow, GridCol, Loader, cssStr } from '@acx-ui/components'
import { formatter }                        from '@acx-ui/formatter'
import { CloseSymbol }                      from '@acx-ui/icons'

import {
  titleConfig,
  Stages,
  getFormattedToFunnel,
  DrilldownSelection,
  CONNECTIONFAILURE,
  valueFormatter,
  TTC
} from './config'
import { FunnelChart }                                       from './funnelChart'
import { useTtcDrilldownQuery, useConnectionDrilldownQuery } from './services'
import { Point, Separator, Title }                           from './styledComponents'
import { HealthPieChart } from './HealthPieChart'

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
    path: filters.path,
    start: filters.startDate,
    end: filters.endDate
  }
  const [selectedStage, setSelectedStage] = useState<Stages>(null)
  const [xPos, setXpos] = useState<number | undefined>(undefined)
  const setStage = (width: number, stage: Stages) => {
    setSelectedStage(stage)
    setXpos(width - 10)
  }
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
  const funnelChartData =
    drilldownSelection === CONNECTIONFAILURE ? connectionFailureResults : ttcResults
  return drilldownSelection ? (
    <GridRow style={{ marginTop: 25 }}>
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
                setSelectedStage(null)
                setXpos(undefined)
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
            valueFormatter={
              drilldownSelection === CONNECTIONFAILURE ? formatter('countFormat') : valueFormatter
            }
          />
        </Loader>
      </GridCol>
      {selectedStage && (
        <>
          <GridCol col={{ span: 24 }} style={{ height: '5px' }}>
            <Separator><Point $xPos={xPos}/></Separator>
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '210px' }}>
           <HealthPieChart queryType={drilldownSelection} queryFilter={selectedStage}/>
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '210px' }}>
            Table
          </GridCol>
        </>
      )}
    </GridRow>
  ) : null
}
export { HealthDrillDown }
