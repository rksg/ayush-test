import { ExpirationDateEntity, ExpirationType } from '../..'
import {
  PassphraseFormatEnum
} from '../../constants'

export interface CreateDpskFormFields {
  id?: string;
  name: string;
  passphraseLength: number;
  passphraseFormat: PassphraseFormatEnum;
  expiration: ExpirationDateEntity;

}
export interface DpskSaveData {
  id?: string;
  name: string;
  passphraseLength: number;
  passphraseFormat: PassphraseFormatEnum;
  expirationType: ExpirationType | null; // null means Never expires
  expirationOffset?: number; // If 'expirationType' is not SPECIFIED_DATE then this field is the offset amount
  expirationDate?: string; // If 'expirationType' is SPECIFIED_DATE then this field is the related date in format YYYY-MM-DD.
  networkIds?: string[],
  identityId?: string // PersonaGroup id - This DPSK had bound with PersonaGroup
}
export interface NewDpskPassphrase {
  id: string;
  passphrase: string;
  username?: string;
  vlanId?: number;
  mac?: string;
  numberOfDevices?: number;
  createdDate: string;
  expirationDate: string;
  email?: string;
  phoneNumber?: string;
}

export interface CreateDpskPassphrasesFormFields {
  id: string | undefined;
  numberOfPassphrases: number;
  passphrase?: string;
  username?: string;
  vlanId?: number;
  mac?: string;
  numberOfDevices?: number;
  expiration: Omit<ExpirationDateEntity, 'offset'>
  email?: string;
  phoneNumber?: string;
}

export interface DpskPassphrasesSaveData {
  id: string | undefined;
  numberOfPassphrases: number;
  passphrase?: string | null;
  username?: string;
  vlanId?: number;
  mac?: string;
  numberOfDevices?: number;
  expirationDate?: string;
  email?: string;
  phoneNumber?: string;
}
