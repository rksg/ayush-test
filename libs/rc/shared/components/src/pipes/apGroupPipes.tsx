import React, { ReactNode } from 'react'

import { ClockCircleOutlined } from '@ant-design/icons'
import { isEmpty }             from 'lodash'

import { Button, Tooltip, cssStr } from '@acx-ui/components'
import {
  NetworkSaveData,
  NetworkVenue,
  ISlotIndex,
  getSchedulingCustomTooltip,
  NetworkVenueScheduler,
  SchedulerTypeEnum,
  getVlanString,
  vlanContents,
  RadioEnum,
  RadioTypeEnum,
  VLAN_PREFIX,
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation,
  KeyValue
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'
import { getIntl }    from '@acx-ui/utils'

/* eslint-disable max-len */
const getRadioDescription = (radioTypes: RadioTypeEnum[]) => {
  if (radioTypes.length === 3) {
    return 'All'
  } else if (radioTypes.length === 2) {
    return radioTypes.join(', ')
  } else {
    return radioTypes[0]
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getVlanDescription = (apGroup: any, network: NetworkSaveData, vlanPoolingNameMap?: KeyValue<string, string>[]) =>{
  let vlanPrefix = VLAN_PREFIX.VLAN
  let displayText = apGroup.vlanId
  let fieldToCompare = 'vlanId'
  let defaultValue = network.wlan?.vlanId || ''
  const networkVlanPoolId = network?.wlan?.advancedCustomization?.vlanPool?.id

  if (apGroup.vlanPoolId) {
    vlanPrefix = VLAN_PREFIX.POOL
    fieldToCompare = 'vlanPoolId'
    displayText = (vlanPoolingNameMap?.find(pool => pool.key === apGroup.vlanPoolId)?.value) || ''
  }
  if (networkVlanPoolId) {
    defaultValue = (vlanPoolingNameMap?.find(pool => pool.key === networkVlanPoolId)?.value) || ''
  }

  const status = apGroup[fieldToCompare] === undefined || apGroup[fieldToCompare] === defaultValue ? 'Default' : 'Custom'
  return `${vlanPrefix}${displayText ? displayText : defaultValue} (${status})`
}

const apGroupTooltip = (type: string, venue: NetworkVenue, network: NetworkSaveData, vlanPoolingNameMap?: KeyValue<string, string>[]) => {
  let name: JSX.Element[] = []
  let radio: JSX.Element[] = []
  let vlan: JSX.Element[] = []

  if (venue && network && network.venues && network.venues.length > 0) {
    // if allApgroups is defined and false and more than one apgroup is selected, then display the tooltip
    if (venue.isAllApGroups !== undefined && !venue.isAllApGroups && venue.apGroups && venue.apGroups.length > 1) {
      venue.apGroups.forEach(apGroup => {
        name.push(<tr><td>{!apGroup.apGroupName && apGroup.isDefault ? 'Unassigned APs' : apGroup.apGroupName}</td></tr>)
        radio.push(<tr><td>{!apGroup.apGroupName && apGroup.isDefault ? 'Unassigned APs' :
          apGroup.apGroupName}: </td><td>{apGroup.radioTypes && getRadioDescription(apGroup.radioTypes)}</td></tr>)
        vlan.push(<tr><td style={{ minWidth: '80px' }}>{!apGroup.apGroupName && apGroup.isDefault ? 'Unassigned APs' :
          apGroup.apGroupName}: </td><td style={{ minWidth: '150px' }}>{getVlanDescription(apGroup, network, vlanPoolingNameMap)}</td></tr>)
      })
    }
  }
  if(type === 'radio'){
    return isEmpty(radio) ? '' : <table>{radio.map((item, index) => ({ ...item, key: index }))}</table>
  }else if(type === 'vlan'){
    return isEmpty(vlan) ? '' : <table>{vlan.map((item, index) => ({ ...item, key: index }))}</table>
  }else{
    return isEmpty(name) ? '' : <table>{name.map((item, index) => ({ ...item, key: index }))}</table>
  }
}

export const transformVLAN = (
  currentVenue?: NetworkVenue,
  network?: NetworkSaveData,
  vlanPoolingNameMap?: KeyValue<string, string>[],
  callback?: React.MouseEventHandler<HTMLElement>,
  readOnly?: boolean
): JSX.Element => {
  if (!currentVenue) return <></>

  const { $t } = getIntl()
  const childComponent = (text: string) => (
    callback? <Button type='link' onClick={callback} disabled={readOnly}>{text}</Button> : text
  )
  let displayText = ''
  let tooltipTitle: ReactNode

  if (!currentVenue.isAllApGroups && Array.isArray(currentVenue.apGroups)) {
    if (currentVenue.apGroups.length === 1) {
      const firstApGroup = currentVenue.apGroups[0]
      const isVlanPool = firstApGroup?.vlanPoolId !== undefined
      if (isVlanPool) {
        const vlanPoolId = firstApGroup.vlanPoolId
        const defaultValue = network?.wlan?.advancedCustomization?.vlanPool?.id || ''
        const vlanPoolName = (vlanPoolingNameMap?.find(pool => pool.key === firstApGroup.vlanPoolId)?.value) || ''
        displayText = $t(vlanContents.vlanPool, {
          poolName: vlanPoolName,
          isCustom: vlanPoolId && (vlanPoolId !== defaultValue)
        })
      } else if (firstApGroup?.vlanId !== undefined) {
        const vlanId = firstApGroup.vlanId
        const defaultValue = network?.wlan?.vlanId || 1
        displayText = $t(vlanContents.vlan, {
          id: vlanId.toString(),
          isCustom: vlanId && (vlanId !== defaultValue)
        })
      } else {
        const vlan = getVlanString(currentVenue.vlanPoolId ? {
          id: currentVenue.vlanPoolId,
          name: currentVenue.vlanPoolName ?? '',
          vlanMembers: currentVenue.vlanMembers ?? []
        } : null, network?.wlan?.vlanId)
        displayText = vlan.vlanText
      }

      tooltipTitle = displayText
    } else if (currentVenue.apGroups.length > 1) {
      displayText = $t({ defaultMessage: 'Per AP Group' })
      tooltipTitle = (network && apGroupTooltip('vlan', currentVenue, network, vlanPoolingNameMap)) || displayText
    }
  } else {
    const vlan = getVlanString(currentVenue.vlanPoolId ? {
      id: currentVenue.vlanPoolId,
      name: currentVenue.vlanPoolName ?? '',
      vlanMembers: currentVenue.vlanMembers ?? []
    }: null, network?.wlan?.vlanId)
    displayText = vlan.vlanText
    tooltipTitle = displayText
  }

  return (
    <Tooltip title={tooltipTitle}>
      {childComponent(displayText)}
    </Tooltip>
  )
}

export const transformAps = (
  currentVenue?: NetworkVenue,
  network?: NetworkSaveData,
  callback?: React.MouseEventHandler<HTMLElement>,
  readOnly?: boolean,
  incompatible?: number
) => {
  const { $t } = getIntl()
  let result = ''
  if (!currentVenue) return <></>

  if (currentVenue.isAllApGroups) {
    result = $t({ defaultMessage: 'All APs' })
  } else if (Array.isArray(currentVenue.apGroups)) {
    if (currentVenue.apGroups.length >= 1) {
      const firstApGroup = currentVenue.apGroups[0]
      const apGroupName = firstApGroup?.isDefault ? $t({ defaultMessage: 'Unassigned APs' }) : firstApGroup.apGroupName
      result = $t({ defaultMessage: `{count, plural,
      one {{apGroupName}}
      other {{count} AP Groups}
      }` }, { count: currentVenue.apGroups.length, apGroupName: apGroupName })
    }
  }
  return (
    <>
      <Tooltip title={(network && apGroupTooltip('aps', currentVenue, network)) || result}><Button type='link' onClick={callback} disabled={readOnly}>{result}</Button></Tooltip>
      {incompatible && incompatible > 0 ?
        <Tooltip.Warning isFilled
          isTriangle
          title={$t({ defaultMessage: 'Some access points may not be compatible with certain Wi-Fi features in this <venueSingular></venueSingular>.' })}
          placement='right'
          iconStyle={{
            height: '16px',
            width: '16px',
            marginBottom: '-2px',
            marginLeft: '6px',
            color: cssStr('--acx-semantics-yellow-50'),
            borderColor: cssStr('--acx-accents-orange-30')
          }}
        /> :[]
      }
    </>
  )
}

const _getRadioString = (deprecatedRadio?: RadioEnum, radioTypes?: RadioTypeEnum[]) => {
  const { $t } = getIntl()
  if (radioTypes && radioTypes.length > 0) {
    return radioTypes.length === 3 ?
      $t({ defaultMessage: 'All' }) :
      radioTypes.join(', ').replace(/-/g, ' ')
  } else {
    return (deprecatedRadio && deprecatedRadio !== 'Both') ?
      deprecatedRadio.replace(/-/g, ' ') :
      $t({ defaultMessage: '2.4 GHz / 5 GHz' })
  }
}

export const transformRadios = (
  currentVenue?: NetworkVenue,
  network?: NetworkSaveData,
  callback?: React.MouseEventHandler<HTMLElement>,
  readOnly?: boolean
) => {
  if (!currentVenue) return <></>

  const { $t } = getIntl()
  const childComponent = (text: string) => (
    callback? <Button type='link' onClick={callback} disabled={readOnly}>{text}</Button> : text
  )
  let displayText = ''

  if (currentVenue.isAllApGroups) {
    displayText = _getRadioString(currentVenue.allApGroupsRadio, currentVenue.allApGroupsRadioTypes)
  } else if (currentVenue.isAllApGroups !== undefined && Array.isArray(currentVenue.apGroups)) {
    if (currentVenue.apGroups.length === 1) {
      const firstApGroup = currentVenue.apGroups[0]
      displayText = _getRadioString(firstApGroup.radio, firstApGroup.radioTypes)
    } else if (currentVenue.apGroups.length > 1) {
      displayText = $t({ defaultMessage: 'Per AP Group' })
    }
  }

  const tooltipTitle = (network && apGroupTooltip('radio', currentVenue, network)) || displayText
  return (
    <Tooltip title={tooltipTitle}>
      {childComponent(displayText)}
    </Tooltip>
  )
}

export const transformScheduling = (
  currentVenue?: NetworkVenue,
  currentTimeIdx?: ISlotIndex,
  callback?: React.MouseEventHandler<HTMLElement>,
  readOnly?: boolean
) => {
  const { $t } = getIntl()
  let result = ''
  if (!currentVenue) return <></>

  const scheduler = currentVenue?.scheduler

  let tooltip = ''
  if (scheduler) {
    let message = '', dayName = '', timeString = ''
    switch (scheduler.type) {
      case SchedulerTypeEnum.ALWAYS_ON:
        result = $t({ defaultMessage: '24/7' })
        message = $t({ defaultMessage: 'Network is ON 24/7' })
        break
      case SchedulerTypeEnum.CUSTOM:
        result = $t({ defaultMessage: 'custom' })
        if (currentTimeIdx) {
          const day = currentTimeIdx.day.toLowerCase()
          const time = currentTimeIdx.timeIndex
          const dayData = scheduler[day as keyof NetworkVenueScheduler]
          if (dayData?.charAt(time) === '1') {
            result = $t({ defaultMessage: 'ON now' })
            message = $t({ defaultMessage: 'Scheduled to be on until ' })
          } else {
            result = $t({ defaultMessage: 'OFF now' })
            message = $t({ defaultMessage: 'Currently off. Scheduled to turn on at ' })
          }
          [dayName, timeString] = getSchedulingCustomTooltip(scheduler, currentTimeIdx)
        }
        break
      default:
        break
    }
    tooltip = `${message} ${dayName} ${timeString}`
  } else {
    result = $t({ defaultMessage: '24/7' })
    tooltip = $t({ defaultMessage: 'Network is ON 24/7' })
  }
  return (
    <Tooltip title={tooltip}>
      <Button type='link' onClick={callback} disabled={readOnly}>{result} <ClockCircleOutlined /></Button>
    </Tooltip>
  )
}

// For ApGroup detail's network table
export const transformApGroupVlan = (
  currentVenue?: NetworkVenue,
  network?: NetworkSaveData,
  apGroupId?: string,
  vlanPoolingNameMap?: KeyValue<string, string>[]
): JSX.Element => {
  if (!currentVenue) return <></>

  const { $t } = getIntl()
  const { isAllApGroups, apGroups } = currentVenue

  let displayText = ''


  if (!isAllApGroups && Array.isArray(apGroups)) {
    const wlan = network?.wlan
    const findApGroup = apGroups.find((apGroup) => apGroup.apGroupId === apGroupId)
    if (findApGroup) {
      const vlanPoolId = findApGroup?.vlanPoolId
      const isVlanPool = (vlanPoolId !== undefined && vlanPoolId !== null)
      if (isVlanPool) {
        const defaultValue = wlan?.advancedCustomization?.vlanPool?.id || ''
        displayText = $t(vlanContents.vlanPool, {
          poolName: (vlanPoolingNameMap?.find(pool => pool.key === vlanPoolId)?.value) || '',
          isCustom: vlanPoolId && vlanPoolId !== defaultValue
        })

        return (
          <Tooltip title={displayText}>
            <TenantLink to={getPolicyDetailsLink({
              type: PolicyType.VLAN_POOL,
              oper: PolicyOperation.DETAIL,
              policyId: vlanPoolId
            })}>
              {displayText}
            </TenantLink>
          </Tooltip>
        )
      } else {
        const defaultValue = wlan?.vlanId || 1
        const apGroupvlanId = findApGroup?.vlanId
        const vlanId = apGroupvlanId || defaultValue
        displayText = $t(vlanContents.vlan, {
          id: vlanId.toString(),
          isCustom: apGroupvlanId && apGroupvlanId !== defaultValue
        })
      }
    }
  } else {
    const vlan = getVlanString(network?.wlan?.advancedCustomization?.vlanPool, network?.wlan?.vlanId)
    displayText = vlan.vlanText
  }

  return (
    <Tooltip title={displayText}>
      {displayText}
    </Tooltip>
  )
}

export const transformApGroupRadios = (
  currentVenue?: NetworkVenue,
  network?: NetworkSaveData,
  apGroupId?: string
): JSX.Element => {
  if (!currentVenue) return <></>

  const { isAllApGroups, apGroups } = currentVenue

  let displayText = ''

  if (isAllApGroups) {
    displayText = _getRadioString(currentVenue.allApGroupsRadio, currentVenue.allApGroupsRadioTypes)
  } else if (isAllApGroups !== undefined && Array.isArray(apGroups)) {
    const findApGroup = apGroups.find((apGroup) => apGroup.apGroupId === apGroupId)
    if (findApGroup) {
      displayText = _getRadioString(findApGroup.radio, findApGroup.radioTypes)
    }
  }

  return (
    <Tooltip title={displayText}>
      {displayText}
    </Tooltip>
  )
}
