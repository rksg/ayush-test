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
  AuthenticationType,
  authenticationTypeLabel,
  AuthFailAction,
  authFailActionTypeLabel,
  AuthTimeoutAction,
  authTimeoutActionTypeLabel,
  checkVlanDiffFromTargetVlan,
  PortControl,
  portControlTypeLabel
} from '../FlexibleAuthentication'

import {
  getDefaultVlanMapping,
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
  authenticationProfileId: Record<string, string | undefined>
  switchLevelAuthDefaultVlan: Record<string, number | undefined>
  guestVlan: Record<string, number | undefined>
  authDefaultVlan: Record<string, number[]>
  // authDefaultVlan2: Record<string, Record<string, number[]>>
  restrictedVlan: Record<string, number | undefined>
  criticalVlan: Record<string, number | undefined>
  shouldAlertAaaAndRadiusNotApply: boolean
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
    hasMultipleValue: [],
    selectedPortIdentifier: {},
    enableAuthPorts: {},
    profileAuthDefaultVlan: {},
    authenticationProfileId: {},
    switchLevelAuthDefaultVlan: {},
    guestVlan: {},
    authDefaultVlan: {},
    // authDefaultVlan2: {}, //TODO
    restrictedVlan: {},
    criticalVlan: {},
    shouldAlertAaaAndRadiusNotApply: false
  }

  const updateResult = <T extends string | number | Number>(
    result: Record<string, T[]>,
    index: string,
    value: T | T[],
    enforceUnique = true
  ) => {
    const newValue = Array.isArray(value) ? value : [value]
    const updatedValues = [...(result[index] || []), ...newValue]
    result[index] = enforceUnique ? _.uniq(updatedValues) : updatedValues
    return result[index]
  }

  return portsSetting.reduce((result, {
    switchMac, port, taggedVlans = [], untaggedVlan = '',
    switchLevelAuthDefaultVlan, guestVlan, authDefaultVlan, restrictedVlan, criticalVlan,
    profileAuthDefaultVlan, authenticationProfileId,
    enableAuthPorts, shouldAlertAaaAndRadiusNotApply
  }) => {
    const index = switchMac as string
    result.taggedVlans[index] = updateResult(result.taggedVlans, index, taggedVlans)
    result.untaggedVlan[index] = updateResult(result.untaggedVlan, index, untaggedVlan as string)

    if (authDefaultVlan)
      result.authDefaultVlan[index] = updateResult(result.authDefaultVlan, index, authDefaultVlan, false)
    if (switchLevelAuthDefaultVlan) result.switchLevelAuthDefaultVlan[index] = switchLevelAuthDefaultVlan
    if (guestVlan) result.guestVlan[index] = guestVlan
    if (restrictedVlan) result.restrictedVlan[index] = restrictedVlan
    if (criticalVlan) result.criticalVlan[index] = criticalVlan
    if (profileAuthDefaultVlan) result.profileAuthDefaultVlan[index] = profileAuthDefaultVlan
    if (authenticationProfileId) result.authenticationProfileId[index] = authenticationProfileId
    if (shouldAlertAaaAndRadiusNotApply) result.shouldAlertAaaAndRadiusNotApply = true

    result.hasMultipleValue = hasMultipleValue ?? []
    result.selectedPortIdentifier[index] = updateResult(result.selectedPortIdentifier, index, port)
    result.enableAuthPorts[index] = enableAuthPorts ?? []
    result.defaultVlan[index] = switchesDefaultVlan
      ?.find((s) => s.switchId === switchMac)?.defaultVlanId

    return result

  }, initialData)
}

