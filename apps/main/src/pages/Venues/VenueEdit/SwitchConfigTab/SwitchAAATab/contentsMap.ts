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

export const LOCAL_USER_PASSWORD_TOOLTIP = defineMessage({
  defaultMessage: `
    The password needs to:<br></br>
    <ul>
    <li>Be 8 to 64 characters long</li>
    <li>Include both uppercase and lowercase characters (ABC, xyz)</li>
    <li>Include at least one number (0-9)</li>
    <li>Include at least one symbol (@, #, $, %, etc. use of "!" is not allowed)</li>
    </ul>
    Password cannot:
    <ul>
    <li>Contain spaces</li>
    </ul>
  `
})
