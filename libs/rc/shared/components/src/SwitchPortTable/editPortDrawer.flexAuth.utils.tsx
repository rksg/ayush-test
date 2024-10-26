import { FormInstance } from 'antd'
import _                from 'lodash'

import {
  Descriptions
} from '@acx-ui/components'
import {
  FlexAuthMessages,
  FlexAuthVlanLabel,
  FlexibleAuthentication,
  SwitchDefaultVlan,
  SwitchPortViewModel,
  PortSettingModel
} from '@acx-ui/rc/utils'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import {
  authenticationTypeLabel,
  authFailActionTypeLabel,
  authTimeoutActionTypeLabel,
  portControlTypeLabel
} from '../FlexibleAuthentication'

import {
  shouldRenderMultipleText
} from './editPortDrawer.utils'
import * as UI from './styledComponents'

/* eslint-disable max-len */
export interface AggregatePortSettings {
  taggedVlans: Record<string, string[]>
  untaggedVlan: Record<string, string[]>
  defaultVlan: Record<string, number | undefined>

  hasMultipleValue: string[]
  selectedPortIdentifier: Record<string, string[]>

  enableAuthPorts: Record<string, string[]>
  profileAuthDefaultVlan: Record<string, number | undefined>
  guestVlan: Record<string, number | undefined>
  restrictedVlan: Record<string, number | undefined>
  criticalVlan: Record<string, number | undefined>
  switchLevelAuthDefaultVlan: Record<string, number | undefined>
}

export const aggregatePortSettings = (
  portsSetting: PortSettingModel[],
  switchesDefaultVlan?: SwitchDefaultVlan[],
  hasMultipleValue?: string[]
): AggregatePortSettings => {
  // console.log('portsSetting: ', portsSetting)
  const initialData: AggregatePortSettings = {
    taggedVlans: {},
    untaggedVlan: {},
    defaultVlan: {},
    guestVlan: {},
    restrictedVlan: {},
    criticalVlan: {},
    switchLevelAuthDefaultVlan: {},
    hasMultipleValue: [],
    selectedPortIdentifier: {},
    enableAuthPorts: {},
    profileAuthDefaultVlan: {}
  }

  // const addUniqueToArray = (array: Array<string | Number>, item: string | Number) =>
  //   array.includes(item as typeof array[number]) ? array : [...array, item]

  return portsSetting.reduce((result, {
    switchMac, port, taggedVlans = [], untaggedVlan = '',
    switchLevelAuthDefaultVlan, guestVlan, profileAuthDefaultVlan, enableAuthPorts,
    restrictedVlan, criticalVlan
  }) => {
    const index = switchMac as string
    const untagged = untaggedVlan as string

    if (taggedVlans) {
      result.taggedVlans[index] = _.uniq(
        (result.taggedVlans[index] || []).concat(taggedVlans)
      )
    }

    if (untaggedVlan) {
      result.untaggedVlan[index] = _.uniq([
        ...(result.untaggedVlan[index] || []),
        untagged
      ])
    }

    result.switchLevelAuthDefaultVlan[index] = switchLevelAuthDefaultVlan
    result.guestVlan[index] = guestVlan
    result.restrictedVlan[index] = restrictedVlan
    result.criticalVlan[index] = criticalVlan
    result.enableAuthPorts[index] = enableAuthPorts ?? []
    result.hasMultipleValue = hasMultipleValue ?? []
    result.profileAuthDefaultVlan[index] = profileAuthDefaultVlan

    result.defaultVlan[index] = switchesDefaultVlan
      ?.find((s) => s.switchId === switchMac)?.defaultVlanId

    result.selectedPortIdentifier[index] = _.uniq([
      ...(result.selectedPortIdentifier[index] || []),
      port
    ])

    return result

  }, initialData)
}

