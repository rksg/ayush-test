import { forwardRef } from 'react'

import { Badge, Popover } from 'antd'

import { LayoutUI }                  from '@acx-ui/components'
import { NotificationSolid }         from '@acx-ui/icons'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'

import { AlarmsTable } from '../../Alarms/Table'

const NotificationCounterWithRef = forwardRef<HTMLElement, { count: number }>((props, ref) => {
  return <Badge
    {...props}
    overflowCount={9}
    offset={[-3, 0]}
    children={<LayoutUI.ButtonSolid ref={ref} icon={<NotificationSolid />} />}
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
