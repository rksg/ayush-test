import { mean }    from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { GridCol, GridRow, HistoricalCard, Loader, ProgressBarV2 } from '@acx-ui/components'
import { useNavigateToPath }                                       from '@acx-ui/react-router-dom'
import { hasAccess }                                               from '@acx-ui/user'
import type { AnalyticsFilter }                                    from '@acx-ui/utils'

import { HealthData, useHealthQuery } from './services'

import { calcPercent } from './index'

export function ClientExperience ({
  filters
}: {
      filters: AnalyticsFilter;
    }) {
  const { $t } = useIntl()
  const queryResults = useHealthQuery(filters)
  const { data } = queryResults
  const getHealthData = (healthData:HealthData[])=>{
    const connectionSuccess:number[] = []
    const timeToConnect:number[] = []
    const clientThroughput:number[] = []
    const onlineAps:number[] = []
    const apCapacity:number[] = []
    healthData.forEach((row)=>{
      const {
        connectionSuccessSLA,
        timeToConnectSLA,
        clientThroughputSLA,
        onlineApsSLA,
        apCapacitySLA
      } = row
      const connectionSuccessPercent = calcPercent(connectionSuccessSLA)
      const timeToConnectPercent = calcPercent(timeToConnectSLA)
      const clientThroughputPercent = calcPercent(clientThroughputSLA)
      const onlineApsPercent = calcPercent(onlineApsSLA)
      const apCapacityPercent = calcPercent(apCapacitySLA)
      connectionSuccessPercent.percent !== null &&
        connectionSuccess.push(connectionSuccessPercent.percent)
      timeToConnectPercent.percent !== null &&
        timeToConnect.push(timeToConnectPercent.percent)
      clientThroughputPercent.percent !== null &&
        clientThroughput.push(clientThroughputPercent.percent)
      onlineApsPercent.percent !== null &&
        onlineAps.push(onlineApsPercent.percent)
      apCapacityPercent.percent !== null &&
        apCapacity.push(apCapacityPercent.percent)
    })
    return {
      connectionSuccess: mean(connectionSuccess) * 100,
      timeToConnect: mean(timeToConnect) * 100,
      clientThroughput: mean(clientThroughput) * 100,
      onlineAps: mean(onlineAps) * 100,
      apCapacity: mean(apCapacity) * 100
    }
  }
  const healthData = data && data.health.length ? getHealthData(data.health) : null
  const onArrowClick = useNavigateToPath('/analytics/health/')

  return(<Loader states={[queryResults]}>
    <HistoricalCard title={$t({ defaultMessage: 'Client Experience' })}
      onArrowClick={hasAccess() ? onArrowClick : undefined}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{
            display: 'flex',
            height,
            width,
            flexDirection: 'column',
            justifyContent: 'space-around' }}>
            <GridRow>
              <GridCol col={{ span: 12 }}>
                {$t({ defaultMessage: 'Connection Success' })}
              </GridCol>
              <GridCol col={{ span: 12 }}>
                <ProgressBarV2 percent={healthData?.connectionSuccess || 0 as number}/>
              </GridCol>
            </GridRow>
            <GridRow>
              <GridCol col={{ span: 12 }}>
                {$t({ defaultMessage: 'Time To Connect' })}
              </GridCol>
              <GridCol col={{ span: 12 }}>
                <ProgressBarV2 percent={healthData?.timeToConnect || 0 as number}/>
              </GridCol>
            </GridRow>
            <GridRow>
              <GridCol col={{ span: 12 }}>
                {$t({ defaultMessage: 'Client Throughput' })}
              </GridCol>
              <GridCol col={{ span: 12 }}>
                <ProgressBarV2 percent={healthData?.clientThroughput || 0 as number}/>
              </GridCol>
            </GridRow>
            <GridRow>
              <GridCol col={{ span: 12 }}>
                {$t({ defaultMessage: 'Online APs' })}
              </GridCol>
              <GridCol col={{ span: 12 }}>
                <ProgressBarV2 percent={healthData?.onlineAps || 0 as number}/>
              </GridCol>
            </GridRow>
            <GridRow>
              <GridCol col={{ span: 12 }}>
                {$t({ defaultMessage: 'AP Capacity' })}
              </GridCol>
              <GridCol col={{ span: 12 }}>
                <ProgressBarV2 percent={healthData?.apCapacity || 0 as number}/>
              </GridCol>
            </GridRow>
          </div>)}
      </AutoSizer>
    </HistoricalCard>
  </Loader>)
}
