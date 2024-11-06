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

export const getAuthfieldDisabled = (field: string, values: string[]) => {
  const [
    authenticationType, dot1XPortControl, ,
    authFailAction, authTimeoutAction
	 ] = values
  const isPortControlNotAuto
    = dot1XPortControl !== PortControl.AUTO && dot1XPortControl !== PortControl.NONE

  const fieldDisabledMapping = {
    authDefaultVlan: () => isPortControlNotAuto,
    changeAuthOrder: () => authenticationType !== AuthenticationType._802_1X_AND_MACAUTH,
    dot1XPortControl: () => authenticationType !== AuthenticationType._802_1X,
    authFailAction: () => isPortControlNotAuto,
    restrictedVlan: () => isPortControlNotAuto || authFailAction === AuthFailAction.BLOCK,
    authTimeoutAction: () => isPortControlNotAuto,
    criticalVlan: () => isPortControlNotAuto
      || authTimeoutAction !== AuthTimeoutAction.CRITICAL_VLAN
  }
  const checkFieldDisabled = fieldDisabledMapping[field as keyof typeof fieldDisabledMapping]

  return checkFieldDisabled?.() ?? false
}

export const shouldHideAuthField = (
  field: string,
  values: string[],
  isMultipleEdit: boolean = false
): boolean => {
  return !isMultipleEdit && getAuthfieldDisabled(field, values)
}

export const handleAuthFieldChange = (props: {
  field: string,
  value: string,
  form: FormInstance,
  isMultipleEdit?: boolean,
  aggregateData?: AggregatePortSettings
}) => {
  const { field, value, form, isMultipleEdit, aggregateData } = props
  const isProfileLevel = isMultipleEdit === undefined
  switch(field) {
    case 'authenticationType':
      const values = form.getFieldsValue()
      form.setFieldsValue({
        ...values,
        ...(value !== AuthenticationType._802_1X ? {
          // eslint-disable-next-line max-len
          dot1XPortControl: value === AuthenticationType.MACAUTH ? PortControl.NONE : PortControl.AUTO,
          ...(isMultipleEdit ? {
            dot1XPortControlCheckbox: true
          } : {}),
          ...(isMultipleEdit && values.authFailAction === AuthFailAction.BLOCK ? {
            restrictedVlanCheckbox: false
          } : {}),
          ...(isMultipleEdit && values.authTimeoutAction === AuthTimeoutAction.NONE ? {
            criticalVlanCheckbox: false
          } : {})
        }: {
          dot1XPortControl: PortControl.AUTO
        }),
        ...(value !== AuthenticationType._802_1X_AND_MACAUTH ? {
          changeAuthOrder: false,
          ...(isMultipleEdit ? { changeAuthOrderCheckbox: false } : {})
        }: {})
      })
      break
    case 'dot1XPortControl':
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
        form.setFieldsValue({
          ...values,
          ...(isMultipleEdit ? {
            restrictedVlanCheckbox: false,
            criticalVlanCheckbox: false
          } : {})
        })
      }
      break
    case 'authFailAction':
      if (value === AuthFailAction.BLOCK) {
        const values = form.getFieldsValue()
        form.setFieldsValue({
          ...values,
          restrictedVlan: '',
          ...(isMultipleEdit ? { restrictedVlanCheckbox: false } : {})
        })
      }
      break
    case 'authTimeoutAction':
      if (value !== AuthTimeoutAction.CRITICAL_VLAN) {
        const values = form.getFieldsValue()
        form.setFieldsValue({
          ...values,
          criticalVlan: '',
          ...(isMultipleEdit ? { criticalVlanCheckbox: false } : {})
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