export const renderAuthProfile = (data?: FlexibleAuthentication) => {
  const { $t } = getIntl()
  return <div data-testid='auth-profile-card'>
    <UI.Card type='solid-bg'>
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
          children={!!data?.restrictedVlan ? data?.restrictedVlan : noDataDisplay}
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
          children={!!data?.criticalVlan ? data?.criticalVlan : noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Guest VLAN' })}
          children={!!data?.guestVlan ? data?.guestVlan : noDataDisplay}
        />
      </UI.Descriptions>
    </UI.Card>
  </div>
}

export const getFlexAuthDefaultValue = (
  portSetting: Partial<PortSettingModel>,
  hasMultipleValueFields?: string[]
) => {
  const defaultValue = {
    authenticationProfileId: '',
    authenticationCustomize: false,
    flexibleAuthenticationEnabled: false,
    authenticationType: AuthenticationType._802_1X,
    changeAuthOrder: false,
    dot1xPortControl: PortControl.AUTO,
    authDefaultVlan: '',
    restrictedVlan: '',
    criticalVlan: '',
    authFailAction: AuthFailAction.BLOCK,
    authTimeoutAction: AuthTimeoutAction.NONE,
    guestVlan: '',
    authenticationProfileIdCheckbox: false,
    authenticationTypeCheckbox: false,
    dot1xPortControlCheckbox: false,
    authDefaultVlanCheckbox: false
  }

  const checkValueEqual = (key: string, portSetting: Partial<PortSettingModel>) => {
    const fieldKey = key as keyof typeof portSetting
    return !hasMultipleValueFields?.includes(key) && (portSetting[fieldKey] !== undefined)
  }

  const isAllPortsEnabledAuth = portSetting?.flexibleAuthenticationEnabled
    && !hasMultipleValueFields?.includes('flexibleAuthenticationEnabled')

  const handleField = (key: string) => {
    const fieldKey = key as keyof typeof portSetting
    const isValueEqual = checkValueEqual(key, portSetting)

    if (key === 'authenticationProfileId' && isValueEqual) {
      const authenticationCustomize = portSetting?.authenticationCustomize
      const isCustomized = checkValueEqual('authenticationCustomize', portSetting) && authenticationCustomize
      return isCustomized ? '' : portSetting[fieldKey]
    }

    return isValueEqual
      ? portSetting[fieldKey]
      : defaultValue[key as keyof typeof defaultValue]
  }

  return Object.keys(defaultValue).reduce((result: FlexibleAuthentication, key: string) => {
    return {
      ...result,
      [key]: key.includes('Checkbox') ? !isAllPortsEnabledAuth : handleField(key)
    }
  }, {} as FlexibleAuthentication)
}

export const getUnionValuesByKey = (
  key: keyof AggregatePortSettings,
  aggregateData: AggregatePortSettings
) => {
  // const values = key === 'authDefaultVlan2'
  //   ? Object.values(aggregateData[key] ?? {}).flatMap(Object.values)
  //   : Object.values(aggregateData[key] ?? {})
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
    // const untaggedVlan = aggregateData?.untaggedVlan?.[id] //TODO
    const untaggedVlan = getCurrentVlansByKey({
      key: 'untaggedVlan', switchId: id, aggregateData,
      isMultipleEdit, portVlansCheckbox, hasMultipleValue, form
    })
    return !!untaggedVlan?.length && Number(untaggedVlan[0]) !== Number(defaultVlan)
  }

  const aggregateUntaggedVlan = aggregateData.untaggedVlan
  const switchIds = Object.keys(aggregateUntaggedVlan ?? {})
  const isUntaggedPort = switchIds.some(id => checkUntaggedPortMismatch(id))

  if (!isFirmwareAbove10010f) {
    return 'ONLY_SUPPORT_FW_ABOVE_10010F'
  } else if (isCloudPort) {
    return 'CLOUD_PORT_CANNOT_ENABLE_FLEX_AUTH'
  } else if (isUntaggedPort) {
    return 'UNTAGGED_PORT_CANNOT_ENABLE_FLEX_AUTH'
  }
  return ''
}

export const getAppliedProfile = (
  profiles: FlexibleAuthentication[],
  profileId: string
) => {
  const profile = profiles.find(p => p.id === profileId)
  const appliedProfile = {
    // need set some default values for API data
    changeAuthOrder: false,
    dot1xPortControl: profile?.authenticationType === AuthenticationType.MACAUTH ? '' : PortControl.AUTO,
    restrictedVlan: '',
    criticalVlan: '',
    guestVlan: '',
    ...profile
  } as FlexibleAuthentication
  return _.omit(appliedProfile, ['profileName', 'id'])
}

