import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { cssStr, Loader, Card, DonutChart, NoActiveData }       from '@acx-ui/components'
import type { DonutChartData }                                  from '@acx-ui/components'
import { useIsSplitOn, Features }                               from '@acx-ui/feature-toggle'
import {  useAlarmSummariesQuery, useDashboardV2OverviewQuery } from '@acx-ui/rc/services'
import {
  Alarm,
  EventSeverityEnum
} from '@acx-ui/rc/utils'
import { useParams }                        from '@acx-ui/react-router-dom'
import { useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import { getAlarmsDonutChartData } from '../AlarmWidget'

import * as UI from './styledComponents'

type ReduceReturnType = Record<string, number>

export const getChartData = (alarms: Alarm[]): DonutChartData[] => {
  const seriesMapping = [
    { key: EventSeverityEnum.CRITICAL,
      name: 'Critical',
      color: cssStr('--acx-semantics-red-50') },
    { key: EventSeverityEnum.MAJOR,
      name: 'Major',
      color: cssStr('--acx-accents-orange-30') }
  ] as Array<{ key: string, name: string, color: string }>
  const chartData: DonutChartData[] = []

  if (alarms && alarms.length > 0) {
    const alarmsSummary = alarms.reduce<ReduceReturnType>((acc, { severity }) => {
      acc[severity] = (acc[severity] || 0) + 1
      return acc
    }, {})

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

export function VenueAlarmWidget () {
  const { venueId } = useParams()
  const { $t } = useIntl()
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  // Alarms list query
  const isNewAlarmQueryEnabled = useIsSplitOn(Features.ALARM_NEW_API_TOGGLE)
  const query = isNewAlarmQueryEnabled ? useAlarmSummariesQuery : useDashboardV2OverviewQuery
  const overviewV2Query = query({
    params: useParams(),
    payload: {
      filters: {
        venueIds: [venueId]
      }
    }
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getAlarmsDonutChartData(data),
      ...rest
    })
  })

  useTrackLoadTime({
    itemName: widgetsMapping.VENUE_ALARM_WIDGET,
    states: [overviewV2Query],
    isEnabled: isMonitoringPageEnabled
  })

  const { data } = overviewV2Query

  const onAlarmClick = () => {
    const event = new CustomEvent('showAlarmDrawer',
      { detail: { data: { name: 'all', venueId } } })
    window.dispatchEvent(event)
  }

  return (
    <Loader states={[overviewV2Query]}>
      <Card title={$t({ defaultMessage: 'Alarms' })}>
        <AutoSizer>
          {({ height, width }) => (
            data && data.length > 0
              ? <UI.Container onClick={onAlarmClick}>
                <DonutChart
                  style={{ width, height }}
                  legend={'name-value'}
                  data={data}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(e: any)=>{
                    e.event.stop()
                    const event = new CustomEvent('showAlarmDrawer',
                      { detail: { data: { ...e.data, venueId } } })
                    window.dispatchEvent(event)
                  }}/>
              </UI.Container>
              : <NoActiveData text={$t({ defaultMessage: 'No active alarms' })} />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
