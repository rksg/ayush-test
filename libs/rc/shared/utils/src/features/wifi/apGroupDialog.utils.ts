/* eslint-disable max-len */
import { assign, findIndex } from 'lodash'

import { getIntl } from '@acx-ui/utils'

import {
  NetworkApGroup, NetworkSaveData,
  NetworkVenue,
  RadioEnum,
  RadioTypeEnum,
  VlanPool,
  VlanType
} from '../../'

import { vlanContents } from './contentMap'

import type { FormFinishInfo } from 'rc-field-form/es/FormContext'


export const getVlanString = (vlanPool?: VlanPool | null, vlanId?: number, isCustom = false) => {
  const { $t } = getIntl()

  if (vlanPool) {
    return {
      vlanString: vlanPool.name,
      vlanType: VlanType.Pool,
      vlanText: $t(vlanContents.vlanPool, { isCustom, poolName: vlanPool.name })
    }
  }

  return {
    vlanString: vlanId,
    vlanType: VlanType.VLAN,
    vlanText: $t(vlanContents.vlan, { isCustom, id: vlanId })
  }
}

export const getVlanPool = (apgroup: NetworkApGroup, wlan?: NetworkSaveData['wlan'], vlanPoolSelectOptions?: VlanPool[]) => {
  return apgroup.vlanPoolId
    ? {
      name: vlanPoolSelectOptions?.find((vlanPool) => vlanPool.id === apgroup?.vlanPoolId)?.name || '',
      id: apgroup.vlanPoolId,
      vlanMembers: []
    }
    : wlan?.advancedCustomization?.vlanPool
}

const radioTypeEnumToRadioEnum = (radioTypes: RadioTypeEnum[]) => {
  if (radioTypes.includes(RadioTypeEnum._2_4_GHz) && radioTypes.includes(RadioTypeEnum._5_GHz)) {
    return RadioEnum.Both
  } else {
    const radioEnum = [RadioEnum._2_4_GHz, RadioEnum._5_GHz]
    return radioEnum[findIndex([RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz], (r)=>radioTypes.includes(r))]
  }
}

export const aggregateApGroupPayload = (info: FormFinishInfo, oldData?: NetworkVenue, keepApGroupBasicData?: boolean) => {
  const { selectionType, allApGroupsRadioTypes, apgroups } = info.values

  let newData = {
    isAllApGroups: selectionType === 0
  }

  if (newData.isAllApGroups) {
    assign(newData, {
      allApGroupsRadio: radioTypeEnumToRadioEnum(allApGroupsRadioTypes),
      allApGroupsRadioTypes: allApGroupsRadioTypes,
      apGroups: []
    })
  } else {
    assign(newData, {
      apGroups: (apgroups || []).filter((ag:{ selected: boolean }) => ag.selected).map((editedApGroup: NetworkApGroup) => {
        const currentApGroup = (oldData?.apGroups || []).find((ag) => ag.apGroupId === editedApGroup.apGroupId)
        let ret = { ...currentApGroup }
        const { apGroupId, radioTypes, vlanPoolId, vlanId } = editedApGroup

        ret.apGroupId = apGroupId
        ret.radioTypes = radioTypes
        ret.radio = radioTypes ? radioTypeEnumToRadioEnum(radioTypes) : RadioEnum.Both
        if (vlanPoolId) {
          ret.vlanPoolId = vlanPoolId
          delete ret.vlanId
        } else {
          ret.vlanId = vlanId
          delete ret.vlanPoolName
          delete ret.vlanPoolId
        }

        if (keepApGroupBasicData) { //For Networkform > Venues page
          const { isDefault, apGroupName } = editedApGroup
          ret.isDefault = isDefault
          if (!isDefault) {
            ret.apGroupName = apGroupName
          }
        }

        return ret
      })
    })
  }

  return { ...oldData, ...newData }
}
