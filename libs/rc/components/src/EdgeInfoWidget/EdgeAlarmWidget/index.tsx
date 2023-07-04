import React, { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { cssStr, DonutChartData }                                  from '@acx-ui/components'
import { useAlarmsListQuery }                                      from '@acx-ui/rc/services'
import { Alarm, CommonUrlsInfo, EventSeverityEnum, useTableQuery } from '@acx-ui/rc/utils'


import { AlarmsDrawer }                              from '../../AlarmsDrawer'
import { EdgeOverviewDonutWidget, ReduceReturnType } from '../EdgeOverviewDonutWidget'

const alarmListPayload = {
  url: CommonUrlsInfo.getAlarmsList.url,
  fields: [
    'startTime',
    'severity',
    'message',
    'id',
    'serialNumber',
    'entityType',
    'entityId'
  ],
  page: 1,
  pageSize: 10000,
  defaultPageSize: 10000,
  total: 0,
  sortField: 'startTime',
  sortOrder: 'DESC'
}

export const getAlarmChartData = (alarms: Alarm[] | undefined): DonutChartData[] => {
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

interface EdgeAlarmWidgetProps {
  isLoading: boolean
  serialNumber: string | undefined
  onClick?: (type: string) => void
}

export const EdgeAlarmWidget = (props:EdgeAlarmWidgetProps) => {
  const { isLoading, serialNumber } = props
  const { $t } = useIntl()
  const [alarmDrawerVisible, setAlarmDrawerVisible] = React.useState(false)

  const {
    data: alarmList,
    isLoading: isAlarmListLoading,
    setPayload } = useTableQuery({
    useQuery: useAlarmsListQuery,
    defaultPayload: {
      ...alarmListPayload,
      filters: {
        serialNumber: [serialNumber]
      }
    },
    option: { skip: !serialNumber }
  })

  useEffect(() => {
    if (serialNumber)
      setPayload({
        ...alarmListPayload,
        filters: {
          serialNumber: [serialNumber]
        }
      })
  }, [serialNumber])

  const handleDonutClick = () => {
    setAlarmDrawerVisible(true)
  }

  const chartData = getAlarmChartData(alarmList?.data)

  return (<>
    <EdgeOverviewDonutWidget
      title={$t({ defaultMessage: 'Alarms' })}
      data={chartData}
      isLoading={isLoading || isAlarmListLoading}
      emptyMessage={$t({ defaultMessage: 'No active alarms' })}
      onClick={handleDonutClick}
    />
    {alarmDrawerVisible &&
      <AlarmsDrawer
        visible={alarmDrawerVisible}
        setVisible={setAlarmDrawerVisible}
        serialNumber={serialNumber}
      />}
  </>)
}