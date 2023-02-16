import { SwitchPortStatus, SwitchSlot, SwitchStatusEnum } from '@acx-ui/rc/utils'
import _ from 'lodash'
import { Port } from './Port'
import * as UI             from './styledComponents'

export function Slot (props:{
  slot: SwitchSlot, 
  portLabel: string,
  isOnline: boolean,
  isStack: boolean,
  deviceStatus: SwitchStatusEnum
}) {
  const { slot, deviceStatus, isStack, portLabel, isOnline } = props

  const getPortIcon = (port: SwitchPortStatus) => {
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

  const getPortColor = (port: SwitchPortStatus) => {
    const { status } = port
    if (deviceStatus === SwitchStatusEnum.DISCONNECTED) { 
      return 'lightgray';
    }

    if (status === 'Up') {
      return 'green';
    } else if (status === 'Down') {
      return 'gray';
    } else if (status === 'Offline') {
      return 'lightgray';
    } 
    return 'gray';
  }

  return <UI.SlotWrapper>
    <UI.SlotVertical>
    {
      slot.portStatus
      .filter((item: SwitchPortStatus) => item.portnumber%2 == 1)
      .map((port: SwitchPortStatus) => (
        <Port key={port.portIdentifier} 
          labelText={portLabel + port.portnumber}
          labelPosition='top' 
          portColor={getPortColor(port)}
          portIcon={getPortIcon(port)}
          tooltipEnable={isOnline}
          portData={port}
        />
      ))
    }
    </UI.SlotVertical>
    <UI.SlotVertical>
    {
      slot.portStatus
      .filter((item: SwitchPortStatus) => item.portnumber%2 == 0)
      .map((port: SwitchPortStatus) => (
        <Port key={port.portIdentifier} 
          labelText={portLabel + port.portnumber}
          labelPosition='bottom' 
          portColor={getPortColor(port)}
          portIcon={getPortIcon(port)}
          tooltipEnable={isOnline}
          portData={port}
        />
      ))
    }
    </UI.SlotVertical>
  </UI.SlotWrapper>
}