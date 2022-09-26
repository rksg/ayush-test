import { defineMessage } from 'react-intl'

export const AAANotification = defineMessage({ 
  defaultMessage: 
  'You must have at least one RADIUS or TACACS+ server set-up in order to enable authorization or accounting' 
})

export enum AAAServerTypeEnum {
  RADIUS = 'RADIUS',
  TACACS = 'TACACS_PLUS',
  LOCAL_USER = 'LOCAL'
}

export enum AAA_Purpose_UI_Type {
  'DEFAULT' = 'Default (All)',
  'AUTHENTICATION_ONLY' = 'Authentication',
  'AUTHORIZATION_ONLY' = 'Authorization',
  'ACCOUNTING_ONLY' = 'Accounting',
}

export enum AAA_Level_UI_Type {
  'PORT_CONFIG' = 'Port Config',
  'READ_ONLY' = 'Read Only',
  'READ_WRITE' = 'Read Write',
}