export const getCurrentAuthDefaultVlan = (props: {
  flexibleAuthenticationEnabled: boolean,
  isAppliedAuthProfile: boolean,
  authProfiles: FlexibleAuthentication[],
  authenticationProfileId: string,
  authDefaultVlan: string
}) => {
  const {
    flexibleAuthenticationEnabled, isAppliedAuthProfile,
    authProfiles, authenticationProfileId, authDefaultVlan
  } = props

  return flexibleAuthenticationEnabled
    ? (isAppliedAuthProfile
      ? getAppliedProfile(authProfiles, authenticationProfileId)?.authDefaultVlan
      : authDefaultVlan
    )
    : ''
}

export const getCurrentVlansByKey = (props: {
  key: 'untaggedVlan' | 'taggedVlans',
  aggregateData: AggregatePortSettings,
  isMultipleEdit: boolean,
  portVlansCheckbox: boolean,
  hasMultipleValue: string[],
  switchId?: string,
  form: FormInstance
}): number[] => {
  const { key, aggregateData, isMultipleEdit,
    portVlansCheckbox, hasMultipleValue, switchId = '', form
  } = props

  const isGetVlansBySwitch = !!switchId
  const defaultVlanMap = { [switchId]: aggregateData.defaultVlan?.[switchId] } as Record<string, number>
  const originalVlans = isGetVlansBySwitch
    ? aggregateData[key]?.[switchId] : getUnionValuesByKey(key, aggregateData)

  const fieldValue = isNaN(form.getFieldValue(key)) ? '' : form.getFieldValue(key)
  const transformedFieldValue = key === 'taggedVlans'
    // untagged vlan might be 'Default VLAN (Multiple values)'
    ? fieldValue : (getDefaultVlanMapping(key, switchId, defaultVlanMap, fieldValue)?.untaggedVlan || fieldValue)

  const overrideValue = typeof transformedFieldValue === 'string'
    ? transformedFieldValue.split(',')
    : (typeof transformedFieldValue === 'number' ? transformedFieldValue.toString().split(',') : transformedFieldValue)

  const getCurrentVlans = () => {
    if (isMultipleEdit) {
      const isOverrideField = portVlansCheckbox && !shouldRenderMultipleText({
        field: key, isMultipleEdit, hasMultipleValue, form, ignoreCheckbox: true
      })
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
  // const taggedVlans = getUnionValuesByKey('taggedVlans', aggregateData)

  const isDefaultVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.authDefaultVlan)
  // const isDefaultVlanDuplicateWithTagged = taggedVlans.includes(profile?.authDefaultVlan.toString())
  const isCriticalVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.criticalVlan)
  const isRestrictedVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.restrictedVlan)

  const isCriticalVlanDuplicateWithSwitchAuth = switchAuthDefaultVlans.includes(profile?.criticalVlan)
  const isRestrictedVlanDuplicateWithSwitchAuth = switchAuthDefaultVlans.includes(profile?.restrictedVlan)
  const isGuestVlanDuplicateWithSwitchAuth = switchAuthDefaultVlans.includes(profile?.guestVlan)

  const isForceTypeProfile = profile?.dot1xPortControl === PortControl.FORCE_AUTHORIZED
  || profile?.dot1xPortControl === PortControl.FORCE_UNAUTHORIZED

  const isAuthDefaultVlanMismatch = isForceTypeProfile
  && (switchAuthDefaultVlans?.length > 1 || !switchAuthDefaultVlans?.includes(profile?.authDefaultVlan))

  if (!allSelectedPortsMatch) {
    const isDefaultVlanMismatch = !!profileDefaultVlans.length
      && (profileDefaultVlans.length > 1 || !profileDefaultVlans.includes(profile?.authDefaultVlan))
    const isGuestVlanMismatch = !!guestVlans.length
      && (guestVlans.length > 1 || !profile?.guestVlan || !guestVlans.includes(profile?.guestVlan))

    if (isDefaultVlanMismatch) {
      return Promise.reject(
        $t(FlexAuthMessages.CANNOT_SET_DIFF_PROFILE_AUTH_DEFAULT_VLAN, {
          applyProfileAuthDefaultVlan: profile?.authDefaultVlan
        })
      )
    } else if (isGuestVlanMismatch) {
      return Promise.reject(
        $t(FlexAuthMessages.CANNOT_SET_DIFF_GUEST_VLAN_FOR_PROFILE, {
          guestVlan: guestVlans.sort().join(', ')
        })
      )
    } else if (isAuthDefaultVlanMismatch) {
      //TODO: checking wording with UX
      return Promise.reject(
        $t({ defaultMessage: 'If the port control type is either Force Authorized or Force Unauthorized, the Auth-Default VLAN must be the same as the Auth Default VLAN setting at the switch level for all switches.' })
      )
    }
  }

  if (isDefaultVlanDuplicateWithSwitch) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.DEFAULT_VLAN)
    }))
  // } else if (isDefaultVlanDuplicateWithTagged) {
  //   return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
  //     sourceVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN),
  //     targetVlan: $t(FlexAuthVlanLabel.TAGGED_VLANS)
  //   }))
  } else if (isAuthDefaultVlanMismatch) {
    //TODO: checking wording with UX
    return Promise.reject(
      $t({ defaultMessage: 'If the port control type is either Force Authorized or Force Unauthorized, the Auth-Default VLAN must be the same as the Auth Default VLAN setting at the switch level for all switches.' })
    )
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
  } else if (isGuestVlanDuplicateWithSwitchAuth) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.GUEST_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.SWITCH_AUTH_DEFAULT_VLAN)
    }))
  }

  return Promise.resolve()
}

