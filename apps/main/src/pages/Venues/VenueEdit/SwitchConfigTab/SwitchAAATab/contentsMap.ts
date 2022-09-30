/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { AAAServerTypeEnum } from '@acx-ui/rc/utils'

export const AAANotification = defineMessage({
  defaultMessage:
  'You must have at least one RADIUS or TACACS+ server set-up in order to enable authorization or accounting'
})

export enum AAA_Purpose_Type {
  DEFAULT = 'DEFAULT',
  AUTHENTICATION = 'AUTHENTICATION_ONLY',
  AUTHORIZATION = 'AUTHORIZATION_ONLY',
  ACCOUNTING = 'ACCOUNTING_ONLY'
}

export enum AAA_Level_Type {
  PORT_CONFIG = 'PORT_CONFIG',
  READ_ONLY = 'READ_ONLY',
  READ_WRITE = 'READ_WRITE',
}

export const serversTypeDisplayText = {
  [AAAServerTypeEnum.RADIUS]: defineMessage({ defaultMessage: 'RADIUS' }),
  [AAAServerTypeEnum.TACACS]: defineMessage({ defaultMessage: 'TACACS+' }),
  [AAAServerTypeEnum.LOCAL_USER]: defineMessage({ defaultMessage: 'Local User' })
}

export const serversDisplayText = {
  [AAAServerTypeEnum.RADIUS]: defineMessage({ defaultMessage: 'RADIUS Server' }),
  [AAAServerTypeEnum.TACACS]: defineMessage({ defaultMessage: 'TACACS+ Server' }),
  [AAAServerTypeEnum.LOCAL_USER]: defineMessage({ defaultMessage: 'Local User' })
}

export const purposeDisplayText = {
  [AAA_Purpose_Type.DEFAULT]: defineMessage({ defaultMessage: 'Default (All)' }),
  [AAA_Purpose_Type.AUTHENTICATION]: defineMessage({ defaultMessage: 'Authentication' }),
  [AAA_Purpose_Type.AUTHORIZATION]: defineMessage({ defaultMessage: 'Authorization' }),
  [AAA_Purpose_Type.ACCOUNTING]: defineMessage({ defaultMessage: 'Accounting' })
}

export const levelDisplayText = {
  [AAA_Level_Type.PORT_CONFIG]: defineMessage({ defaultMessage: 'Port Config' }),
  [AAA_Level_Type.READ_ONLY]: defineMessage({ defaultMessage: 'Read Only' }),
  [AAA_Level_Type.READ_WRITE]: defineMessage({ defaultMessage: 'Read Write' })
}

export const LOCAL_USER_PASSWORD_TOOLTIP_1 = defineMessage({ defaultMessage: 'The password needs to:' })
export const LOCAL_USER_PASSWORD_TOOLTIP_2 = defineMessage({ defaultMessage: 'Be 8 to 64 characters long' })
export const LOCAL_USER_PASSWORD_TOOLTIP_3 = defineMessage({ defaultMessage: 'Include both uppercase and lowercase characters (ABC, xyz)' })
export const LOCAL_USER_PASSWORD_TOOLTIP_4 = defineMessage({ defaultMessage: 'Include at least one number (0-9)' })
export const LOCAL_USER_PASSWORD_TOOLTIP_5 = defineMessage({ defaultMessage: 'Include at least one symbol (@, #, $, %, etc. use of "!" is not allowed)' })
export const LOCAL_USER_PASSWORD_TOOLTIP_6 = defineMessage({ defaultMessage: 'Password cannot:' })
export const LOCAL_USER_PASSWORD_TOOLTIP_7 = defineMessage({ defaultMessage: 'Contain spaces' })
