import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { cssStr, Loader , Card, DonutChart, NoActiveData } from '@acx-ui/components'
import type { DonutChartData }                             from '@acx-ui/components'
import { useDashboardOverviewQuery }                       from '@acx-ui/rc/services'
import {  useAlarmsListQuery }                             from '@acx-ui/rc/services'
import {
  Alarm,
  EventTypeEnum,
  Dashboard,
  AlaramSeverity
} from '@acx-ui/rc/utils'
import { CommonUrlsInfo, useTableQuery }         from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

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

AlarmWidget.defaultProps = {
  showList: true
}

export function AlarmWidget (props:{ showList?: boolean }) {
  const basePath = useTenantLink('/devices')
  const navigate = useNavigate()
  const { $t } = useIntl()
  const { showList } = props

  const onNavigate = (alarm: Alarm) => {
    let path = alarm.entityType === EventTypeEnum.AP
      ? `wifi/${alarm.serialNumber}/details/overview`
      : `switch/${alarm.switchMacAddress}/${alarm.serialNumber}/details/overview`

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
                  style={{ width, height: showList ? height / 3 : height }}
                  data={data}/>
                { showList &&
                  <AlarmList
                    data={alarmQuery.data?.data!}
                    width={width - 10}
                    height={height - (height / 3)}
                    onNavigate={onNavigate} />
                }
              </>
              : <NoActiveData text={$t({ defaultMessage: 'No active alarms' })}/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