export const renderAuthProfile = (data?: FlexibleAuthentication) => {
  const { $t } = getIntl()
  return <UI.Card type='solid-bg'>
    <UI.Descriptions layout='vertical' colon={false} labelWidthPercent={100}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Type' })}
        children={data?.authenticationType
          ? $t(authenticationTypeLabel[data.authenticationType as keyof typeof authenticationTypeLabel])
          : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: '802.1x Port Control' })}
        children={data?.dot1xPortControl
          ? $t(portControlTypeLabel[data.dot1xPortControl as keyof typeof portControlTypeLabel])
          : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Auth Default VLAN' })}
        children={data?.authDefaultVlan ?? noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Fail Action' })}
        children={data?.authFailAction
          ? $t(authFailActionTypeLabel[data.authFailAction as keyof typeof authFailActionTypeLabel])
          : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Restricted VLAN' })}
        children={data?.restrictedVlan ?? noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Timeout Action' })}
        children={data?.authTimeoutAction
          ? $t(authTimeoutActionTypeLabel[data.authTimeoutAction as keyof typeof authTimeoutActionTypeLabel])
          : noDataDisplay
        }
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Critical VLAN' })}
        children={data?.criticalVlan ?? noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'Guest VLAN' })}
        children={data?.guestVlan ?? noDataDisplay}
      />
    </UI.Descriptions>
  </UI.Card>
}

export const getUnionValuesByKey = (
  key: keyof AggregatePortSettings,
  aggregateData: AggregatePortSettings
) => {
  const values = Object.values(aggregateData[key] ?? {})
  return _.uniq(_.flatten(values))
}

export const getFlexAuthButtonStatus = (props: {
  aggregateData: AggregatePortSettings,
  form: FormInstance,
  hasMultipleValue: string[],
  isCloudPort: boolean,
  isMultipleEdit: boolean,
  isFirmwareAbove10010f: boolean,
  portVlansCheckbox: boolean
}) => {
  const {
    isMultipleEdit, isCloudPort, isFirmwareAbove10010f,
    aggregateData, portVlansCheckbox, hasMultipleValue, form
  } = props

  const checkUntaggedPortMismatch = (id: string) => {
    const defaultVlan = aggregateData?.defaultVlan?.[id]
    const untaggedVlan = getCurrentVlansByKey({
      key: 'untaggedVlan', aggregateData, isMultipleEdit, portVlansCheckbox, hasMultipleValue, form
    })
    return untaggedVlan && Number(untaggedVlan) !== Number(defaultVlan)
  }

  const aggregateUntaggedVlan = aggregateData.untaggedVlan
  const switchIds = Object.keys(aggregateUntaggedVlan ?? {})
  const isUntaggedPort = switchIds.some(id => checkUntaggedPortMismatch(id))

  if (!isFirmwareAbove10010f) {
    return 'ONLY_SUPPORT_FW_ABOVE_10010F'
  } else if (isCloudPort) {
    return 'CLOUD_PORT_CANNOT_ENABLE_FLEX_AUTH'
  } else if (isUntaggedPort) {
    const isFlexAuthEnabled = form.getFieldValue('flexibleAuthenticationEnabled')
    const relatedFields = [
      'flexibleAuthenticationEnabled', 'authenticationProfileId', 'profileAuthDefaultVlan',
      'authenticationType', 'changeAuthOrder', 'dot1xPortControl', 'authDefaultVlan',
      'restrictedVlan', 'criticalVlan', 'authFailAction', 'authTimeoutAction', 'guestVlan'
    ]
    if (isFlexAuthEnabled) {
      form.setFieldsValue({
        ...form.getFieldsValue(),
        flexibleAuthenticationEnabled: false,
        ...(relatedFields.reduce((result, key) => {
          return {
            ...result,
            [`${key}Checkbox`]: false
          }
        }, {}))
      })
    }
    return 'UNTAGGED_PORT_CANNOT_ENABLE_FLEX_AUTH'
  }
  return ''
}

export const getAppliedProfile = (
  profiles: FlexibleAuthentication[],
  profileId: string
) => {
  const profile = profiles.find(p => p.id === profileId)
  return _.omit(profile, ['profileName', 'id'])
}

export const checkAllSelectedPortsMatch = (
  selectedPorts: SwitchPortViewModel[],
  aggregateData: AggregatePortSettings
) => {
  const isAllPortsMatch = selectedPorts.every(port => {
    const { selectedPortIdentifier, enableAuthPorts } = aggregateData
    const sortedSelectedPorts = (selectedPortIdentifier[port.switchMac] || []).sort()
    const sortedAuthPorts = (enableAuthPorts[port.switchMac] || []).sort()
    return _.intersection(sortedSelectedPorts, sortedAuthPorts)?.length > 0
  })

  return isAllPortsMatch
}

export const getCurrentVlansByKey = (props: {
  key: keyof AggregatePortSettings,
  aggregateData: AggregatePortSettings,
  isMultipleEdit: boolean,
  portVlansCheckbox: boolean,
  hasMultipleValue: string[],
  form: FormInstance
}): number[] => {
  const { key, aggregateData, isMultipleEdit, portVlansCheckbox, hasMultipleValue, form } = props
  const isMultipleValues = aggregateData?.hasMultipleValue?.includes(key)
  const originalVlans = getUnionValuesByKey(key, aggregateData)
  const fieldValue = form.getFieldValue(key)
  const overrideValue = typeof fieldValue === 'string'
    ? fieldValue.split(',')
    : typeof fieldValue === 'number' ? fieldValue.toString().split(',') : fieldValue

  const getCurrentVlans = () => {
    if (isMultipleEdit) {
      const isOverrideField
          = portVlansCheckbox && !shouldRenderMultipleText({
            field: key, isMultipleEdit, hasMultipleValue, form, ignoreCheckbox: true
          })
      if (isMultipleValues) {
        return isOverrideField ? overrideValue : originalVlans
      }
      return isOverrideField ? overrideValue : originalVlans
    }
    return overrideValue
  }
  const currentVlans:string[] = getCurrentVlans()

  return currentVlans?.filter(v => v)?.map(v => Number(v))
}

export const validateApplyProfile = (
  value: string,
  authProfiles: FlexibleAuthentication[],
  selectedPorts: SwitchPortViewModel[],
  aggregateData: AggregatePortSettings
) => {
  const { $t } = getIntl()
  const profile = authProfiles.find(p => p.id === value)

  const allSelectedPortsMatch = checkAllSelectedPortsMatch(selectedPorts, aggregateData)
  const guestVlans = getUnionValuesByKey('guestVlan', aggregateData)
  const profileDefaultVlans = getUnionValuesByKey('profileAuthDefaultVlan', aggregateData)
  const switchDefaultVlans = getUnionValuesByKey('defaultVlan', aggregateData)
  const switchAuthDefaultVlans = getUnionValuesByKey('switchLevelAuthDefaultVlan', aggregateData)
  const taggedVlans = getUnionValuesByKey('taggedVlans', aggregateData)

  const isDefaultVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.authDefaultVlan)
  const isDefaultVlanDuplicateWithTagged = taggedVlans.includes(profile?.authDefaultVlan.toString())
  const isCriticalVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.criticalVlan)
  const isRestrictedVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.restrictedVlan)
  const isCriticalVlanDuplicateWithSwitchAuth = switchAuthDefaultVlans.includes(profile?.criticalVlan)
  const isRestrictedVlanDuplicateWithSwitchAuth = switchAuthDefaultVlans.includes(profile?.restrictedVlan)


  // TODO:
  // const statusMapping = {
  //   isDefaultVlanMismatch: () => {
  //     return $t(FlexAuthMessages.CANNOT_SET_DIFF_PROFILE_AUTH_DEFAULT_VLAN, {
  //       profileAuthDefaultVlan: profileDefaultVlans,
  //       applyProfileAuthDefaultVlan: profile?.authDefaultVlan
  //     });
  //   }
  // }

  if (!allSelectedPortsMatch) {
    const isDefaultVlanMismatch = profileDefaultVlans.length > 1 || !profileDefaultVlans.includes(profile?.authDefaultVlan)
    const isGuestVlanMismatch = profile?.guestVlan && (guestVlans.length > 1 || !guestVlans.includes(profile?.guestVlan))

    if (isDefaultVlanMismatch) {
      return Promise.reject(
        $t(FlexAuthMessages.CANNOT_SET_DIFF_PROFILE_AUTH_DEFAULT_VLAN, {
          profileAuthDefaultVlan: profileDefaultVlans.sort().join(','), //TODO
          applyProfileAuthDefaultVlan: profile?.authDefaultVlan
        })
      )
    } else if (isGuestVlanMismatch) {
      return Promise.reject(
        $t(FlexAuthMessages.CANNOT_SET_DIFF_GUEST_VLAN, {
          applyGuestVlan: profile?.guestVlan
        })
      )
    }
  } else if (isDefaultVlanDuplicateWithSwitch) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.DEFAULT_VLAN)
    }))
  } else if (isDefaultVlanDuplicateWithTagged) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.TAGGED_VLANS)
    }))
  } else if (isCriticalVlanDuplicateWithSwitch) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.CRITICAL_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.DEFAULT_VLAN)
    }))
  } else if (isRestrictedVlanDuplicateWithSwitch) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.RESTRICTED_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.DEFAULT_VLAN)
    }))
  } else if (isCriticalVlanDuplicateWithSwitchAuth) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.CRITICAL_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.SWITCH_AUTH_DEFAULT_VLAN)
    }))
  } else if (isRestrictedVlanDuplicateWithSwitchAuth) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.RESTRICTED_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.SWITCH_AUTH_DEFAULT_VLAN)
    }))
  }

  return Promise.resolve()
}

