import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { cssStr, Loader , Card, DonutChart, NoActiveData }     from '@acx-ui/components'
import type { DonutChartData }                                 from '@acx-ui/components'
import { useIsSplitOn, Features }                              from '@acx-ui/feature-toggle'
import { useAlarmSummariesQuery, useDashboardV2OverviewQuery } from '@acx-ui/rc/services'
import { AlaramSeverity, Dashboard }                           from '@acx-ui/rc/utils'
import { useParams }                                           from '@acx-ui/react-router-dom'
import { useTrackLoadTime, widgetsMapping }                    from '@acx-ui/utils'
import { useDashboardFilter }                                  from '@acx-ui/utils'

import * as UI from './styledComponents'

export const getAlarmsDonutChartData = (overviewData?: Dashboard): DonutChartData[] => {
  const seriesMapping = [
    { key: AlaramSeverity.CRITICAL,
      name: 'Critical',
      color: cssStr('--acx-semantics-red-50') },
    { key: AlaramSeverity.MAJOR,
      name: 'Major',
      color: cssStr('--acx-accents-orange-30') }
  ] as Array<{ key: string, name: string, color: string }>
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

export function AlarmWidgetV2 () {
  const { $t } = useIntl()
  // Dashboard overview query
  const { venueIds } = useDashboardFilter()
  const isNewAlarmQueryEnabled = useIsSplitOn(Features.ALARM_NEW_API_TOGGLE)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const query = isNewAlarmQueryEnabled ? useAlarmSummariesQuery : useDashboardV2OverviewQuery

  const overviewV2Query = query({
    params: useParams(),
    payload: {
      filters: {
        venueIds
      }
    }
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getAlarmsDonutChartData(data),
      ...rest
    })
  })


  const onArrowClick = () => {
    const event = new CustomEvent('showAlarmDrawer',
      { detail: { data: { name: 'all' } } })
    window.dispatchEvent(event)
  }

  const { data } = overviewV2Query

  useTrackLoadTime({
    itemName: widgetsMapping.ALARMS_WIDGET,
    states: [overviewV2Query],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[overviewV2Query]}>
      <Card title={$t({ defaultMessage: 'Alarms' })}
        onArrowClick={onArrowClick}>
        <AutoSizer>
          {({ height, width }) => (
            (data && data.length > 0)
              ? <UI.Container onClick={onArrowClick}>
                <DonutChart
                  style={{ width, height }}
                  size={'medium'}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(e: any)=>{
                    e?.event?.stop()
                    const customEvent = new CustomEvent('showAlarmDrawer',
                      { detail: { data: e.data } })
                    window.dispatchEvent(customEvent)
                  }}
                  data={data}/>
              </UI.Container>
              : <NoActiveData text={$t({ defaultMessage: 'No active alarms' })}/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
