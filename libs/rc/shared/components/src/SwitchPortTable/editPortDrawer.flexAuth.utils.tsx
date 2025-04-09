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
  restrictedVlan: Record<string, number[]>
  criticalVlan: Record<string, number[]>
  dot1xPortControl: Record<string, string[]>
  shouldAlertAaaAndRadiusNotApply: boolean
  ipsg: Record<string, boolean[]>
}

export const aggregatePortSettings = (
  portsSetting: PortSettingModel[],
  switchesDefaultVlan?: SwitchDefaultVlan[],
  hasMultipleValue?: string[]
): AggregatePortSettings => {
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
    restrictedVlan: {},
    criticalVlan: {},
    dot1xPortControl: {},
    shouldAlertAaaAndRadiusNotApply: false,
    ipsg: {}
  }

  const updateResult = <T extends string | number | Number | boolean>(
    result: Record<string | number, T[]>,
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
    dot1xPortControl, enableAuthPorts, shouldAlertAaaAndRadiusNotApply, ipsg = false
  }) => {
    const index = switchMac as string
    result.taggedVlans[index] = updateResult(result.taggedVlans, index, taggedVlans)
    result.untaggedVlan[index] = updateResult(result.untaggedVlan, index, untaggedVlan as string)
    result.ipsg[index] = updateResult(result.ipsg, index, ipsg)

    if (authDefaultVlan)
      result.authDefaultVlan[index] = updateResult(result.authDefaultVlan, index, authDefaultVlan, false)
    if (switchLevelAuthDefaultVlan) result.switchLevelAuthDefaultVlan[index] = switchLevelAuthDefaultVlan
    if (guestVlan) result.guestVlan[index] = guestVlan
    if (restrictedVlan) updateResult(result.restrictedVlan, index, restrictedVlan)
    if (criticalVlan) updateResult(result.criticalVlan, index, criticalVlan)
    if (dot1xPortControl) updateResult(result.dot1xPortControl, index, dot1xPortControl)
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
          label={$t({ defaultMessage: 'Change Authentication Order' })}
          children={data?.changeAuthOrder
            ? $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })
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
    authenticationProfileId: undefined,
    authenticationCustomize: false,
    flexibleAuthenticationEnabled: false,
    authenticationType: AuthenticationType._802_1X,
    changeAuthOrder: false,
    dot1xPortControl: portSetting?.authenticationType === AuthenticationType.MACAUTH ? '' : PortControl.AUTO,
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

  const checkFieldDefinedAndUnique = (key: string, portSetting: Partial<PortSettingModel>) => {
    const fieldKey = key as keyof typeof portSetting
    return !hasMultipleValueFields?.includes(key) && (portSetting[fieldKey] !== undefined)
  }

  const isAllPortsEnabledAuth = portSetting?.flexibleAuthenticationEnabled
    && !hasMultipleValueFields?.includes('flexibleAuthenticationEnabled')

  const handleField = (key: string) => {
    const fieldKey = key as keyof typeof portSetting
    const isFieldDefinedAndUnique = checkFieldDefinedAndUnique(key, portSetting)

    if (key === 'authenticationProfileId' && isFieldDefinedAndUnique) {
      const authenticationCustomize = portSetting?.authenticationCustomize
      // when profile is applied first and then customized, database retains the original profile ID
      // need to clear the profile ID to avoid display issues
      const isCustomized = checkFieldDefinedAndUnique('authenticationCustomize', portSetting) && authenticationCustomize
      return isCustomized ? undefined : portSetting[fieldKey]
    }

    return isFieldDefinedAndUnique
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
  portVlansCheckbox: boolean,
  ipsgCheckbox: boolean,
  portSecurity: boolean
}) => {
  const {
    isMultipleEdit, isCloudPort, isFirmwareAbove10010f,
    aggregateData, portVlansCheckbox, ipsgCheckbox, portSecurity, hasMultipleValue, form
  } = props

  const checkUntaggedPortMismatch = (id: string) => {
    const defaultVlan = aggregateData?.defaultVlan?.[id]
    const untaggedVlan = getCurrentVlansByKey({
      key: 'untaggedVlan', switchId: id, aggregateData,
      isMultipleEdit, portVlansCheckbox, hasMultipleValue, form
    })
    return !!untaggedVlan?.length && untaggedVlan.find(vlan => Number(vlan) !== Number(defaultVlan))
  }

  const aggregateUntaggedVlan = aggregateData.untaggedVlan
  const switchIds = Object.keys(aggregateUntaggedVlan ?? {})
  const isUntaggedPort = switchIds.some(id => checkUntaggedPortMismatch(id))
  const isEitherPortEnabledIPSG
    = (ipsgCheckbox || !isMultipleEdit || (isMultipleEdit && !hasMultipleValue.includes('ipsg')))
      ? form.getFieldValue('ipsg')
      : hasMultipleValue.includes('ipsg')

  if (!isFirmwareAbove10010f) {
    return 'ONLY_SUPPORT_FW_ABOVE_10010F'
  } else if (isCloudPort) {
    return 'CLOUD_PORT_CANNOT_ENABLE_FLEX_AUTH'
  } else if (isUntaggedPort) {
    return 'UNTAGGED_PORT_CANNOT_ENABLE_FLEX_AUTH'
  } else if (isEitherPortEnabledIPSG) {
    return 'CANNOT_ENABLE_FLEX_AUTH_WHEN_IPSG_ENABLED'
  } else if (portSecurity) {
    return 'CANNOT_ENABLE_FLEX_AUTH_WHEN_PORT_MAC_SECURITY_ENABLED'
  }
  return ''
}