export const checkAllSelectedPortsMatch = (
  selectedPorts: SwitchPortViewModel[],
  aggregateData: AggregatePortSettings
) => {
  return selectedPorts.every(port => {
    const { selectedPortIdentifier, enableAuthPorts } = aggregateData
    const selectedPorts = selectedPortIdentifier[port.switchMac]
    const authPorts = enableAuthPorts[port.switchMac]
    return !authPorts?.length || _.intersection(selectedPorts, authPorts)?.length === authPorts?.length
  })
}

export const checkVlanDiffFromSwitchDefaultVlan = (
  value: string,
  aggregateData: AggregatePortSettings
) => {
  const { $t } = getIntl()
  const switchDefaultVlans = getUnionValuesByKey('defaultVlan', aggregateData)
  if (value && switchDefaultVlans.includes(Number(value))) {
    return Promise.reject(
      $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
        sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
        targetVlan: $t(FlexAuthVlanLabel.DEFAULT_VLAN)
      })
    )
  }
  return Promise.resolve()
}

export const checkVlanDiffFromSwitchAuthDefaultVlan = (
  value: string,
  aggregateData: AggregatePortSettings
) => {
  const { $t } = getIntl()
  const switchAuthDefaultVlans = getUnionValuesByKey('switchLevelAuthDefaultVlan', aggregateData)
  if (value && switchAuthDefaultVlans.includes(Number(value))) {
    return Promise.reject(
      $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
        sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
        targetVlan: $t(FlexAuthVlanLabel.SWITCH_AUTH_DEFAULT_VLAN)
      })
    )
  }
  return Promise.resolve()
}

export const checkVlanDiffFromAuthDefaultVlan = (
  value: string,
  aggregateData: AggregatePortSettings
) => {
  const { $t } = getIntl()
  const authDefaultVlans = getUnionValuesByKey('authDefaultVlan', aggregateData)
  if (value && authDefaultVlans.includes(Number(value))) {
    return Promise.reject(
      $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
        sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
        targetVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN)
      })
    )
  }
  return Promise.resolve()
}

export const checkGuestVlanConsistency = (
  value: string,
  selectedPorts: SwitchPortViewModel[],
  aggregateData: AggregatePortSettings
) => {
  const { $t } = getIntl()
  const allSelectedPortsMatch = checkAllSelectedPortsMatch(selectedPorts, aggregateData)
  const guestVlans = getUnionValuesByKey('guestVlan', aggregateData)
  const hasAssignedGuestVlan = !!guestVlans.length
  const isGuestVlanNotConsistent = guestVlans.length > 1 || !guestVlans.includes(Number(value))

  if (!allSelectedPortsMatch && hasAssignedGuestVlan && isGuestVlanNotConsistent) {
    return Promise.reject(
      $t(FlexAuthMessages.CANNOT_SET_DIFF_GUEST_VLAN, { guestVlan: guestVlans.sort().join(', ') })
    )
  }
  return Promise.resolve()
}

