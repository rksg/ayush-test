import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Tooltip }                            from '@acx-ui/components'
import { SwitchPortStatus, SwitchStatusEnum } from '@acx-ui/rc/utils'

import { FrontViewBreakoutPortDrawer } from './FrontViewBreakoutPortDrawer'
import * as UI                         from './styledComponents'

export function FrontViewBreakoutPort (props:{
  ports: SwitchPortStatus[],
  portData: SwitchPortStatus,
  labelText: string,
  deviceStatus: SwitchStatusEnum,
  labelPosition: 'top' | 'bottom',
  tooltipEnable: boolean
}) {
  const { $t } = useIntl()
  const { ports, portData, labelText, labelPosition, tooltipEnable, deviceStatus } = props
  const [drawerVisible, setDrawerVisible] = useState(false)
  const portNumber = portData.portIdentifier.split(':')[0]
  const breakOutPorts = ports.filter(p => p.portIdentifier.includes(portNumber))

  const getPortIcon = (port: SwitchPortStatus) => {
    if (port.usedInUplink) {
      return <UI.UplinkPortIcon style={{ filter: 'brightness(0) invert(1)' }} />
    }
    if (port.poeUsed) {
      return <UI.PoeUsageIcon style={{ filter: 'brightness(0) invert(1)' }} />
    }
    return ''
  }

  const getTooltip = () => {
    return <UI.BreakoutPortTooltipContainer>
      <UI.BreakoutPortTooltipHeader>
        {portNumber}: {$t({ defaultMessage: 'Breakout Port' })} ({breakOutPorts.length})
      </UI.BreakoutPortTooltipHeader>
      {breakOutPorts.map((p: SwitchPortStatus) => {
        return <UI.BreakoutPortTooltipItem
          key={p.portIdentifier}>
          <div>{`${p.portIdentifier} (${p.status})`}</div>
          <div>{getPortIcon(p)}</div>
        </UI.BreakoutPortTooltipItem>
      })}
    </UI.BreakoutPortTooltipContainer>
  }

  const getPortColorEnum = () => {

    if (deviceStatus === SwitchStatusEnum.DISCONNECTED) {
      return 'lightgray'
    }

    if (breakOutPorts.filter(p=> p.status === 'Up').length > 0) {
      return 'green'
    } else if ((breakOutPorts.filter(p=> p.status === 'Down').length > 0)) {
      return 'gray'
    } else if ((breakOutPorts.filter(p=> p.status === 'Offline').length > 0)) {
      return 'lightgray'
    }
    return 'gray'
  }

  const portElement = <UI.PortWrapper>
    { labelPosition === 'top' && <UI.PortLabel>{labelText}</UI.PortLabel> }
    <div>

      <UI.Port portColor={getPortColorEnum()}>
        <UI.BreadkoutPortContainer
          data-testid='BreakoutPort'
          onClick={() => {
            setDrawerVisible(true)
          }}>
          <UI.BreakoutPortIcon />
          <UI.BreakOutPortFlag
            portColor={getPortColorEnum()}
          ></UI.BreakOutPortFlag>
        </UI.BreadkoutPortContainer>
      </UI.Port>

    </div>
    {labelPosition === 'bottom' && <UI.PortLabel>{labelText}</UI.PortLabel>}
  </UI.PortWrapper>

  return tooltipEnable
    ? <>
      <FrontViewBreakoutPortDrawer
        portNumber={portNumber}
        setDrawerVisible={setDrawerVisible}
        drawerVisible={drawerVisible}
        breakoutPorts={breakOutPorts}
      />
      <Tooltip
        placement={'top'}
        overlayStyle={{ maxWidth: '300px' }}
        title={getTooltip()}>
        {portElement}
      </Tooltip></>
    : portElement
}
