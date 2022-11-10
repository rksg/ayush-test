
import { Badge, Popover } from 'antd'

import { LayoutUI }                  from '@acx-ui/components'
import { ClockCircleFilled } from '@ant-design/icons';
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'



export default function ActivityHeaderButton () {
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
    <div>content here...</div>
  )

  const ActivityHeaderButton = () => {
    return <Popover arrowPointAtCenter
      content={content}
      trigger='click'>
      <Badge
        count={getCount()}
        overflowCount={9}
        offset={[-3, 0]}
        children={<LayoutUI.ButtonSolid icon={<ClockCircleFilled />} />}
      />
    </Popover>
  }

  return <ActivityHeaderButton />
}
