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

import * as UI from './styledComponents'

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
      page: 1,
      total: 0
    }
  })

  const data = getChartData(alarmQuery.data?.data!)

  const onAlarmClick = () => {
    const event = new CustomEvent('showAlarmDrawer',
      { detail: { data: { name: 'all', venueId: params.venueId } } })
    window.dispatchEvent(event)
  }

  return (
    <Loader states={[alarmQuery]}>
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
                      { detail: { data: { ...e.data, venueId: params.venueId } } })
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
