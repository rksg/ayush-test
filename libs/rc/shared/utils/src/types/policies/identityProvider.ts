/* eslint-disable max-len */
import { defineMessage } from 'react-intl'


export enum IdentityProviderTabType {
  SAML = 'SAML',
  Hotspot20 = 'Hotspot20'
}

export enum NaiRealmEcodingEnum {
  RFC4282 = 'RFC4282',
  UTF8 = 'UTF8'
}

export enum NaiRealmEapMethodEnum {
  MD5 = 'MD5',
  TLS = 'TLS',
  Cisco = 'Cisco',
  SIM = 'SIM',
  TTLS = 'TTLS',
  AKA = 'AKA',
  PEAP = 'PEAP',
  MSCHAP_V2 = 'MSCHAP_V2',
  AKAs = 'AKAs',
  Reserved = 'Reserved'
}

export enum NaiRealmAuthInfoEnum {
  Expanded = 'Expanded',
  Non_Eap = 'Non_Eap',
  Inner = 'Inner',
  Expanded_Inner = 'Expanded_Inner',
  Credential = 'Credential',
  Tunneled = 'Tunneled'
}

export enum NaiRealmAuthTypeNonEapEnum {
  PAP = 'PAP',
  CHAP = 'CHAP',
  MSCHAP = 'MSCHAP',
  MSCHAPV2 = 'MSCHAPV2'
}

export enum NaiRealmAuthTypeInnerEnum {
  EAP_TLS = 'EAP_TLS',
  EAP_SIM = 'EAP_SIM',
  EAP_TTLS = 'EAP_TTLS',
  EAP_AKA = 'EAP_AKA',
  EAP_AKAs = 'EAP_AKAs'
}

export enum NaiRealmAuthTypeCredentialEnum {
  SIM = 'SIM',
  USIM = 'USIM',
  NFC = 'NFC',
  Hardward_Token = 'Hardward_Token',
  Softoken = 'Softoken',
  Certificate = 'Certificate',
  Username = 'Username',
  None = 'None',
  Reserved = 'Reserved'
}

export enum NaiRealmAuthTypeTunneledEnum {
  SIM = 'SIM',
  USIM = 'USIM',
  NFC = 'NFC',
  Hardward_Token = 'Hardward_Token',
  Softoken = 'Softoken',
  Certificate = 'Certificate',
  Username = 'Username',
  Reserved = 'Reserved',
  Anonymous = 'Anonymous'
}

export type AuthInfoType = {
  info: NaiRealmAuthInfoEnum
  vendorId?: string
  vendorType?: string
  nonEapAuth?: NaiRealmAuthTypeNonEapEnum
  eapInnerAuth?: NaiRealmAuthTypeInnerEnum
  credentialType?: NaiRealmAuthTypeCredentialEnum
  tunneledType?: NaiRealmAuthTypeTunneledEnum
}

export type EapType = {
  method: NaiRealmEapMethodEnum
  authInfos?: AuthInfoType[]
  rowId?: number // for GUI - table
}

export type NaiRealmType = {
  name: string
  encoding: NaiRealmEcodingEnum
  eaps?: EapType[],
  rowId?: number // for GUI - table
}

export type PlmnType = {
  mcc: string
  mnc: string
  rowId?: number // for GUI - table
}

export type RoamConsortiumType = {
  name: string
  organizationId: string
  rowId?: number
}

export type IdentityProvider = {
  id?: string
  name: string
  naiRealms: NaiRealmType[]
  plmns?: PlmnType[]
  roamConsortiumOIs?: RoamConsortiumType[]
  authRadiusId?: string
  accountingRadiusEnabled?: boolean
  accountingRadiusId?: string
}

export type IdentityProviderViewModel = IdentityProvider & {
  wifiNetworkIds?: string[]
}

// action, dispatch, store
export enum IdentityProviderActionType {
  NAME = 'NAME',
  ADD_REALM = 'ADD_REALM',
  UPDATE_REALM = 'UPDATE_REALM',
  DELETE_REALM = 'DELETE_REALM',
  ADD_PLMN = 'ADD_PLMN',
  UPDATE_PLMN = 'UPDATE_PLMN',
  DELETE_PLMN = 'DELETE_PLMN',
  ADD_ROI = 'ADD_ROI',
  UPDATE_ROI = 'UPDATE_ROI',
  DELETE_ROI = 'DELETE_ROI',
  AUTH_RADIUS_ID = 'AUTH_RADIUS_ID',
  ACCOUNT_RADIUS_ENABLED = 'ACCOUNT_RADIUS_ENABLED',
  ACCOUNT_RADIUS_ID = 'ACCOUNT_RADIUS_ID',
  UPDATE_STATE = 'UPDATE_STATE',
  LOAD_PRECONFIGURED = 'LOAD_PRECONFIGURED'
}