export const checkMultipleVlansDifferences = async (props: {
  field: keyof AggregatePortSettings,
  aggregateData: AggregatePortSettings,
  selectedPorts: SwitchPortViewModel[],
  vlanType: string,
  isMultipleEdit: boolean,
  form: FormInstance
}) => {
  const { $t } = getIntl()
  const { field, aggregateData, selectedPorts, vlanType, isMultipleEdit, form } = props
  const vlans = getUnionValuesByKey(field, aggregateData)

  const isOverrideAuthDefaultVlan = isMultipleEdit && form.getFieldValue('authDefaultVlanCheckbox')
  const authDefaultVlan = form.getFieldValue('authDefaultVlan')

  try {
    await Promise.all(
      vlans.map(vlan =>
        Promise.all([
          ...( field === 'guestVlan'
            ? [ checkGuestVlanConsistency(vlan, selectedPorts, aggregateData) ]
            : []
          ),
          checkVlanDiffFromSwitchDefaultVlan(vlan, aggregateData),
          checkVlanDiffFromSwitchAuthDefaultVlan(vlan, aggregateData),
          (isOverrideAuthDefaultVlan
            ? checkVlanDiffFromTargetVlan(
              vlan, authDefaultVlan,
              $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
                sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
                targetVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN)
              })
            )
            : checkVlanDiffFromAuthDefaultVlan(vlan, aggregateData)
          )
        ])
      )
    )
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(
      //TODO: checking wording with UX
      new Error($t({ defaultMessage: 'Please enter {vlanType}' }, { vlanType: vlanType }))
    )
  }
}

export const isOverrideFieldNotChecked = (props: {
  field: string,
  isMultipleEdit: boolean,
  hasMultipleValue: string[],
  form: FormInstance
}) => {
  const { field, isMultipleEdit, hasMultipleValue, form } = props
  const checkboxEnabled = form.getFieldValue(`${field}Checkbox`)

  return isMultipleEdit
    && hasMultipleValue.includes(field)
    && !checkboxEnabled
}

export const handleClickCustomize = (props: {
  selectedPorts: SwitchPortViewModel[],
  authenticationCustomize: boolean,
  isMultipleEdit: boolean,
  authenticationProfileId?: string,
  authProfiles: FlexibleAuthentication[],
  aggregateData: AggregatePortSettings,
  form: FormInstance,
}) => {
  const {
    authenticationCustomize, isMultipleEdit, aggregateData,
    authenticationProfileId, authProfiles, selectedPorts, form
  } = props

  const toggleCustomized = !authenticationCustomize
  const authDefaultVlan = Object.values(aggregateData.authDefaultVlan).flat()
  const isEitherPortEnabledForFirstTime = selectedPorts?.length > authDefaultVlan?.length

  form.setFieldValue('authenticationCustomize', toggleCustomized)

  if (toggleCustomized) {
    form.setFieldsValue({
      ...form.getFieldsValue(),
      ...(!isMultipleEdit && !authDefaultVlan?.length && authenticationProfileId
        ? getAppliedProfile(authProfiles, authenticationProfileId) : {}
      ),
      ...(isMultipleEdit && isEitherPortEnabledForFirstTime ? {
        authenticationTypeCheckbox: true,
        dot1xPortControlCheckbox: true,
        authDefaultVlanCheckbox: true
      }: {}
      )
    })
  }
}

export const handlePortVlanChange = (props: {
  isFlexAuthButtonDisabled: boolean,
  form: FormInstance,
}) => {
  const { form, isFlexAuthButtonDisabled } = props
  const isFlexAuthEnabled = form.getFieldValue('flexibleAuthenticationEnabled')
  // eslint-disable-next-line max-len
  const isFlexAuthEnabledOverride = form.getFieldValue('flexibleAuthenticationEnabledCheckbox')
  if (isFlexAuthButtonDisabled && (isFlexAuthEnabledOverride || isFlexAuthEnabled)) {
    const resetFieldValues = {
      ...form.getFieldsValue(),
      flexibleAuthenticationEnabled: false,
      flexibleAuthenticationEnabledCheckbox: false
    }
    form.setFieldsValue(resetFieldValues)
  }
}