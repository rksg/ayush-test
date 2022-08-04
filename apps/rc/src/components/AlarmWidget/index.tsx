import AutoSizer from 'react-virtualized-auto-sizer'

import { cssStr, Loader }            from '@acx-ui/components'
import { Card }                      from '@acx-ui/components'
import { DonutChart }                from '@acx-ui/components'
import type { DonutChartData }       from '@acx-ui/components'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import {
  Dashboard,
  AlaramSeverity
} from '@acx-ui/rc/services'
import { Alarm, EventTypeEnum }                  from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { AlarmList } from './AlarmList'
import * as UI       from './styledComponents'

const seriesMapping = [
  { key: AlaramSeverity.CRITICAL,
    name: 'Critical',
    color: cssStr('--acx-semantics-red-50') },
  { key: AlaramSeverity.MAJOR,
    name: 'Major',
    color: cssStr('--acx-accents-orange-30') }
] as Array<{ key: string, name: string, color: string }>

export const getVenuesDonutChartData = (overviewData?: Dashboard): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const alarmsSummary = overviewData?.summary?.alarms?.summary
  if (alarmsSummary) {
    seriesMapping.forEach(({ key, name, color }) => {
      if (alarmsSummary[key]) {
        chartData.push({
          name,
          value: alarmsSummary[key],
          color
        })
      }
    })
  }
  return chartData
}

function AlarmWidget () {
  const basePath = useTenantLink('/')
  const navigate = useNavigate()

  const onNavigate = (alarm: Alarm) => {
    let path = ''
    if (alarm.entityType === EventTypeEnum.AP) {
      path = `aps/${alarm.serialNumber}/TBD`
    } else if (alarm.entityType === EventTypeEnum.SWITCH) {
      path = `switches/${alarm.serialNumber}/TBD`
    }
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${path}`
    })
  }

  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: getVenuesDonutChartData(data),
      ...rest
    })
  })

  const { data } = queryResults
  return (
    <Loader states={[queryResults]}>
      <Card title='Alarms'>
        <AutoSizer>
          {({ height, width }) => (
            data && data.length > 0
              ? <>
                <DonutChart
                  style={{ width, height: height / 3 }}
                  data={data}/>
                <AlarmList
                  width={width - 10}
                  height={height - (height / 3)}
                  onNavigate={onNavigate} />
              </>
              : <UI.NoDataWrapper>
                <UI.TextWrapper><UI.GreenTickIcon /></UI.TextWrapper>
                <UI.TextWrapper>No active alarms</UI.TextWrapper>
              </UI.NoDataWrapper>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default AlarmWidget
