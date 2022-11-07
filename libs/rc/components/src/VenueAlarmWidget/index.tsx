import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { cssStr, Loader, Card, DonutChart, NoActiveData } from '@acx-ui/components'
import type { DonutChartData }                            from '@acx-ui/components'
import {  useAlarmsListQuery }                            from '@acx-ui/rc/services'
import {
  Alarm,
  EventSeverityEnum
} from '@acx-ui/rc/utils'
import { CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'

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

const seriesMapping = [
  { key: EventSeverityEnum.CRITICAL,
    name: 'Critical',
    color: cssStr('--acx-semantics-red-50') },
  { key: EventSeverityEnum.MAJOR,
    name: 'Major',
    color: cssStr('--acx-accents-orange-30') }
] as Array<{ key: string, name: string, color: string }>

type ReduceReturnType = Record<string, number>

export const getChartData = (alarms: Alarm[]): DonutChartData[] => {
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
  const params = useParams()
  const { $t } = useIntl()

  // Alarms list query
  const alarmQuery = useTableQuery({
    useQuery: useAlarmsListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        venueId: [params.venueId]
      }
    },
    sorter: {
      sortField: 'startTime',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 25,
      current: 1,
      total: 0
    }
  })

  const data = getChartData(alarmQuery.data?.data!)
  return (
    <Loader states={[alarmQuery]}>
      <Card title={$t({ defaultMessage: 'Alarms' })}>
        <AutoSizer>
          {({ height, width }) => (
            data && data.length > 0
              ? <DonutChart
                style={{ width, height }}
                legend={'name-value'}
                data={data}/>
              : <NoActiveData text={$t({ defaultMessage: 'No active alarms' })} />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
