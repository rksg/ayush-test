import {
  PassphraseExpirationEnum,
  PassphraseFormatEnum
} from '../../constants'

export interface CreateDPSKFormFields {
  name: string;
  tags?: string;
  passphraseLength: number;
  passphraseFormat: PassphraseFormatEnum;
  expiration: PassphraseExpirationEnum;

}
export interface DPSKSaveData {
  name: string;
  tags?: string;
  passphraseLength: number;
  passphraseFormat: PassphraseFormatEnum;
  expirationType: ExpirationType | null; // null means Never expires
  expirationOffset?: number; // If 'expirationType' is not SPECIFIED_DATE then this field is the offset amount
  expirationDate?: string; // If 'expirationType' is SPECIFIED_DATE then this field is the related date in format YYYY-MM-DD.
}
