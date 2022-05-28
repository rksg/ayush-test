import { useEffect } from 'react'

import { Popover } from 'antd'

import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'

import { AlarmsTable } from '../../Alarms/Table'

import {
  Button,
  NotificationIcon,
  NotificationCounter
} from './styledComponents'

export function AlarmsHeaderButton () {
  const params = useParams()
  const { data, refetch } = useDashboardOverviewQuery({ params })
  useEffect(refetch, [data, refetch])

  const getCount = function () {
    if (data?.summary?.alarms?.totalCount) {
      return data.summary.alarms.totalCount
    } else {
      return 0
    }
  }

  const content = (
    <AlarmsTable></AlarmsTable>
  )

  const AlarmsHeaderButton = () => {
    return <Popover arrowPointAtCenter
      content={content}
      trigger='click'>
      <NotificationCounter
        count={getCount()}
        overflowCount={999}
        offset={[-2, 10]}
        color='black'
        size='small'
        children={<Button type='primary' icon={<NotificationIcon />} />}
      />
    </Popover>
  }

  return <AlarmsHeaderButton />
}
