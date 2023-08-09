import _                 from 'lodash'
import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import {
  NetworkApGroup,
  NetworkVenue,
  RadioEnum,
  RadioTypeEnum,
  VlanPool,
  VlanType
} from '../../'

import type { FormFinishInfo } from 'rc-field-form/es/FormContext'

/* eslint-disable max-len */

export const vlanContents = {
  vlan: defineMessage({
    defaultMessage: `VLAN-{id} {isCustom, selectordinal,
      one {(Custom)}
      other {(Default)}
    }`,
    description: 'Translation not needed'
  }),
  vlanPool: defineMessage({
    defaultMessage: `VLAN Pool: {poolName} {isCustom, selectordinal,
      one {(Custom)}
      other {(Default)}
    }`,
    description: 'Translation string - VLAN Pool'
  })
}

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

const radioTypeEnumToRadioEnum = (radioTypes: RadioTypeEnum[]) => {
  if (radioTypes.includes(RadioTypeEnum._2_4_GHz) && radioTypes.includes(RadioTypeEnum._5_GHz)) {
    return RadioEnum.Both
  } else {
    const radioEnum = [RadioEnum._2_4_GHz, RadioEnum._5_GHz]
    return radioEnum[_.findIndex([RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz], (r)=>radioTypes.includes(r))]
  }
}

export const aggregateApGroupPayload = (info: FormFinishInfo, oldData?: NetworkVenue, keepApGroupBasicData?: boolean) => {
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
          delete ret.vlanId
        } else {
          ret.vlanId = editedApGroup.vlanId
          delete ret.vlanPoolName
          delete ret.vlanPoolId
        }

        if (keepApGroupBasicData) { //For Networkform > Venues page
          ret.isDefault = editedApGroup.isDefault
          if(!editedApGroup.isDefault) {
            ret.apGroupName = editedApGroup.apGroupName
          }
        }

        return ret
      })
    })
  }

  return { ...oldData, ...newData }
}
