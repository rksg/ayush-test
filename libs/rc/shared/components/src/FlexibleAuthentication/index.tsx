import { FormInstance }                     from 'antd'
import { MessageDescriptor, defineMessage } from 'react-intl'

export enum AuthenticationType {
	_802_1X = '802.1x',
	MACAUTH = 'macauth',
	_802_1X_AND_MACAUTH = '802.1x_and_macauth'
}

export enum PortControl {
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
    authenticationType, dot1xPortControl, ,
    authFailAction, authTimeoutAction
	 ] = values
  const isPortControlNotAuto = dot1xPortControl !== PortControl.AUTO
  const fieldDisabledMapping = {
    authDefaultVlan: () => isPortControlNotAuto,
    changeAuthOrder: () => authenticationType !== AuthenticationType._802_1X_AND_MACAUTH,
    dot1xPortControl: () => authenticationType !== AuthenticationType._802_1X,
    authFailAction: () => isPortControlNotAuto,
    restrictedVlan: () => isPortControlNotAuto || authFailAction === AuthFailAction.BLOCK,
    authTimeoutAction: () => isPortControlNotAuto,
    criticalVlan: () => isPortControlNotAuto
      || authTimeoutAction !== AuthTimeoutAction.CRITICAL_VLAN
  }

  return fieldDisabledMapping[field as keyof typeof fieldDisabledMapping]
    ? fieldDisabledMapping[field as keyof typeof fieldDisabledMapping]()
    : false
}

export const shouldHideAuthField = (
  field: string,
  values: string[],
  isMultipleEdit: boolean = false
): boolean => {
  return !isMultipleEdit && getAuthfieldDisabled(field, values)
}

export const handleAuthFieldChange = (field: string, value: string, form: FormInstance) => {
  switch(field) {
    case 'authenticationType':
      if (value !== AuthenticationType._802_1X) {
        const values = form.getFieldsValue()
        form.setFieldsValue({
          ...values,
          dot1xPortControl: PortControl.AUTO
        })
      }
      break
    case 'dot1xPortControl':
      if (value !== PortControl.AUTO) {
        const values = form.getFieldsValue()
        form.setFieldsValue({
          ...values,
          authDefaultVlan: '',
          authFailAction: AuthFailAction.BLOCK,
          restrictedVlan: '',
          authTimeoutAction: AuthTimeoutAction.NONE,
          criticalVlan: ''
        })
      }
      break
    case 'authFailAction':
      if (value === AuthFailAction.BLOCK) {
        const values = form.getFieldsValue()
        form.setFieldsValue({
          ...values,
          restrictedVlan: ''
        })
      }
      break
    case 'authTimeoutAction':
      if (value !== AuthTimeoutAction.CRITICAL_VLAN) {
        const values = form.getFieldsValue()
        form.setFieldsValue({
          ...values,
          criticalVlan: ''
        })
      }
      break
    default:
      break
  }
}

export * from './FlexibleAuthenticationForm'