import { useState } from 'react'

import { Badge } from 'antd'

import { AlarmsDrawer }   from '@acx-ui/rc/components'
import {
  useGetAlarmCountQuery }  from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

import { ReactComponent as Logo } from './assets/gptDog.svg'
import * as UI                    from './styledComponents'

export default function RuckusGptButton () {
  const params = useParams()

  const payload = { filters: { } }
  const { data } = useGetAlarmCountQuery({ params, payload })

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
      children={<UI.ButtonSolid
        icon={<Logo />}
        onClick={()=> {
          setVisible(!visible)
          const event = new CustomEvent('showAlarmDrawer',
            { detail: { data: { name: 'all' } } })
          window.dispatchEvent(event)
        }}
      />}
    />
    <AlarmsDrawer visible={visible} setVisible={setVisible}/>
  </>
}

export {
  RuckusGptButton
}
