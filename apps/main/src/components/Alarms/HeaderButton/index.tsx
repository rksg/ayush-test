import { forwardRef } from 'react'

import { Popover } from 'antd'

import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'

import { Button, NotificationIcon } from '../../../pages/Layout/styledComponents'
import { AlarmsTable }              from '../../Alarms/Table'

import {
  NotificationCounter
} from './styledComponents'

const NotificationCounterWithRef = forwardRef<HTMLElement, { count: number }>((props, ref) => {
  return <NotificationCounter
    {...props}
    overflowCount={999}
    offset={[-2, 10]}
    color='black'
    size='small'
    children={<Button type='primary' ref={ref} icon={<NotificationIcon />} />}
  />
})

export function AlarmsHeaderButton () {
  const params = useParams()
  const { data } = useDashboardOverviewQuery({ params })

  const getCount = function () {
    if (data?.summary?.alarms?.totalCount) {
      const clearedAlarms = data.summary.alarms.summary?.clear || 0
      return data.summary.alarms.totalCount - clearedAlarms
    } else {
      return 0
    }
  }

  const content = (
    <AlarmsTable />
  )

  const AlarmsHeaderButton = () => {
    return <Popover arrowPointAtCenter
      content={content}
      trigger='click'>
      <NotificationCounterWithRef count={getCount()} />
    </Popover>
  }

  return <AlarmsHeaderButton />
}
