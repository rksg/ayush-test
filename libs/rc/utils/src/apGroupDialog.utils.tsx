import React from 'react'

import { ClockCircleOutlined }   from '@ant-design/icons'
import {
  Tooltip,
  ModalProps as AntdModalProps
} from 'antd'
import _ from 'lodash'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Button }  from '@acx-ui/components'
import { getIntl } from '@acx-ui/utils'

import {
  NetworkApGroup,
  NetworkSaveData,
  NetworkVenue,
  VLAN_PREFIX,
  ISlotIndex,
  getSchedulingCustomTooltip,
  NetworkVenueScheduler,
  RadioEnum,
  RadioTypeEnum,
  SchedulerTypeEnum,
  VlanPool,
  VlanType
} from './index'

import type { FormFinishInfo } from 'rc-field-form/es/FormContext'

export interface ApGroupModalWidgetProps extends AntdModalProps {
  name: string
  formName?: string
  networkVenue?: NetworkVenue
  venueName?: string
  wlan?: NetworkSaveData['wlan']
  tenantId?: string
}

/* eslint-disable max-len */

export const getVlanString = (vlanPool?: VlanPool | null, vlanId?: number) => { // TODO: move to apGroupDialog.utils.tsx
  let vlanPrefix = ''
  let vlanString
  let vlanType

  if (vlanPool) {
    vlanString = vlanPool.name
    vlanPrefix = VLAN_PREFIX.POOL
    vlanType = VlanType.Pool
  } else  {
    vlanString = vlanId
    vlanPrefix = VLAN_PREFIX.VLAN
    vlanType = VlanType.VLAN
  }

  return { vlanPrefix, vlanString, vlanType }
}

export const transformVLAN = (currentVenue?: NetworkVenue, wlan?: NetworkSaveData['wlan'], callback?: React.MouseEventHandler<HTMLElement>) => {
  const { $t } = getIntl()
  let result = ''
  let valuePrefix = ''
  let vlanString
  let valueSuffix = ''

  if (currentVenue) {
    if (!currentVenue.isAllApGroups && Array.isArray(currentVenue.apGroups) && currentVenue.apGroups.length > 1) {
      vlanString = $t({ defaultMessage: 'Per AP Group' })
    }
    else if (!currentVenue.isAllApGroups && currentVenue?.apGroups?.length === 1) {
      valueSuffix = $t({ defaultMessage: '(Custom)' })
      const firstApGroup = currentVenue.apGroups[0]

      if (firstApGroup?.vlanPoolId) {
        valuePrefix = VLAN_PREFIX.POOL
        vlanString = firstApGroup.vlanPoolName
      } else if (firstApGroup?.vlanId) {
        valuePrefix = VLAN_PREFIX.VLAN
        vlanString = firstApGroup?.vlanId?.toString()
      }

      if (!vlanString) {
        valuePrefix = VLAN_PREFIX.VLAN
        vlanString = '1' // default fallback to avoid unavailable vlan1 of default ap group
      }
    }
    else { //isAllApGroups
      valueSuffix = $t({ defaultMessage: '(Default)' })

      const vlanStringSet = getVlanString(wlan?.advancedCustomization?.vlanPool, wlan?.vlanId)
      valuePrefix = vlanStringSet.vlanPrefix
      vlanString = vlanStringSet.vlanString
    }
    result = `${valuePrefix}${vlanString} ${valueSuffix}`
    return <Button type='link' onClick={callback}>{result}</Button>
  }
  return <>{result}</>
}

export const transformAps = (currentVenue?: NetworkVenue, callback?: React.MouseEventHandler<HTMLElement>) => {
  const { $t } = getIntl()
  let result = ''

  if (currentVenue) {
    if (currentVenue.isAllApGroups) {
      result = $t({ defaultMessage: 'All APs' })
    } else if (Array.isArray(currentVenue.apGroups)) {
      const firstApGroup = currentVenue.apGroups[0]
      if (currentVenue.apGroups.length > 1) {
        result = `${currentVenue.apGroups.length} ${$t({ defaultMessage: 'AP Groups' })}`
      } else if(firstApGroup?.isDefault) {
        result = $t({ defaultMessage: 'Unassigned APs' })
      } else if(firstApGroup?.apGroupName) {
        result = firstApGroup.apGroupName
      }
    }
    return <Button type='link' onClick={callback}>{result}</Button>
  }
  return <>{result}</>
}

