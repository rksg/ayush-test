import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { cssStr, Loader , Card, DonutChart, NoActiveData }        from '@acx-ui/components'
import type { DonutChartData }                                    from '@acx-ui/components'
import { useDashboardOverviewQuery, useDashboardV2OverviewQuery } from '@acx-ui/rc/services'
import {  useAlarmsListQuery }                                    from '@acx-ui/rc/services'
import {
  Alarm,
  EventTypeEnum,
  Dashboard,
  AlaramSeverity
} from '@acx-ui/rc/utils'
import { CommonUrlsInfo, useTableQuery }         from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { useDashboardFilter }                    from '@acx-ui/utils'

import { AlarmList } from './AlarmList'

const defaultPayload = {
  url: CommonUrlsInfo.getAlarmsList.url,
  fields: [
    'startTime',
    'severity',
    'message',
    'entity_id',
    'id',
    'serialNumber',
    'entityType',
    'entityId',
    'entity_type',
    'venueName',
    'apName',
    'switchName',
    'sourceType',
    'switchMacAddress'
  ]
}

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

export function AlarmWidget () {
  const basePath = useTenantLink('/devices')
  const navigate = useNavigate()
  const { $t } = useIntl()

  const onNavigate = (alarm: Alarm) => {
    let switchId = alarm.switchMacAddress || alarm.serialNumber
    let path = alarm.entityType === EventTypeEnum.AP
      ? `wifi/${alarm.serialNumber}/details/overview`
      : `switch/${switchId}/${alarm.serialNumber}/details/overview`

    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${path}`
    })
  }

  // Dashboard overview query
  const overviewQuery = useDashboardOverviewQuery({
    params: useParams()
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: getAlarmsDonutChartData(data),
      ...rest
    })
  })

  // Alarms query
  const alarmQuery = useTableQuery({
    useQuery: useAlarmsListQuery,
    defaultPayload,
    sorter: {
      sortField: 'startTime',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 5,
      page: 1,
      total: 0
    }
  })

  const { data } = overviewQuery
  return (
    <Loader states={[overviewQuery, alarmQuery]}>
      <Card title={$t({ defaultMessage: 'Alarms' })}>
        <AutoSizer>
          {({ height, width }) => (
            (data && data.length > 0) && (alarmQuery.data?.data && alarmQuery.data?.data.length>0)
              ? <>
                <DonutChart
                  style={{ width, height: height / 3 }}
                  data={data}/>
                <AlarmList
                  data={alarmQuery.data?.data!}
                  width={width - 10}
                  height={height - (height / 3)}
                  onNavigate={onNavigate} />
              </>
              : <NoActiveData text={$t({ defaultMessage: 'No active alarms' })}/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export function AlarmWidgetV2 () {
  const { $t } = useIntl()

  // Dashboard overview query
  const { venueIds } = useDashboardFilter()

  const overviewV2Query = useDashboardV2OverviewQuery({
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

  const { data } = overviewV2Query
  return (
    <Loader states={[overviewV2Query]}>
      <Card title={$t({ defaultMessage: 'Alarms' })}
        onArrowClick={()=>{
          const event = new CustomEvent('showAlarmDrawer',
            { detail: { data: { name: 'all' } } })
          window.dispatchEvent(event)
        }}>
        <AutoSizer>
          {({ height, width }) => (
            (data && data.length > 0)
              ? <DonutChart
                style={{ width, height }}
                size={'medium'}
                onClick={(e)=>{
                  const event = new CustomEvent('showAlarmDrawer',
                    { detail: { data: e.data } })
                  window.dispatchEvent(event)
                }}
                data={data}/>
              : <NoActiveData text={$t({ defaultMessage: 'No active alarms' })}/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
