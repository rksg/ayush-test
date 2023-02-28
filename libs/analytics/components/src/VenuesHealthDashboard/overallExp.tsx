/* eslint-disable max-len */
import { mean }  from 'lodash'
import AutoSizer from 'react-virtualized-auto-sizer'

import { AnalyticsFilter }                         from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Loader, ProgressBarV2 } from '@acx-ui/components'
import { formatter }                               from '@acx-ui/utils'

import { HealthData, useHealthQuery } from './services'

export function OverallExp ({
  filters
}: {
      filters: AnalyticsFilter;
    }) {
  const queryResults = useHealthQuery(filters)
  const { data } = queryResults
  const calcPercent = ([val, sum]:(number | null)[]) => {
    const percent = val !== null && sum ? val / sum : null
    return { percent, formatted: formatter('percentFormatRound')(percent) }
  }
  const calculateClientExp = (slas:(number|null)[]) => {
    const arr = slas.filter(sla => sla !== null)
    return arr.length ? mean(arr) : null
  }
  const getHealthData = (healthData:HealthData[])=>{
    const connectionSuccess:number[] = []
    const timeToConnect:number[] = []
    const clientThroughput:number[] = []
    const onlineAps:number[] = []
    const apCapacity:number[] = []
    const clientExperience:number[] = []
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
      const clientExperiencePercent = calculateClientExp([
        connectionSuccessPercent.percent,
        timeToConnectPercent.percent,
        clientThroughputPercent.percent
      ])
      connectionSuccessPercent.percent !== null &&
       connectionSuccess.push(connectionSuccessPercent.percent)
      timeToConnectPercent.percent !== null &&
       timeToConnect.push(timeToConnectPercent.percent)
      clientThroughputPercent.percent !== null &&
       clientThroughput.push(clientThroughputPercent.percent)
      apCapacityPercent.percent !== null &&
       apCapacity.push(apCapacityPercent.percent)
      onlineApsPercent.percent !== null &&
       onlineAps.push(onlineApsPercent.percent)
      clientExperiencePercent !== null &&
       clientExperience.push(clientExperiencePercent)
    })
    return {
      connectionSuccess: mean(connectionSuccess) * 100,
      timeToConnect: mean(timeToConnect) * 100,
      clientThroughput: mean(clientThroughput) * 100,
      apCapacity: mean(apCapacity) * 100,
      onlineAps: mean(onlineAps) * 100,
      clientExperience: mean(clientExperience) * 100
    }
  }
  const healthData = data && data.health.length ? getHealthData(data.health) : null
  // eslint-disable-next-line no-console
  console.log({
    healthData
  })

  return(<Loader states={[queryResults]}>
    <AutoSizer>
      {({ height, width }) => (
        <div style={{ display: 'block', height, width }}>
          <GridRow>
            <GridCol col={{ span: 12 }}>
                Client Experience
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <ProgressBarV2 percent={healthData?.clientExperience || 0 as number}/>
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol col={{ span: 12 }}>
                Connection Success
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <ProgressBarV2 percent={healthData?.connectionSuccess || 0 as number}/>
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol col={{ span: 12 }}>
                Time To Connect
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <ProgressBarV2 percent={healthData?.timeToConnect || 0 as number}/>
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol col={{ span: 12 }}>
                Client Throughput
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <ProgressBarV2 percent={healthData?.clientThroughput || 0 as number}/>
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol col={{ span: 12 }}>
                Online APs
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <ProgressBarV2 percent={healthData?.onlineAps || 0 as number}/>
            </GridCol>
          </GridRow>
          <GridRow>
            <GridCol col={{ span: 12 }}>
                AP Capacity
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <ProgressBarV2 percent={healthData?.apCapacity || 0 as number}/>
            </GridCol>
          </GridRow>
        </div>)}
    </AutoSizer>
  </Loader>)
}