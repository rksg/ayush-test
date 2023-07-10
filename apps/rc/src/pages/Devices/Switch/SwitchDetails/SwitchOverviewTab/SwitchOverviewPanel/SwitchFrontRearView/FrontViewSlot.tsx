import { useIsSplitOn, Features }                         from '@acx-ui/feature-toggle'
import { isLAGMemberPort }                                from '@acx-ui/rc/components'
import { SwitchPortStatus, SwitchSlot, SwitchStatusEnum } from '@acx-ui/rc/utils'

import { FrontViewBreakoutPort } from './FrontViewBreakoutPort'
import { FrontViewPort }         from './FrontViewPort'
import * as UI                   from './styledComponents'

export function FrontViewSlot (props:{
  slot: SwitchSlot,
  portLabel: string,
  isOnline: boolean,
  isStack: boolean,
  deviceStatus: SwitchStatusEnum
}) {
  const { slot, deviceStatus, isStack, portLabel, isOnline } = props
  const enableBreakourtPortFlag = useIsSplitOn(Features.SWITCH_BREAKOUT_PORT)

  const getPortIcon = (port: SwitchPortStatus) => {
    if (deviceStatus === SwitchStatusEnum.DISCONNECTED) {
      return ''
    }
    if (port.usedInUplink) {
      return 'UpLink'
    }
    if (isStack && port.usedInFormingStack) {
      return 'Stack'
    }
    if (port.poeUsed) {
      return 'PoeUsed'
    }
    if(isLAGMemberPort(port)) {
      return 'LagMember'
    }
    return ''
  }

  const getPortColor = (port: SwitchPortStatus) => {
    const { status } = port
    if (deviceStatus === SwitchStatusEnum.DISCONNECTED) {
      return 'lightgray'
    }

    if (status === 'Up') {
      return 'green'
    } else if (status === 'Down') {
      return 'gray'
    } else if (status === 'Offline') {
      return 'lightgray'
    }
    return 'gray'
  }

  return <UI.SlotWrapper>
    <UI.SlotVertical>
      {
        slot.portStatus
          .filter((item: SwitchPortStatus) => {
            const portNumber = item.portnumber as unknown as number
            if (enableBreakourtPortFlag &&
              String(portNumber).includes(':') && String(portNumber).split(':')[1] === '1') {
              return Number(String(portNumber).split(':')[0]) % 2 === 1
            }

            return portNumber % 2 === 1
          })
          .map((port: SwitchPortStatus) => {
            const isBreakOutPort = enableBreakourtPortFlag && String(port.portnumber).includes(':')
            if (isBreakOutPort) {
              return (<FrontViewBreakoutPort key={port.portIdentifier}
                ports={slot.portStatus}
                deviceStatus={deviceStatus}
                labelText={portLabel + String(port.portnumber).split(':')[0]}
                labelPosition='top'
                tooltipEnable={isOnline}
                portData={port}
              />)
            } else {
              return (
                <FrontViewPort key={port.portIdentifier}
                  labelText={portLabel + String(port.portnumber)}
                  labelPosition='top'
                  portColor={getPortColor(port)}
                  portIcon={getPortIcon(port)}
                  tooltipEnable={isOnline}
                  portData={port}
                />
              )
            }
          })
      }
    </UI.SlotVertical>
    <UI.SlotVertical>
      {
        slot.portStatus
          .filter((item: SwitchPortStatus) => {
            const portNumber = item.portnumber as unknown as number
            if (enableBreakourtPortFlag &&
              String(portNumber).includes(':') && String(portNumber).split(':')[1] === '1') {
              return Number(String(portNumber).split(':')[0]) % 2 === 0
            }
            return portNumber % 2 === 0
          })
          .map((port: SwitchPortStatus) => {
            const isBreakOutPort = enableBreakourtPortFlag && String(port.portnumber).includes(':')
            if (isBreakOutPort) {
              return (
                <FrontViewBreakoutPort key={port.portIdentifier}
                  ports={slot.portStatus}
                  deviceStatus={deviceStatus}
                  labelText={portLabel + String(port.portnumber).split(':')[0]}
                  labelPosition='bottom'
                  tooltipEnable={isOnline}
                  portData={port}
                />
              )
            } else {
              return (
                <FrontViewPort key={port.portIdentifier}
                  labelText={portLabel + port.portnumber}
                  labelPosition='bottom'
                  portColor={getPortColor(port)}
                  portIcon={getPortIcon(port)}
                  tooltipEnable={isOnline}
                  portData={port}
                />
              )
            }
          })
      }
    </UI.SlotVertical>
  </UI.SlotWrapper>
}
