import { useContext } from 'react'

import { Space }   from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Tooltip, cssStr }                                                                 from '@acx-ui/components'
import { Features, useIsSplitOn }                                                          from '@acx-ui/feature-toggle'
import { getInactiveTooltip }                                                              from '@acx-ui/rc/components'
import { useLazyGetLagListQuery }                                                          from '@acx-ui/rc/services'
import { Lag, SwitchPortStatus, SwitchRbacUrlsInfo, isFirmwareVersionAbove10010gOr10020b } from '@acx-ui/rc/utils'
import { useParams }                                                                       from '@acx-ui/react-router-dom'
import { SwitchScopes }                                                                    from '@acx-ui/types'
import { hasPermission }                                                                   from '@acx-ui/user'
import { getOpsApi }                                                                       from '@acx-ui/utils'

import * as UI from './styledComponents'

import { SwitchPanelContext } from '.'

export function FrontViewPort (props:{
  portData: SwitchPortStatus
  portColor: string,
  portIcon: string,
  labelText: string,
  labelPosition: 'top' | 'bottom',
  tooltipEnable: boolean,
  disabledClick?:boolean
  switchFirmware?: string
}) {
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchErrorDisableEnabled = useIsSplitOn(Features.SWITCH_ERROR_DISABLE_STATUS)
  const isSupportStackNeighborPort = useIsSplitOn(Features.SUPPORT_STACK_NEIGHBOR_PORT_TOGGLE)

  const { $t } = useIntl()
  const { portData, portColor, portIcon, labelText, labelPosition, tooltipEnable,
    disabledClick, switchFirmware } = props
  const {
    setEditPortDrawerVisible,
    setSelectedPorts,
    setEditLagModalVisible,
    setEditLag,
    setBreakoutPortDrawerVisible,
    setEditBreakoutPortDrawerVisible
  } = useContext(SwitchPanelContext)
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
      let vlanIdsArray = port.vlanIds.split(' ').sort((a:string, b:string) => Number(a) - Number(b))

      if (isUnTaggedVlanValid) {
        let taggedVlan = '--'
        if (vlanIdsArray.length > 1) {
          vlanIdsArray = _.remove(vlanIdsArray, n => n !== port.unTaggedVlan)
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

    const incompatibleIconStyle = {
      height: '16px',
      width: '16px',
      marginBottom: '-4px',
      marginRight: '4px',
      color: cssStr('--acx-semantics-red-50'),
      borderColor: cssStr('--acx-accents-red-30')
    }

    return <div>
      <UI.TooltipStyle labelWidthPercent={40}>
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
        {// eslint-disable-next-line max-len
          isSwitchErrorDisableEnabled && isFirmwareVersionAbove10010gOr10020b(switchFirmware) && (<>
            <UI.TooltipStyle.Item
              label={$t({ defaultMessage: 'ErrDisabled' })}
              children={
                !port.errorDisableStatus ? $t({ defaultMessage: 'No' })
                  : <>
                    <Tooltip.Warning
                      isFilled
                      isTriangle
                      iconStyle={incompatibleIconStyle}
                    />
                    {$t({ defaultMessage: 'Yes' })}
                  </>
              }
            />
            {port.errorDisableStatus &&
              <UI.TooltipStyle.Item
                label={$t({ defaultMessage: 'ErrDisable Reason' })}
                children={
                  <>
                    <Tooltip.Warning
                      isFilled
                      isTriangle
                      iconStyle={incompatibleIconStyle}
                    />
                    {port.errorDisableStatus}
                  </>
                }
              />
            }
          </>)}
        <UI.TooltipStyle.Item
          label={$t({ defaultMessage: 'Connected Device' })}
          children={port.neighborName || port.neighborMacAddress ||
            (isSupportStackNeighborPort && port.stackingNeighborPort) || '--'}
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

  const editable = hasPermission({
    scopes: [SwitchScopes.UPDATE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.savePortsSetting)] })

  const showEditIcon = () => {
    if(!editable) {
      return false
    }
    if(portIcon ==='LagMember'){
      return true
    }
    return !getInactiveTooltip(portData)
  }

  const onEditLag = async () => {
    const { data: lagList } = await getLagList({
      params: { ...params, venueId: portData.venueId },
      enableRbac: isSwitchRbacEnabled
    })
    const lagData = lagList?.find(item => item.lagId?.toString() === portData.lagId) as Lag
    setEditLagModalVisible(true)
    setEditLag([lagData])
  }

  const onPortClick = () => {
    if(!showEditIcon() || disabledClick || !editable) {
      return
    }
    setEditLagModalVisible(false)
    setEditPortDrawerVisible(false)
    setBreakoutPortDrawerVisible(false)
    setEditBreakoutPortDrawerVisible(false)
    if(portIcon ==='LagMember'){
      onEditLag()
    }else{
      setSelectedPorts([portData])
      setEditPortDrawerVisible(true)
    }
  }

  const portElement = <UI.PortWrapper>
    { labelPosition === 'top' && <UI.PortLabel>{labelText}</UI.PortLabel> }
    <UI.Port portColor={portColor} onClick={onPortClick} editable={showEditIcon()}>
      {
        portIcon
          ? (
            <UI.WithIconPortContainer data-testid='RegularPortWithIcon'>
              { portIcon ==='UpLink' && <UI.UplinkPortIcon/> }
              { portIcon ==='Stack' && <UI.StackingPortIcon/> }
              { portIcon ==='PoeUsed' && <UI.PoeUsageIcon /> }
              { portIcon ==='LagMember' && <UI.LagMemberIcon /> }
              { portIcon ==='Breakout' && <UI.BreakoutPortIcon /> }
              { showEditIcon() && <UI.BreakOutPortFlag portColor={portColor} />}
            </UI.WithIconPortContainer>
          )
          : (
            <UI.RegularPortContainer data-testid='RegularPort'>
              { showEditIcon() && <UI.BreakOutPortFlag portColor={portColor} />}
            </UI.RegularPortContainer>
          )
      }
    </UI.Port>
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
