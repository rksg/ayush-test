import { forwardRef } from 'react'

import { Badge, Tooltip } from 'antd'
import { useIntl }        from 'react-intl'

import { LayoutUI }                  from '@acx-ui/components'
import { NotificationSolid }         from '@acx-ui/icons'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'
import { notAvailableMsg }           from '@acx-ui/utils'

const NotificationCounterWithRef = forwardRef<HTMLElement, { count: number }>((props, ref) => {
  return <Badge
    {...props}
    overflowCount={9}
    offset={[-3, 0]}
    children={
      <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
        <LayoutUI.ButtonSolid disabled ref={ref} icon={<NotificationSolid />} />
      </Tooltip>
    }
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

  const AlarmsHeaderButton = () => {
    // TODO: uncomment after content matches mockup
    // return <Popover arrowPointAtCenter
    //   content={<AlarmsTable />}
    //   trigger='click'>
    //   <NotificationCounterWithRef count={getCount()} />
    // </Popover>
    return <NotificationCounterWithRef count={getCount()} />
  }

  return <AlarmsHeaderButton />
}
