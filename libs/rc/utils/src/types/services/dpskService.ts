import { ExpirationDateEntity, ExpirationType } from '../..'
import {
  PassphraseFormatEnum
} from '../../constants'

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
}