export type IdentityProviderActionPayload = {
  type: IdentityProviderActionType.NAME,
  payload: {
    name: string
  }
} | {
  type: IdentityProviderActionType.ADD_REALM,
  payload: NaiRealmType
} | {
  type: IdentityProviderActionType.UPDATE_REALM,
  payload: NaiRealmType
} | {
  type: IdentityProviderActionType.DELETE_REALM,
  payload: {
    rowIds: number[]
  }
} | {
  type: IdentityProviderActionType.ADD_PLMN,
  payload: PlmnType
} | {
  type: IdentityProviderActionType.UPDATE_PLMN,
  payload: PlmnType
} | {
  type: IdentityProviderActionType.DELETE_PLMN,
  payload: {
    rowIds: number[]
  }
} | {
  type: IdentityProviderActionType.ADD_ROI,
  payload: RoamConsortiumType
} | {
  type: IdentityProviderActionType.UPDATE_ROI,
  payload: RoamConsortiumType
} | {
  type: IdentityProviderActionType.DELETE_ROI,
  payload: {
    rowIds: number[]
  }
} | {
  type: IdentityProviderActionType.AUTH_RADIUS_ID,
  payload: {
    authRadiusId: string
  }
} | {
  type: IdentityProviderActionType.ACCOUNT_RADIUS_ENABLED,
  payload: {
    accountingRadiusEnabled: boolean
  }
} | {
  type: IdentityProviderActionType.ACCOUNT_RADIUS_ID,
  payload: {
    accountingRadiusId: string
  }
} | {
  type: IdentityProviderActionType.UPDATE_STATE,
  payload: {
    state: IdentityProvider
  }
} | {
  type: IdentityProviderActionType.LOAD_PRECONFIGURED,
  payload: {
    state: IdentityProvider
  }
}

// For GUI display
export const NaiRealmEcodingDisplayMap = {
  [NaiRealmEcodingEnum.RFC4282]: defineMessage({ defaultMessage: 'RFC-4282' }),
  [NaiRealmEcodingEnum.UTF8]: defineMessage({ defaultMessage: 'UTF-8' })
}

export const NaiRealmEapMethodDisplayMap = {
  [NaiRealmEapMethodEnum.MD5]: defineMessage({ defaultMessage: 'MD5-Challenge' }),
  [NaiRealmEapMethodEnum.TLS]: defineMessage({ defaultMessage: 'EAP-TLS' }),
  [NaiRealmEapMethodEnum.Cisco]: defineMessage({ defaultMessage: 'EAP-Cisco' }),
  [NaiRealmEapMethodEnum.SIM]: defineMessage({ defaultMessage: 'EAP-SIM' }),
  [NaiRealmEapMethodEnum.TTLS]: defineMessage({ defaultMessage: 'EAP-TTLS' }),
  [NaiRealmEapMethodEnum.AKA]: defineMessage({ defaultMessage: 'EAP-AKA' }),
  [NaiRealmEapMethodEnum.PEAP]: defineMessage({ defaultMessage: 'PEAP' }),
  [NaiRealmEapMethodEnum.MSCHAP_V2]: defineMessage({ defaultMessage: 'EAP-MSCHAP-V2' }),
  [NaiRealmEapMethodEnum.AKAs]: defineMessage({ defaultMessage: 'EAP-AKA\'' }),
  [NaiRealmEapMethodEnum.Reserved]: defineMessage({ defaultMessage: 'Reserved for the expended type' })
}

