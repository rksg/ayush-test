import { SwitchStatusEnum } from '@acx-ui/rc/utils'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import * as UI             from './styledComponents'

export function FrontView (props:{
  switchUnit: number, 
  switchId: string,
  serialNumber: string,
  switchMac: string,
  isRearView: boolean,
  isOnline: boolean,
  maxSlotsCount: number,
  rearSlots: any[],
  model: string,
  isStack: boolean,
  deviceStatus: SwitchStatusEnum
}) {
  const { $t } = useIntl()
  const [ isRearView, setIsRearView ] = useState(false)
  const { isStack } = props

  return <div>
   Front
  </div>
}