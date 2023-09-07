import { ExpirationDateEntity, ExpirationType } from '../..'
import {
  PassphraseFormatEnum
} from '../../constants'

export enum PolicyDefaultAccess {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT'
}

export enum DeviceNumberType {
  LIMITED,
  UNLIMITED
}

export interface CreateDpskFormFields {
  id?: string;
  name: string;
  passphraseLength: number;
  passphraseFormat: PassphraseFormatEnum;
  expiration: ExpirationDateEntity;
  deviceCountLimit?: number;
  policyDefaultAccess?: PolicyDefaultAccess;
  deviceNumberType?: DeviceNumberType;
  policySetId?: string;
}
export interface DpskSaveData {
  id?: string;
  name: string;
  passphraseLength: number;
  passphraseFormat: PassphraseFormatEnum;
  expirationType: ExpirationType | null; // null means Never expires
  expirationOffset?: number; // If 'expirationType' is not SPECIFIED_DATE then this field is the offset amount
  expirationDate?: string; // If 'expirationType' is SPECIFIED_DATE then this field is the related date in format YYYY-MM-DD.
  networkIds?: string[];
  identityId?: string; // PersonaGroup id - This DPSK had bound with PersonaGroup
  deviceCountLimit?: number;
  policyDefaultAccess?: boolean;
  policySetId?: string;
}
export interface NewDpskPassphrase {
  id: string;
  passphrase: string;
  username?: string;
  vlanId?: number;
  mac?: string;
  numberOfDevices?: number;
  createdDate: string;
  expirationDate: string | null;
  email?: string;
  phoneNumber?: string;
  identityId?: string; // PersonaGroup id - This DPSK had bound with PersonaGroup
  revocationDate?: string;
  revocationReason?: string;
}

export interface CreateDpskPassphrasesFormFields {
  id: string | undefined;
  numberOfPassphrases: number;
  passphrase?: string;
  username?: string;
  vlanId?: string;
  mac?: string;
  numberOfDevices?: number;
  expiration: Omit<ExpirationDateEntity, 'offset'>
  email?: string;
  phoneNumber?: string;
  revocationReason?: string;
}

export interface DpskPassphrasesSaveData {
  id: string | undefined;
  numberOfPassphrases: number;
  passphrase?: string | null;
  username?: string;
  vlanId?: string;
  mac?: string;
  numberOfDevices?: number;
  expirationDate?: string;
  email?: string;
  phoneNumber?: string;
  override?: boolean;
  revocationReason?: string;
}

export interface DpskPassphraseClient {
  passphraseId: string;
  username: string;
  passphrase: string;
  numberOfDevices?: number;
  clientMac: string[];
  createdDate: string;
  expirationDate: string;
}

export interface DPSKDeviceInfo {
  mac: string,
  online?: boolean,
  lastConnected: string | null,
  lastConnectedNetwork: string,
  devicePassphrase: string
  deviceConnectivity?: 'CONFIGURED' | 'CONNECTED',
  lastConnectedNetworkId?: string | null,
  lastConnectedTime?: string | null
}
