/* eslint-disable react/jsx-no-comment-textnodes */
import { useState } from 'react'


import { Badge } from 'antd'

import {
  LayoutUI } from '@acx-ui/components'
import { NotificationSolid } from '@acx-ui/icons'
import { AlarmsDrawer }      from '@acx-ui/rc/components'
import {
  useGetAlarmCountQuery }  from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

export default function AlarmsHeaderButton () {
  const params = useParams()
  const { data } = useGetAlarmCountQuery({ params })

  const [visible, setVisible] = useState(false)

  const getCount = function () {
    if (data?.summary?.alarms?.totalCount) {
      const clearedAlarms = data.summary.alarms.summary?.clear || 0
      return data.summary.alarms.totalCount - clearedAlarms
    } else {
      return 0
    }
  }

  return <>
    <Badge
      count={getCount()}
      overflowCount={9}
      offset={[-3, 0]}
      children={<LayoutUI.ButtonSolid icon={<NotificationSolid />}
        onClick={()=>{
          setVisible(true)
        }}/>}
    />
    <AlarmsDrawer visible={visible} setVisible={setVisible} />
  </>
}