export const NaiRealmAuthInfoDisplayMap = {
  [NaiRealmAuthInfoEnum.Expanded]: defineMessage({ defaultMessage: 'Expanded EAP' }),
  [NaiRealmAuthInfoEnum.Non_Eap]: defineMessage({ defaultMessage: 'Non-EAP Inner Authentication' }),
  [NaiRealmAuthInfoEnum.Inner]: defineMessage({ defaultMessage: 'Inner Authentication EAP' }),
  [NaiRealmAuthInfoEnum.Expanded_Inner]: defineMessage({ defaultMessage: 'Expanded Inner EAP' }),
  [NaiRealmAuthInfoEnum.Credential]: defineMessage({ defaultMessage: 'Credential' }),
  [NaiRealmAuthInfoEnum.Tunneled]: defineMessage({ defaultMessage: 'Tunneled EAP Credential' })
}

export const NaiRealmAuthTypeNonEapDisplayMap = {
  [NaiRealmAuthTypeNonEapEnum.PAP]: defineMessage({ defaultMessage: 'PAP' }),
  [NaiRealmAuthTypeNonEapEnum.CHAP]: defineMessage({ defaultMessage: 'CHAP' }),
  [NaiRealmAuthTypeNonEapEnum.MSCHAP]: defineMessage({ defaultMessage: 'MSCHAP' }),
  [NaiRealmAuthTypeNonEapEnum.MSCHAPV2]: defineMessage({ defaultMessage: 'MSCHAPV2' })
}

export const NaiRealmAuthTypeInnerDisplayMap = {
  [NaiRealmAuthTypeInnerEnum.EAP_TLS]: defineMessage({ defaultMessage: 'EAP-TLS' }),
  [NaiRealmAuthTypeInnerEnum.EAP_SIM]: defineMessage({ defaultMessage: 'EAP-SIM' }),
  [NaiRealmAuthTypeInnerEnum.EAP_TTLS]: defineMessage({ defaultMessage: 'EAP-TTLS' }),
  [NaiRealmAuthTypeInnerEnum.EAP_AKA]: defineMessage({ defaultMessage: 'EAP-AKA' }),
  [NaiRealmAuthTypeInnerEnum.EAP_AKAs]: defineMessage({ defaultMessage: 'EAP-AKAs' })
}

export const NaiRealmAuthTypeCredentialDisplayMap = {
  [NaiRealmAuthTypeCredentialEnum.SIM]: defineMessage({ defaultMessage: 'SIM' }),
  [NaiRealmAuthTypeCredentialEnum.USIM]: defineMessage({ defaultMessage: 'USIM' }),
  [NaiRealmAuthTypeCredentialEnum.NFC]: defineMessage({ defaultMessage: 'NFC Secure Element' }),
  [NaiRealmAuthTypeCredentialEnum.Hardward_Token]: defineMessage({ defaultMessage: 'Hardware Token' }),
  [NaiRealmAuthTypeCredentialEnum.Softoken]: defineMessage({ defaultMessage: 'Softoken' }),
  [NaiRealmAuthTypeCredentialEnum.Certificate]: defineMessage({ defaultMessage: 'Certificate' }),
  [NaiRealmAuthTypeCredentialEnum.Username]: defineMessage({ defaultMessage: 'Username/Password' }),
  [NaiRealmAuthTypeCredentialEnum.None]: defineMessage({ defaultMessage: 'None*' }),
  [NaiRealmAuthTypeCredentialEnum.Reserved]: defineMessage({ defaultMessage: 'Reserved' })
}

export const NaiRealmAuthTypeTunneledDisplayMap = {
  [NaiRealmAuthTypeTunneledEnum.SIM]: defineMessage({ defaultMessage: 'SIM' }),
  [NaiRealmAuthTypeTunneledEnum.USIM]: defineMessage({ defaultMessage: 'USIM' }),
  [NaiRealmAuthTypeTunneledEnum.NFC]: defineMessage({ defaultMessage: 'NFC Secure Element' }),
  [NaiRealmAuthTypeTunneledEnum.Hardward_Token]: defineMessage({ defaultMessage: 'Hardware Token' }),
  [NaiRealmAuthTypeTunneledEnum.Softoken]: defineMessage({ defaultMessage: 'Softoken' }),
  [NaiRealmAuthTypeTunneledEnum.Certificate]: defineMessage({ defaultMessage: 'Certificate' }),
  [NaiRealmAuthTypeTunneledEnum.Username]: defineMessage({ defaultMessage: 'Username/Password' }),
  [NaiRealmAuthTypeTunneledEnum.Reserved]: defineMessage({ defaultMessage: 'Reserved' }),
  [NaiRealmAuthTypeTunneledEnum.Anonymous]: defineMessage({ defaultMessage: 'Anonymous' })
}