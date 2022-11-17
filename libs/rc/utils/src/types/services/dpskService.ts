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
  expiration: PassphraseExpirationEnum;
}
