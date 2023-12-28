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

  const getOffset = function (totalCount: number) {
    if(totalCount >= 1000){
      return -9
    }else if(totalCount >= 100){
      return -6
    }
    return -3
  }

  return <>
    <Badge
      count={getCount()}
      overflowCount={999}
      offset={[getOffset(getCount()), 0]}
      children={<LayoutUI.ButtonSolid
        icon={<NotificationSolid />}
        onClick={()=> setVisible(!visible)}
      />}
    />
    <AlarmsDrawer visible={visible} setVisible={setVisible}/>
  </>
}
