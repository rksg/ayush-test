import { mean }    from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter }                                         from '@acx-ui/analytics/utils'
import { GridCol, GridRow, HistoricalCard, Loader, ProgressBarV2 } from '@acx-ui/components'
import { useNavigateToPath }                                       from '@acx-ui/react-router-dom'

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
    healthData.forEach((row)=>{
      const {
        connectionSuccessSLA,
        timeToConnectSLA,
        clientThroughputSLA,
        onlineApsSLA
      } = row
      const connectionSuccessPercent = calcPercent(connectionSuccessSLA)
      const timeToConnectPercent = calcPercent(timeToConnectSLA)
      const clientThroughputPercent = calcPercent(clientThroughputSLA)
      const onlineApsPercent = calcPercent(onlineApsSLA)
      connectionSuccessPercent.percent !== null &&
       connectionSuccess.push(connectionSuccessPercent.percent)
      timeToConnectPercent.percent !== null &&
       timeToConnect.push(timeToConnectPercent.percent)
      clientThroughputPercent.percent !== null &&
       clientThroughput.push(clientThroughputPercent.percent)
      onlineApsPercent.percent !== null &&
       onlineAps.push(onlineApsPercent.percent)
    })
    return {
      connectionSuccess: mean(connectionSuccess) * 100,
      timeToConnect: mean(timeToConnect) * 100,
      clientThroughput: mean(clientThroughput) * 100,
      onlineAps: mean(onlineAps) * 100
    }
  }
  const healthData = data && data.health.length ? getHealthData(data.health) : null
  const onArrowClick = useNavigateToPath('/analytics/health/')

  return(<Loader states={[queryResults]}>
    <HistoricalCard title={$t({ defaultMessage: 'Client Experience' })}
      onArrowClick={onArrowClick}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ display: 'block', height, width }}>
            <GridRow style={{ marginBottom: '15px', marginTop: '10px' }}>
              <GridCol col={{ span: 12 }}>
                {$t({ defaultMessage: 'Connection Success' })}
              </GridCol>
              <GridCol col={{ span: 12 }}>
                <ProgressBarV2 percent={healthData?.connectionSuccess || 0 as number}/>
              </GridCol>
            </GridRow>
            <GridRow style={{ marginBottom: '15px' }}>
              <GridCol col={{ span: 12 }}>
                {$t({ defaultMessage: 'Time To Connect' })}
              </GridCol>
              <GridCol col={{ span: 12 }}>
                <ProgressBarV2 percent={healthData?.timeToConnect || 0 as number}/>
              </GridCol>
            </GridRow>
            <GridRow style={{ marginBottom: '15px' }}>
              <GridCol col={{ span: 12 }}>
                {$t({ defaultMessage: 'Client Throughput' })}
              </GridCol>
              <GridCol col={{ span: 12 }}>
                <ProgressBarV2 percent={healthData?.clientThroughput || 0 as number}/>
              </GridCol>
            </GridRow>
            <GridRow style={{ marginBottom: '15px' }}>
              <GridCol col={{ span: 12 }}>
                {$t({ defaultMessage: 'Online APs' })}
              </GridCol>
              <GridCol col={{ span: 12 }}>
                <ProgressBarV2 percent={healthData?.onlineAps || 0 as number}/>
              </GridCol>
            </GridRow>
          </div>)}
      </AutoSizer>
    </HistoricalCard>
  </Loader>)
}