export const validateVlanDiffFromSwitchDefault = (
  value: string,
  aggregateData: AggregatePortSettings
) => {
  const { $t } = getIntl()
  const switchDefaultVlans = getUnionValuesByKey('defaultVlan', aggregateData)
  if (switchDefaultVlans.includes(Number(value))) {
    return Promise.reject(
      $t(FlexAuthMessages.CANNOT_SAME_AS_SWITCH_DEFAULT_VLAN)
    )
  }
  return Promise.resolve()
}

export const validateVlanDiffFromSwitchAuthDefault = (
  value: string,
  aggregateData: AggregatePortSettings
) => {
  const { $t } = getIntl()
  const switchAuthDefaultVlans = getUnionValuesByKey('switchLevelAuthDefaultVlan', aggregateData)
  if (switchAuthDefaultVlans.includes(Number(value))) {
    return Promise.reject(
      $t(FlexAuthMessages.CANNOT_SAME_AS_SWITCH_LEVEL_AUTH_DEFAULT_VLAN)
    )
  }
  return Promise.resolve()
}

// export const validateVlanDiffFromTagged = (
//   value: string,
//   authDefaultVlan: string
// ) => {
//   const { $t } = getIntl()
//   const taggedVlanArray = taggedVlans?.split(',')
//   if (taggedVlanArray.includes(value)) {
//     return Promise.reject(
//       $t(FlexAuthMessages.CANNOT_SAME_AS_TAGGED_VLAN)
//     )
//   }
//   return Promise.resolve()
// }

export const validateVlanConsistencyWithGuestVlan = (
  value: string,
  selectedPorts: SwitchPortViewModel[],
  aggregateData: AggregatePortSettings
) => {
  const { $t } = getIntl()
  const allSelectedPortsMatch = checkAllSelectedPortsMatch(selectedPorts, aggregateData)
  const guestVlans = getUnionValuesByKey('guestVlan', aggregateData)

  if (value && !allSelectedPortsMatch && (guestVlans.length > 1 || !guestVlans.includes(Number(value)))) {
    return Promise.reject(
      $t(FlexAuthMessages.CANNOT_SET_DIFF_GUEST_VLAN, { applyGuestVlan: 0 }) //TODO
    )
  }
  return Promise.resolve()
}