export const transformRadios = (currentVenue?: NetworkVenue, callback?: React.MouseEventHandler<HTMLElement>) => {
  const { $t } = getIntl()
  let result = ''
  if (currentVenue) {
    if (currentVenue.isAllApGroups) {
      if (currentVenue.allApGroupsRadioTypes && currentVenue.allApGroupsRadioTypes.length > 0) {
        if (currentVenue.allApGroupsRadioTypes.length === 3) {
          result = $t({ defaultMessage: 'All' })
        } else {
          result = currentVenue.allApGroupsRadioTypes.join(', ').replace(/-/g, ' ')
        }
      } else {
        if (currentVenue.allApGroupsRadio !== 'Both') {
          result = currentVenue.allApGroupsRadio.replace(/-/g, ' ')
        } else {
          result = $t({ defaultMessage: '2.4 GHz / 5 GHz' })
        }
      }
    } else if (currentVenue.isAllApGroups !== undefined && Array.isArray(currentVenue.apGroups)) {
      if (currentVenue.apGroups.length === 1) {
        const firstApGroup = currentVenue.apGroups[0]
        if (firstApGroup.radioTypes && firstApGroup.radioTypes.length > 0) {
          if (firstApGroup.radioTypes.length === 3) {
            result = $t({ defaultMessage: 'All' })
          } else {
            result = firstApGroup.radioTypes.join(', ').replace(/-/g, ' ')
          }
        } else {
          result = firstApGroup.radio !== 'Both' ? firstApGroup.radio.replace(/-/g, ' ') : $t({ defaultMessage: '2.4 GHz / 5 GHz' })
        }
      } else if (currentVenue.apGroups.length > 1) {
        result = $t({ defaultMessage: 'Per AP Group' })
      }
    }
    return <Button type='link' onClick={callback}>{result}</Button>
  }
  return <>{result}</>
}

export const transformScheduling = (currentVenue?: NetworkVenue, currentTimeIdx?: ISlotIndex, callback?: React.MouseEventHandler<HTMLElement>) => {
  const { $t } = getIntl()
  let result = ''
  const scheduler = currentVenue?.scheduler

  if (currentVenue) {
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
  return <>{result}</>
}

export const radioTypeEnumToRadioEnum = (radioTypes: RadioTypeEnum[]) => {
  if (radioTypes.includes(RadioTypeEnum._2_4_GHz) && radioTypes.includes(RadioTypeEnum._5_GHz)) {
    return RadioEnum.Both
  } else {
    const radioEnum = [RadioEnum._2_4_GHz, RadioEnum._5_GHz]
    return radioEnum[_.findIndex([RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz], (r)=>radioTypes.includes(r))]
  }
}

export const aggregateApGroupPayload = (info: FormFinishInfo, oldData?: NetworkVenue) => {
  const { selectionType, allApGroupsRadioTypes, apgroups } = info.values

  let newData = {
    isAllApGroups: selectionType === 0
  }

  if (newData.isAllApGroups) {
    _.assign(newData, {
      allApGroupsRadio: radioTypeEnumToRadioEnum(allApGroupsRadioTypes),
      allApGroupsRadioTypes: allApGroupsRadioTypes,
      apGroups: []
    })
  } else {
    _.assign(newData, {
      apGroups: (apgroups || []).filter((ag:{ selected: boolean }) => ag.selected).map((editedApGroup: NetworkApGroup) => {
        const currentApGroup = (oldData?.apGroups || []).find((ag) => ag.apGroupId === editedApGroup.apGroupId)
        let ret = { ...currentApGroup }

        ret.apGroupId = editedApGroup.apGroupId
        ret.radioTypes = editedApGroup.radioTypes
        ret.radio = editedApGroup.radioTypes ? radioTypeEnumToRadioEnum(editedApGroup.radioTypes) : RadioEnum.Both
        if (editedApGroup.vlanPoolName) {
          ret.vlanPoolId = editedApGroup.vlanPoolId
          ret.vlanPoolName = editedApGroup.vlanPoolName
        } else {
          ret.vlanId = editedApGroup.vlanId
        }
        return ret
      })
    })
  }

  return { ...oldData, ...newData }
}