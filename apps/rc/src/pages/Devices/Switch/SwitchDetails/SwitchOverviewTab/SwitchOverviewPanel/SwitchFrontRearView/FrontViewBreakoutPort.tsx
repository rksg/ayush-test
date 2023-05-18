import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Tooltip }                            from '@acx-ui/components'
import { SwitchPortStatus, SwitchStatusEnum } from '@acx-ui/rc/utils'

import { FrontViewBreakoutPortDrawer } from './FrontViewBreakoutPortDrawer'
import * as UI                      from './styledComponents'

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
    return <div style={{
      fontSize: 'var(--acx-body-4-font-size)',
      lineHeight: 'var(--acx-body-4-line-height)'
    }}>
      <div style={{ paddingBottom: 'var(--acx-descriptions-space)', color: '#c4c4c4' }}>
        {portNumber}: {$t({ defaultMessage: 'Breakout Port' })} ({breakOutPorts.length})</div>
      {breakOutPorts.map((p: SwitchPortStatus) => {
        return <div style={{ gridTemplateColumns: 'auto auto', display: 'grid',
          paddingBottom: 'var(--acx-descriptions-space)' }}>
          <div>{`${p.portIdentifier} (${p.status})`}</div>
          <div>{getPortIcon(p)}</div>
        </div>
      })}
    </div>
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

  const getPortColor = (portColor: string) => {
    const colorMap:{ [key:string]: string } = {
      lightgray: 'var(--acx-neutrals-25)',
      gray: 'var(--acx-neutrals-50)',
      green: 'var(--acx-semantics-green-50)'
    }
    return colorMap[portColor]
  }
  const [drawerVisible, setDrawerVisible] = useState(false)

  const portElement = <UI.PortWrapper>
    { labelPosition === 'top' && <UI.PortLabel>{labelText}</UI.PortLabel> }
    <div>

      <UI.Port portColor={getPortColorEnum()}>
        <div style={{ position: 'relative' , cursor: 'pointer', fontSize: '10px' }}
          onClick={()=>{
            setDrawerVisible(true)
          }}>
          B
          <div style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 0 5px 5px',
            borderColor: `transparent transparent ${getPortColor(getPortColorEnum())} transparent`,
            left: '7px',
            top: '11px',
            position: 'absolute'
          }}></div>
        </div>
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
