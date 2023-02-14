import { PortLabelType, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import * as UI             from '../styledComponents'
import { Port } from './Port'

export function Slot (props:{
  slot: any, 
  portLabel: string,
  tooltipEnable: boolean,
  isStack: boolean,
  deviceStatus: SwitchStatusEnum
}) {
  const { $t } = useIntl()
  const [ isRearView, setIsRearView ] = useState(false)
  const { slot } = props

  // useEffect(() => {
  //   if (slot.portStatus !== undefined) {
      
  //   }
  // }, [slot])

  return <div>
   <Port />
  </div>
}