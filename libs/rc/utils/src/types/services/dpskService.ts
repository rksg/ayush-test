import { ExpirationDateEntity, ExpirationType } from '../..'
import {
  PassphraseFormatEnum
} from '../../constants'

export interface NewTableResult<T> {
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  sort: string[];
  content: T[]
}

export interface CreateDpskFormFields {
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
  networkIds?: string[]
}
export interface DpskPassphrase {
  id: string;
  passphrase: string;
  username?: string;
  vlanId?: string;
  mac?: string;
  numberOfDevices?: number;
  createdDate: string;
  expirationDate?: string;
}
