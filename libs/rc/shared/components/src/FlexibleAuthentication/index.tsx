import { FormInstance }                     from 'antd'
import _                                    from 'lodash'
import { MessageDescriptor, defineMessage } from 'react-intl'

import { AggregatePortSettings } from '../SwitchPortTable/editPortDrawer.flexAuth.utils'

export enum AuthenticationType {
	_802_1X = '802.1x',
	MACAUTH = 'macauth',
	_802_1X_AND_MACAUTH = '802.1x_and_macauth'
}

export enum PortControl {
  NONE = '',
	AUTO = 'auto',
	FORCE_AUTHORIZED = 'force_authorized',
	FORCE_UNAUTHORIZED = 'force_unauthorized'
}

export enum AuthFailAction {
	RESTRICTED_VLAN = 'restricted_vlan',
	BLOCK = 'block'
}

export enum AuthTimeoutAction {
	CRITICAL_VLAN = 'critical_vlan',
	SUCCESS = 'success',
	FAILURE = 'failure',
	NONE = 'none'
}

export const authenticationTypeLabel: Record<AuthenticationType, MessageDescriptor> = {
  [AuthenticationType._802_1X]: defineMessage({
    defaultMessage: '802.1x'
  }),
  [AuthenticationType.MACAUTH]: defineMessage({
    defaultMessage: 'MAC-AUTH'
  }),
  [AuthenticationType._802_1X_AND_MACAUTH]: defineMessage({
    defaultMessage: '802.1x and MAC-AUTH'
  })
}

export const portControlTypeLabel: Record<PortControl, MessageDescriptor> = {
  [PortControl.NONE]: defineMessage({
    defaultMessage: 'None'
  }),
  [PortControl.AUTO]: defineMessage({
    defaultMessage: 'Auto'
  }),
  [PortControl.FORCE_AUTHORIZED]: defineMessage({
    defaultMessage: 'Force Authorized'
  }),
  [PortControl.FORCE_UNAUTHORIZED]: defineMessage({
    defaultMessage: 'Force Unauthorized'
  })
}

export const authFailActionTypeLabel: Record<AuthFailAction, MessageDescriptor> = {
  [AuthFailAction.BLOCK]: defineMessage({
    defaultMessage: 'Block'
  }),
  [AuthFailAction.RESTRICTED_VLAN]: defineMessage({
    defaultMessage: 'Restricted VLAN'
  })
}

export const authTimeoutActionTypeLabel: Record<AuthTimeoutAction, MessageDescriptor> = {
  [AuthTimeoutAction.CRITICAL_VLAN]: defineMessage({
    defaultMessage: 'Critical VLAN'
  }),
  [AuthTimeoutAction.SUCCESS]: defineMessage({
    defaultMessage: 'Success'
  }),
  [AuthTimeoutAction.FAILURE]: defineMessage({
    defaultMessage: 'Failure'
  }),
  [AuthTimeoutAction.NONE]: defineMessage({
    defaultMessage: 'None'
  })
}

export const getAuthFieldDisabled = (field: string, values: string[]) => {
  const [
    authenticationType, dot1xPortControl, ,
    authFailAction, authTimeoutAction
	 ] = values
  const isPortControlInForceType
    = dot1xPortControl !== PortControl.AUTO && dot1xPortControl !== PortControl.NONE

  const fieldDisabledMapping = {
    authDefaultVlan: () => isPortControlInForceType,
    changeAuthOrder: () => authenticationType !== AuthenticationType._802_1X_AND_MACAUTH,
    dot1xPortControl: () => authenticationType !== AuthenticationType._802_1X,
    authFailAction: () => isPortControlInForceType,
    restrictedVlan: () =>
      isPortControlInForceType || authFailAction !== AuthFailAction.RESTRICTED_VLAN,
    authTimeoutAction: () => isPortControlInForceType,
    criticalVlan: () =>
      isPortControlInForceType || authTimeoutAction !== AuthTimeoutAction.CRITICAL_VLAN
  }
  const checkFieldDisabled = fieldDisabledMapping[field as keyof typeof fieldDisabledMapping]

  return checkFieldDisabled?.() ?? false
}

export const shouldHideAuthField = (
  field: string,
  values: string[],
  isMultipleEdit: boolean = false
): boolean => {
  return !isMultipleEdit && getAuthFieldDisabled(field, values)
}

