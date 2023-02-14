import { PortLabelType, PortTaggedEnum, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Port } from './Port'
import * as UI             from './styledComponents'

interface portStatus {
  portNumber: number
  portnumber: number
  name: string
  portIdentifier: string
  poeEnabled: boolean
  status: string
  portStatus: string
  portSpeed: string
  portTagged: PortTaggedEnum
  taggedVlan: string
  untaggedVlan: string
  usedInFormingStack: boolean
  usedInUplink: boolean
  poeUsed: number
  neighborName: string
  poeType: string
}

export function Slot (props:{
  slot: any, 
  portLabel: string,
  tooltipEnable: boolean,
  isStack: boolean,
  deviceStatus: SwitchStatusEnum
}) {
  const { $t } = useIntl()
  const [ isRearView, setIsRearView ] = useState(false)
  const { slot, deviceStatus, isStack, portLabel } = props

  // useEffect(() => {
  //   if (slot.portStatus !== undefined) {
      
  //   }
  // }, [slot])

  const getPortIcon = (port: portStatus) => {
    if (deviceStatus === SwitchStatusEnum.DISCONNECTED) {
      return '';
    }
    if (port.usedInUplink) {
      return 'UpLink';
    }
    if (isStack && port.usedInFormingStack) {
      return 'Stack';
    }
    if (port.poeUsed) {
      return 'PoeUsed';
    }
    return '';
  }

  return <UI.SlotWrapper>
    <UI.SlotVertical>
    {
      slot.portStatus
      .filter((item: portStatus) => item.portnumber%2 == 1)
      .map((port: portStatus) => (
        <Port key={port.portIdentifier} 
          labelText={portLabel + port.portnumber}
          labelPosition='top' 
        />
      ))
    }
    </UI.SlotVertical>
    <UI.SlotVertical>
    {
      slot.portStatus
      .filter((item: portStatus) => item.portnumber%2 == 0)
      .map((port: portStatus) => (
        <Port key={port.portIdentifier} 
          labelText={portLabel + port.portnumber}
          labelPosition='bottom' 
        />
      ))
    }
    </UI.SlotVertical>
  </UI.SlotWrapper>
}