export const getFlexAuthEnabled = (
  aggregateData: AggregatePortSettings,
  isMultipleEdit: boolean,
  flexAuthEnabled: boolean,
  flexibleAuthenticationEnabledCheckbox: boolean
) => {
  const authDefaultVlans = getUnionValuesByKey('authDefaultVlan', aggregateData)
  return flexAuthEnabled
    || (isMultipleEdit && !flexibleAuthenticationEnabledCheckbox && !!authDefaultVlans?.length)
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
  authProfiles: FlexibleAuthentication[],
  authenticationProfileId: string,
  authDefaultVlan: string,
  aggregatePortsData: AggregatePortSettings,
  flexibleAuthenticationEnabled: boolean,
  flexibleAuthenticationEnabledCheckbox: boolean,
  isAppliedAuthProfile: boolean,
  isMultipleEdit: boolean
}) => {
  let authVlans:string[] = []
  const {
    flexibleAuthenticationEnabled, isAppliedAuthProfile,
    isMultipleEdit, flexibleAuthenticationEnabledCheckbox,
    aggregatePortsData, authProfiles, authenticationProfileId, authDefaultVlan
  } = props

  if (isMultipleEdit && !flexibleAuthenticationEnabledCheckbox) {
    const authDefaultVlan = getUnionValuesByKey('authDefaultVlan', aggregatePortsData)?.map(String)
    authVlans = authVlans.concat(authDefaultVlan)
  } else if (flexibleAuthenticationEnabled) {
    if (isAppliedAuthProfile) {
      const authVlan = getAppliedProfile(authProfiles, authenticationProfileId)?.authDefaultVlan
      authVlan && authVlans.push(authVlan?.toString())
    } else if (authDefaultVlan) {
      authVlans.push(authDefaultVlan.toString())
    }
  }

  return authVlans
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

  return getCurrentVlans()?.filter(Boolean).map(Number)
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

  const isDefaultVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.authDefaultVlan)
  const isCriticalVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.criticalVlan)
  const isRestrictedVlanDuplicateWithSwitch = switchDefaultVlans.includes(profile?.restrictedVlan)

  const isCriticalVlanDuplicateWithSwitchAuth = switchAuthDefaultVlans.includes(profile?.criticalVlan)
  const isRestrictedVlanDuplicateWithSwitchAuth = switchAuthDefaultVlans.includes(profile?.restrictedVlan)
  const isGuestVlanDuplicateWithSwitchAuth = switchAuthDefaultVlans.includes(profile?.guestVlan)

  const isForceTypeProfile = profile?.dot1xPortControl === PortControl.FORCE_AUTHORIZED
  || profile?.dot1xPortControl === PortControl.FORCE_UNAUTHORIZED

  const isAuthDefaultVlanMismatch = isForceTypeProfile && !!switchAuthDefaultVlans?.length
  && (switchAuthDefaultVlans?.length > 1 || !switchAuthDefaultVlans?.includes(profile?.authDefaultVlan))

  if (!allSelectedPortsMatch) {
    const isDefaultVlanMismatch = !!profileDefaultVlans.length
      && (profileDefaultVlans.length > 1 || !profileDefaultVlans.includes(profile?.authDefaultVlan))
    const isGuestVlanMismatch = !!guestVlans.length
      && (guestVlans.length > 1 || !guestVlans.includes(profile?.guestVlan))

    if (isDefaultVlanMismatch) {
      return Promise.reject(
        $t(FlexAuthMessages.CANNOT_SET_DIFF_PROFILE_AUTH_DEFAULT_VLAN, {
          applyProfileAuthDefaultVlan: profile?.authDefaultVlan
        })
      )
    } else if (isGuestVlanMismatch) {
      return Promise.reject($t(
        FlexAuthMessages.CANNOT_SET_DIFF_GUEST_VLAN_FOR_PROFILE)
      )
    } else if (isAuthDefaultVlanMismatch) {
      return Promise.reject(
        $t(FlexAuthMessages.CANNOT_SET_FORCE_CONTROL_TYPE_FOR_PROFILE)
      )
    }
  }

  if (isDefaultVlanDuplicateWithSwitch) {
    return Promise.reject($t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
      sourceVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN),
      targetVlan: $t(FlexAuthVlanLabel.DEFAULT_VLAN)
    }))
  } else if (isAuthDefaultVlanMismatch) {
    return Promise.reject(
      $t(FlexAuthMessages.CANNOT_SET_FORCE_CONTROL_TYPE_FOR_PROFILE)
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
      $t(FlexAuthMessages.CANNOT_SET_DIFF_GUEST_VLAN)
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
  const { field, aggregateData, vlanType, isMultipleEdit, form } = props
  const vlans = getUnionValuesByKey(field, aggregateData)

  const isOverrideAuthDefaultVlan = isMultipleEdit && form.getFieldValue('authDefaultVlanCheckbox')
  const authDefaultVlan = form.getFieldValue('authDefaultVlan')

  try {
    await Promise.all(
      vlans.map(vlan =>
        Promise.all([
          //TODO:
          // ...( field === 'guestVlan'
          //   ? [ checkGuestVlanConsistency(vlan, selectedPorts, aggregateData) ]
          //   : []
          // ),
          // checkVlanDiffFromSwitchDefaultVlan(vlan, aggregateData).catch(error => {
          //   throw { validateType: 'DEFAULT_VLAN', vlan, error }
          // }),
          // checkVlanDiffFromSwitchAuthDefaultVlan(vlan, aggregateData).catch(error => {
          //   throw { validateType: 'SWITCH_AUTH_DEFAULT_VLAN', vlan, error }
          // }),
          (isOverrideAuthDefaultVlan
            ? checkVlanDiffFromTargetVlan(
              vlan, authDefaultVlan,
              $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
                sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
                targetVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN)
              })
            ).catch(error => {
              throw { validateType: $t({ defaultMessage: 'Auth Default' }), vlan, error }
            })
            : checkVlanDiffFromAuthDefaultVlan(vlan, aggregateData).catch(error => {
              throw { validateType: $t({ defaultMessage: 'Auth Default' }), vlan, error }
            })
          )
        ])
      )
    )
    return Promise.resolve()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return Promise.reject(
      new Error($t({ defaultMessage: 'Among the selected ports, {vlanType} ID is same as {validateType} which is not allowed. Please use a different {vlanType} ID' }, {
        validateType: error?.validateType,
        vlanType: vlanType
      }))
    )
  }
}