export const handleAuthFieldChange = (props: {
  field: string,
  value: string,
  form: FormInstance,
  isMultipleEdit?: boolean,
  hasMultipleValue?: string[],
  aggregateData?: AggregatePortSettings
}) => {
  const { field, value, form, isMultipleEdit, hasMultipleValue, aggregateData } = props
  const isProfileLevel = isMultipleEdit === undefined
  switch(field) {
    case 'authenticationType':
      const values = form.getFieldsValue()
      const isFailActionEqualBlock = values.authFailAction === AuthFailAction.BLOCK
      const isFailActionHasMultiValues = hasMultipleValue?.includes('authFailAction')
      const isTimeoutActionEqualNone = values.authTimeoutAction === AuthTimeoutAction.NONE
      const isTimeoutActionHasMultiValues = hasMultipleValue?.includes('authTimeoutAction')

      form.setFieldsValue({
        ...values,
        ...(isMultipleEdit ? {
          changeAuthOrderCheckbox: true,
          dot1xPortControlCheckbox: true
        } : {}),
        // Type = MAC-AUTH / 802.1 & MAC-AUTH
        ...(value !== AuthenticationType._802_1X ? {
          // eslint-disable-next-line max-len
          dot1xPortControl: value === AuthenticationType.MACAUTH ? PortControl.NONE : PortControl.AUTO,
          ...(isMultipleEdit && isFailActionEqualBlock && !isFailActionHasMultiValues ? {
            restrictedVlanCheckbox: false
          } : {}),
          ...(isMultipleEdit && isTimeoutActionEqualNone && !isTimeoutActionHasMultiValues ? {
            criticalVlanCheckbox: false
          } : {})
        }: {
          dot1xPortControl: PortControl.AUTO
        }),
        // Type = 802.1 / MAC-AUTH
        ...(value !== AuthenticationType._802_1X_AND_MACAUTH ? {
          changeAuthOrder: false
        }: {})
      })
      break
    case 'dot1xPortControl':
      if (value !== PortControl.AUTO && value !== PortControl.NONE) {
        const values = form.getFieldsValue()
        const selectedSwitches = Object.keys(aggregateData?.selectedPortIdentifier ?? {})
        const enabledAuthSwitches
          = Object.keys(aggregateData?.switchLevelAuthDefaultVlan ?? {})
        const switchAuthDefaultVlans
          = _.uniq(Object.values(aggregateData?.switchLevelAuthDefaultVlan ?? {}).flat())
        const authDefaultVlan = ((selectedSwitches?.length === enabledAuthSwitches?.length)
          && switchAuthDefaultVlans?.length === 1) ? switchAuthDefaultVlans[0] : ''

        form.setFields([
          { name: 'authDefaultVlan', errors: [] },
          { name: 'restrictedVlan', errors: [] },
          { name: 'criticalVlan', errors: [] }
        ])

        form.setFieldsValue({
          ...values,
          authFailAction: AuthFailAction.BLOCK,
          restrictedVlan: '',
          authTimeoutAction: AuthTimeoutAction.NONE,
          criticalVlan: '',
          ...(!isProfileLevel ? {
            authDefaultVlan: authDefaultVlan
          } : {}),
          ...(isMultipleEdit ? {
            authDefaultVlanCheckbox: true,
            authFailActionCheckbox: true,
            restrictedVlanCheckbox: true,
            authTimeoutActionCheckbox: true,
            criticalVlanCheckbox: true
          } : {})
        })
      } else if (value === PortControl.AUTO || value === PortControl.NONE) {
        const values = form.getFieldsValue()
        const isFailActionHasMultiValues = hasMultipleValue?.includes('authFailAction')
        const isTimeoutActionHasMultiValues = hasMultipleValue?.includes('authTimeoutAction')

        form.setFieldsValue({
          ...values,
          ...(isMultipleEdit && !isFailActionHasMultiValues ? {
            restrictedVlanCheckbox: false
          } : {}),
          ...(isMultipleEdit && !isTimeoutActionHasMultiValues ? {
            criticalVlanCheckbox: false
          } : {})
        })
      }
      break
    case 'authFailAction':
      if (value !== AuthFailAction.RESTRICTED_VLAN) {
        const values = form.getFieldsValue()
        form.setFieldsValue({
          ...values,
          restrictedVlan: '',
          ...(isMultipleEdit ? {
            restrictedVlanCheckbox: true
          } : {})
        })
      }
      break
    case 'authTimeoutAction':
      if (value !== AuthTimeoutAction.CRITICAL_VLAN) {
        const values = form.getFieldsValue()
        form.setFieldsValue({
          ...values,
          criticalVlan: '',
          ...(isMultipleEdit ? {
            criticalVlanCheckbox: true
          } : {})
        })
      }
      break
    default:
      break
  }
}

export const checkVlanDiffFromTargetVlan = (
  value: string,
  targetVlan: string | number,
  rejectMessage: string
) => {
  if (value && (Number(value) === Number(targetVlan))) {
    return Promise.reject(rejectMessage)
  }
  return Promise.resolve()
}

export * from './FlexibleAuthenticationForm'