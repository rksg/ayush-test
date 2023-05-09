import { Space }   from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Tooltip }          from '@acx-ui/components'
import { SwitchPortStatus } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export function FrontViewStackPort (props:{
  ports: SwitchPortStatus[],
  portData: SwitchPortStatus,
  labelText: string,
  labelPosition: 'top' | 'bottom',
  tooltipEnable: boolean
}) {
  const { $t } = useIntl()
  const { portData, labelText, labelPosition, tooltipEnable } = props

  const portColor ='grey'
  const getTooltip = (port: SwitchPortStatus) => {
    const speedNoData = 'link down or no traffic'
    const isUnTaggedVlanValid = port.unTaggedVlan !== '' && port.unTaggedVlan !== undefined
    const UntaggedVlanText = <Space size={4}>
      <UI.TagsOutlineIcon />{ isUnTaggedVlanValid ? port.unTaggedVlan : '--' }
    </Space>
    let taggedVlanText

    if (port.vlanIds !== '' && port.vlanIds !== undefined) {
      let vlanIdsArray = port.vlanIds.split(' ')

      if (isUnTaggedVlanValid) {
        let taggedVlan = '--'
        if (vlanIdsArray.length > 1) {
          vlanIdsArray = _.remove(vlanIdsArray, n => n !== port.unTaggedVlan)
          vlanIdsArray.sort((a:string, b:string) => Number(a) - Number(b))
          // CMS-779 PLM feedback: Show up to 15 vlans in tooltip. If more than 15 VLANs, truncate and add an ellipsis
          const ellipsis = (vlanIdsArray.length > 15) ? '...' : ''
          const showVlanIdArray = (vlanIdsArray.length > 15) ?
            vlanIdsArray.slice(0, 15) : vlanIdsArray
          taggedVlan = showVlanIdArray.join(', ').concat(ellipsis)
        }

        taggedVlanText = <Space size={4}><UI.TagsSolidIcon />{ taggedVlan }</Space>
      } else {
        taggedVlanText = <Space size={4}><UI.TagsSolidIcon />{ vlanIdsArray.join(', ') }</Space>
      }
    }

    const poeUsed = Math.round(port.poeUsed / 1000)
    const poeTotal = Math.round(port.poeTotal / 1000)

    return <div>
      <UI.TooltipStyle labelWidthPercent={50}>
        <UI.TooltipStyle.Item
          label={$t({ defaultMessage: 'Port' })}
          children={port.portIdentifier}
        />
        <UI.TooltipStyle.Item
          label={$t({ defaultMessage: 'Name' })}
          children={port.name === '' ? '--' : port.name}
        />
        <UI.TooltipStyle.Item
          label={$t({ defaultMessage: 'VLAN' })}
          children={<>
            <div>{UntaggedVlanText}</div>
            <div>{taggedVlanText}</div>
          </>
          }
        />
        <UI.TooltipStyle.Item
          label={$t({ defaultMessage: 'Port Speed' })}
          children={port.portSpeed === speedNoData ? '--' : port.portSpeed}
        />
        <UI.TooltipStyle.Item
          label={$t({ defaultMessage: 'Port State' })}
          children={port.status}
        />
        <UI.TooltipStyle.Item
          label={$t({ defaultMessage: 'Connected Device' })}
          children={port.neighborName || port.neighborMacAddress || '--'}
        />
        <UI.TooltipStyle.Item
          label={$t({ defaultMessage: 'PoE Usage (Consumed/Allocated)' })}
          children={<>{poeUsed} W/ {poeTotal} W</>}
        />
        <UI.TooltipStyle.Item
          label={$t({ defaultMessage: 'PoE Device Type' })}
          children={port.poeType === '' ? '--' : port.poeType}
        />
      </UI.TooltipStyle>
    </div>
  }

  const portElement = <UI.PortWrapper>
    { labelPosition === 'top' && <UI.PortLabel>{labelText}</UI.PortLabel> }
    <div>

      <UI.Port portColor={portColor}>
        <div style={{ position: 'relative' , cursor: 'pointer', fontSize: '10px'}}
          onClick={()=>{
            // eslint-disable-next-line no-console
            console.log(portColor)
          }}>
          B
          <div style={{
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 0 4px 4px',
            borderColor: 'transparent transparent #ff0000 transparent',
            left: '9px',
            top: '13px',
            position: 'absolute'
          }}></div>
        </div>


      </UI.Port>

    </div>
    { labelPosition === 'bottom' && <UI.PortLabel>{labelText}</UI.PortLabel> }
  </UI.PortWrapper>

  return tooltipEnable
    ? <Tooltip
      placement={'top'}
      overlayStyle={{ maxWidth: '300px' }}
      title={getTooltip(portData)}>
      {portElement}
    </Tooltip>
    : portElement
}