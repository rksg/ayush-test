import React from 'react'

import { ClockCircleOutlined } from '@ant-design/icons'
import { Tooltip }             from 'antd'

import { Button } from '@acx-ui/components'
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
  RadioTypeEnum
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

/* eslint-disable max-len */

export const transformVLAN = (
  currentVenue?: NetworkVenue,
  wlan?: NetworkSaveData['wlan'],
  callback?: React.MouseEventHandler<HTMLElement>
): JSX.Element => {
  const { $t } = getIntl()
  const button = (text: string) => <Button type='link' onClick={callback}>{text}</Button>

  if (!currentVenue) return <></>

  if (!currentVenue.isAllApGroups && Array.isArray(currentVenue.apGroups) && currentVenue.apGroups.length > 1) {
    return button($t({ defaultMessage: 'Per AP Group' }))
  }

  if (!currentVenue.isAllApGroups && currentVenue?.apGroups?.length === 1) {
    const firstApGroup = currentVenue.apGroups[0]
    const isVlanPool = firstApGroup?.vlanPoolId !== undefined
    if (isVlanPool) {
      return button($t(vlanContents.vlanPool, {
        poolName: firstApGroup.vlanPoolName,
        isCustom: true
      }))
    }

    return button($t(vlanContents.vlan, {
      id: firstApGroup?.vlanId?.toString() ?? '1',
      isCustom: true
    }))
  }

  const vlan = getVlanString(wlan?.advancedCustomization?.vlanPool, wlan?.vlanId)
  return button(vlan.vlanText)
}

export const transformAps = (currentVenue?: NetworkVenue, callback?: React.MouseEventHandler<HTMLElement>) => {
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
  return <Button type='link' onClick={callback}>{result}</Button>
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

export const transformRadios = (currentVenue?: NetworkVenue, callback?: React.MouseEventHandler<HTMLElement>) => {
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
  return <Button type='link' onClick={callback}>{result}</Button>
}

export const transformScheduling = (currentVenue?: NetworkVenue, currentTimeIdx?: ISlotIndex, callback?: React.MouseEventHandler<HTMLElement>) => {
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
      <Button type='link' onClick={callback}>{result} <ClockCircleOutlined /></Button>
    </Tooltip>
  )
}