export const isForceControlType = (portControl: string[]) => {
  return portControl.includes(PortControl.FORCE_AUTHORIZED)
  || portControl.includes(PortControl.FORCE_UNAUTHORIZED)
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

export const getNeedPreselectFields = (props: {
  form?: FormInstance,
  changedField?: string,
  isOverridden?: boolean,
  isCustomized?: boolean,
  isMultipleEdit: boolean,
  selectedPorts: SwitchPortViewModel[],
  aggregateData: AggregatePortSettings,
  hasMultipleValue?: string[]
}) => {
  const { form, changedField, isMultipleEdit, isCustomized, isOverridden,
    aggregateData, selectedPorts, hasMultipleValue
  } = props

  const authDefaultVlan = Object.values(aggregateData.authDefaultVlan).flat()
  const isEitherPortEnabledForFirstTime = selectedPorts?.length > authDefaultVlan?.length

  if (changedField === 'authenticationTypeCheckbox') {
    return {
      changeAuthOrderCheckbox: isOverridden,
      dot1xPortControlCheckbox: isOverridden
    }
  } else if (changedField === 'authFailActionCheckbox') {
    return {
      restrictedVlanCheckbox: isOverridden
    }
  } else if (changedField === 'authTimeoutActionCheckbox') {
    return {
      criticalVlanCheckbox: isOverridden
    }
  } else if (changedField === 'dot1xPortControlCheckbox') {
    const currentPortControl = form?.getFieldValue('dot1xPortControl')
    const unionPortControl = getUnionValuesByKey('dot1xPortControl', aggregateData)
    const isAnyForceControl = isForceControlType(unionPortControl)
    const isCurrentForceControl = isForceControlType([currentPortControl])
    // If any of the port controls is force type, auth default vlan cannot be changed
    if ((hasMultipleValue?.includes('dot1xPortControl') && isAnyForceControl) || isCurrentForceControl) {
      return {
        authDefaultVlanCheckbox: isOverridden,
        ...(isCurrentForceControl ? {
          authFailActionCheckbox: isOverridden,
          restrictedVlanCheckbox: isOverridden,
          authTimeoutActionCheckbox: isOverridden,
          criticalVlanCheckbox: isOverridden
        }: {})
      }
    }
  }

  // If any of the selected ports are without authentication settings
  // will pre-select the specific override checkbox
  return (isMultipleEdit && isEitherPortEnabledForFirstTime)
    ? (isCustomized ? {
      authenticationTypeCheckbox: true,
      changeAuthOrderCheckbox: true,
      dot1xPortControlCheckbox: true,
      authDefaultVlanCheckbox: true
    } : {
      authenticationProfileIdCheckbox: true
    })
    : {}
}

export const handleClickCustomize = (props: {
  selectedPorts: SwitchPortViewModel[],
  authenticationCustomize: boolean,
  isMultipleEdit: boolean,
  isProfileValid: boolean,
  authenticationProfileId?: string,
  authProfiles: FlexibleAuthentication[],
  aggregateData: AggregatePortSettings,
  form: FormInstance,
}) => {
  const {
    authenticationCustomize, isMultipleEdit, aggregateData,
    authenticationProfileId, authProfiles, isProfileValid, selectedPorts, form
  } = props

  const toggleCustomized = !authenticationCustomize
  const authDefaultVlan = Object.values(aggregateData.authDefaultVlan).flat()

  const isSetProfileToInitial
    = !isMultipleEdit && !authDefaultVlan?.length && authenticationProfileId && isProfileValid

  const preselectFields = getNeedPreselectFields({
    isMultipleEdit, isCustomized: toggleCustomized,
    selectedPorts, aggregateData
  })

  if (toggleCustomized) { // customize
    form.setFieldsValue({
      ...form.getFieldsValue(),
      authenticationCustomize: toggleCustomized,
      // when configuring port auth for first time, selecting a valid profile and clicking 'Customize' button
      // will set the profile data to form's initial values.
      ...(isSetProfileToInitial
        ? getAppliedProfile(authProfiles, authenticationProfileId) : {}
      ),
      ...preselectFields
    })
  } else { // use profile setting
    form.setFieldsValue({
      ...form.getFieldsValue(),
      authenticationCustomize: toggleCustomized,
      ...preselectFields
    })
  }
}

export const handlePortVlanChange = (props: {
  isFlexAuthButtonDisabled: boolean,
  form: FormInstance,
}) => {
  const { form, isFlexAuthButtonDisabled } = props
  const isFlexAuthEnabled = form.getFieldValue('flexibleAuthenticationEnabled')
  if (isFlexAuthButtonDisabled && isFlexAuthEnabled) {
    const resetFieldValues = {
      ...form.getFieldsValue(),
      flexibleAuthenticationEnabled: false,
      flexibleAuthenticationEnabledCheckbox: false
    }
    form.setFieldsValue(resetFieldValues)
  }
}

export const handleAuthOverrideFieldChange = (props: {
  changedField: string,
  form: FormInstance,
  isOverridden: boolean,
  isMultipleEdit: boolean,
  selectedPorts: SwitchPortViewModel[],
  aggregateData: AggregatePortSettings,
  hasMultipleValue?: string[]
}) => {
  const { form, changedField } = props
  if (changedField === 'flexibleAuthenticationEnabledCheckbox') {
    handleAuthenticationOverrideChange(props)
  } else {
    const preselectFields = getNeedPreselectFields(props)
    form.setFieldsValue({
      ...form.getFieldsValue(),
      ...preselectFields
    })
  }
}

export const handleAuthenticationOverrideChange = (props: {
  form: FormInstance,
  isOverridden: boolean,
  isMultipleEdit: boolean,
  selectedPorts: SwitchPortViewModel[],
  aggregateData: AggregatePortSettings
}) => {
  const { form, isOverridden, isMultipleEdit, selectedPorts, aggregateData } = props
  const isCustomized = form.getFieldValue('authenticationCustomize')
  const authFields = [
    'authenticationProfileId', 'authenticationType', 'changeAuthOrder',
    'dot1xPortControl', 'authDefaultVlan', 'authFailAction',
    'restrictedVlan', 'authTimeoutAction', 'criticalVlan', 'guestVlan'
  ]

  if (!isOverridden) {
    const resetFields = authFields.reduce((result, key) => ({
      ...result, [`${key}Checkbox`]: false
    }), {})

    form.setFieldsValue({
      ...form.getFieldsValue(),
      ...resetFields
    })

  } else {
    const preselectFields = getNeedPreselectFields({
      isMultipleEdit, isCustomized, selectedPorts, aggregateData
    })

    form.setFieldsValue({
      ...form.getFieldsValue(),
      ...preselectFields
    })
  }

}