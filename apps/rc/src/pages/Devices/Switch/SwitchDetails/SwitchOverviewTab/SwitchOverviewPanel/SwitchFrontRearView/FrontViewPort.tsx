import { useContext } from 'react'

import { Space }   from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Tooltip }                from '@acx-ui/components'
import { getInactiveTooltip }     from '@acx-ui/rc/components'
import { useLazyGetLagListQuery } from '@acx-ui/rc/services'
import { Lag, SwitchPortStatus }  from '@acx-ui/rc/utils'
import { useParams }              from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

import { SwitchPannelContext } from '.'

export function FrontViewPort (props:{
  portData: SwitchPortStatus
  portColor: string,
  portIcon: string,
  labelText: string,
  labelPosition: 'top' | 'bottom',
  tooltipEnable: boolean,
  disabledClick?:boolean
}) {
  const { $t } = useIntl()
  const { portData, portColor, portIcon, labelText, labelPosition, tooltipEnable,
    disabledClick } = props
  const {
    setEditPortDrawerVisible,
    setSelectedPorts,
    setEditLagModalVisible,
    setEditLag
  } = useContext(SwitchPannelContext)
  const params = useParams()
  const [ getLagList ] = useLazyGetLagListQuery()
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

  const showEditIcon = () => {
    if(portIcon ==='LagMember'){
      return true
    }
    return !getInactiveTooltip(portData)
  }

  const onEditLag = async () => {
    const { data: lagList } = await getLagList({ params })
    const lagData = lagList?.find(item => item.lagId?.toString() === portData.lagId) as Lag
    setEditLagModalVisible(true)
    setEditLag([lagData])
  }

  const onPortClick = () => {
    if(!showEditIcon() || disabledClick) {
      return
    }
    if(portIcon ==='LagMember'){
      onEditLag()
    }else{
      setSelectedPorts([portData])
      setEditPortDrawerVisible(true)
    }
  }

  const portElement = <UI.PortWrapper>
    { labelPosition === 'top' && <UI.PortLabel>{labelText}</UI.PortLabel> }
    <div>
      <UI.Port portColor={portColor} onClick={onPortClick} editable={showEditIcon()}>
        {
          portIcon
            ? (
              <UI.BreadkoutPortContainer data-testid='RegularPort'>
                { portIcon ==='UpLink' && <UI.UplinkPortIcon/> }
                { portIcon ==='Stack' && <UI.StackingPortIcon/> }
                { portIcon ==='PoeUsed' && <UI.PoeUsageIcon /> }
                { portIcon ==='LagMember' && <UI.LagMemberIcon /> }
                { portIcon ==='Breakout' && <UI.BreakoutPortIcon /> }
                { showEditIcon() && <UI.BreakOutPortFlag portColor={portColor} />}
              </UI.BreadkoutPortContainer>
            )
            : (
              <UI.RegularPortContainer>
                { showEditIcon() && <UI.BreakOutPortFlag portColor={portColor} />}
              </UI.RegularPortContainer>
            )
        }

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