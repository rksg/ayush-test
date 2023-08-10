import React from 'react'

import { ClockCircleOutlined } from '@ant-design/icons'
import _                       from 'lodash'

import { Button, Tooltip } from '@acx-ui/components'
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
  VLAN_PREFIX
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

/* eslint-disable max-len */
const getRadioDescription = (radioTypes: RadioTypeEnum[]) => {
  if (radioTypes.length === 3) {
    return 'All'
  } else if (radioTypes.length === 2) {
    return radioTypes.join('/ ')
  } else {
    return radioTypes[0]
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getVlanDescription = (apGroup: any, network: NetworkSaveData) =>{
  let vlanPrefix = VLAN_PREFIX.VLAN
  let fieldToDisplay = 'vlanId'
  let fieldToCompare = 'vlanId'
  let defaultValue = network.wlan?.vlanId || ''

  if (apGroup.vlanPoolId) {
    vlanPrefix = VLAN_PREFIX.POOL
    fieldToDisplay = 'vlanPoolName'
    fieldToCompare = 'vlanPoolId'
  }

  if (network?.wlan?.advancedCustomization?.vlanPool) {
    defaultValue = network?.wlan?.advancedCustomization.vlanPool.id || ''
  }

  const status = apGroup[fieldToCompare] === undefined || apGroup[fieldToCompare] === defaultValue ? 'Default' : 'Custom'
  return `${vlanPrefix}${apGroup[fieldToDisplay] ? apGroup[fieldToDisplay] : defaultValue} (${status})`
}

const apGroupTooltip = (type: string, venue: NetworkVenue, network: NetworkSaveData) => {
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
          apGroup.apGroupName}: </td><td style={{ minWidth: '150px' }}>{getVlanDescription(apGroup, network)}</td></tr>)
      })
    }
  }
  if(type === 'radio'){
    return _.isEmpty(radio) ? '' : <table>{radio.map((item, index) => ({ ...item, key: index }))}</table>
  }else if(type === 'vlan'){
    return _.isEmpty(vlan) ? '' : <table>{vlan.map((item, index) => ({ ...item, key: index }))}</table>
  }else{
    return _.isEmpty(name) ? '' : <table>{name.map((item, index) => ({ ...item, key: index }))}</table>
  }
}

export const transformVLAN = (
  currentVenue?: NetworkVenue,
  network?: NetworkSaveData,
  callback?: React.MouseEventHandler<HTMLElement>,
  readOnly?: boolean
): JSX.Element => {
  const { $t } = getIntl()
  const button = (text: string) => <Button type='link' onClick={callback} disabled={readOnly}>{text}</Button>

  if (!currentVenue) return <></>

  if (!currentVenue.isAllApGroups && Array.isArray(currentVenue.apGroups) && currentVenue.apGroups.length > 1) {
    return <Tooltip title={(network && apGroupTooltip('vlan', currentVenue, network)) || $t({ defaultMessage: 'Per AP Group' })}>{button($t({ defaultMessage: 'Per AP Group' }))}</Tooltip>
  }

  if (!currentVenue.isAllApGroups && currentVenue?.apGroups?.length === 1) {
    const firstApGroup = currentVenue.apGroups[0]
    const isVlanPool = firstApGroup?.vlanPoolId !== undefined
    if (isVlanPool) {
      return <Tooltip title={$t(vlanContents.vlanPool, {
        poolName: firstApGroup.vlanPoolName,
        isCustom: true
      })}>{button($t(vlanContents.vlanPool, {
          poolName: firstApGroup.vlanPoolName,
          isCustom: true
        }))}</Tooltip>
    }

    return <Tooltip title={$t(vlanContents.vlan, {
      id: firstApGroup?.vlanId?.toString() ?? '1',
      isCustom: true
    })}>{button($t(vlanContents.vlan, {
        id: firstApGroup?.vlanId?.toString() ?? '1',
        isCustom: true
      }))}</Tooltip>
  }

  const vlan = getVlanString(network?.wlan?.advancedCustomization?.vlanPool, network?.wlan?.vlanId)
  return <Tooltip title={vlan.vlanText}>{button(vlan.vlanText)}</Tooltip>
}

export const transformAps = (
  currentVenue?: NetworkVenue,
  network?: NetworkSaveData,
  callback?: React.MouseEventHandler<HTMLElement>,
  readOnly?: boolean
) => {
  const { $t } = getIntl()
  let result = ''
  if (!currentVenue) return <></>

  if (currentVenue.isAllApGroups) {
    result = $t({ defaultMessage: 'All APs' })
  } else if (Array.isArray(currentVenue.apGroups)) {
    const firstApGroup = currentVenue.apGroups[0]
    const apGroupName = firstApGroup?.isDefault ? $t({ defaultMessage: 'Unassigned APs' }) : firstApGroup.apGroupName
    result = $t({ defaultMessage: `{count, plural,
      one {{apGroupName}}
      other {{count} AP Groups}
    }` }, { count: currentVenue.apGroups.length, apGroupName: apGroupName })
  }
  return <Tooltip title={(network && apGroupTooltip('aps', currentVenue, network)) || result}><Button type='link' onClick={callback} disabled={readOnly}>{result}</Button></Tooltip>
}

const _getRadioString = (deprecatedRadio: RadioEnum, radioTypes?: RadioTypeEnum[]) => {
  const { $t } = getIntl()
  if (radioTypes && radioTypes.length > 0) {
    return radioTypes.length === 3 ?
      $t({ defaultMessage: 'All' }) :
      radioTypes.join(', ').replace(/-/g, ' ')
  } else {
    return deprecatedRadio !== 'Both' ?
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
  const { $t } = getIntl()
  let result = ''
  if (!currentVenue) return <></>

  if (currentVenue.isAllApGroups) {
    result = _getRadioString(currentVenue.allApGroupsRadio, currentVenue.allApGroupsRadioTypes)
  } else if (currentVenue.isAllApGroups !== undefined && Array.isArray(currentVenue.apGroups)) {
    if (currentVenue.apGroups.length === 1) {
      const firstApGroup = currentVenue.apGroups[0]
      result = _getRadioString(firstApGroup.radio, firstApGroup.radioTypes)
    } else if (currentVenue.apGroups.length > 1) {
      result = $t({ defaultMessage: 'Per AP Group' })
    }
  }
  return <Tooltip title={(network && apGroupTooltip('radio', currentVenue, network)) || result}><Button type='link' onClick={callback} disabled={readOnly}>{result}</Button></Tooltip>
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
