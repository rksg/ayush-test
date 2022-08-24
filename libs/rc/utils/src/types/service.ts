import {
  PassphraseExpirationEnum,
  PassphraseFormatEnum
} from '../constants'

export interface CreateDPSKFormFields {
  name: string;
  tags?: string;
  passphraseLength: number;
  passphraseFormat: PassphraseFormatEnum;
  expiration: PassphraseExpirationEnum;
  network?: Network[];

}
export interface DPSKSaveData {
  name?: string;
  tags?: string;

  network?: Network[];
  passphraseLength?: number;
  passphraseFormat?: PassphraseFormatEnum;
  expiration?: PassphraseExpirationEnum;
}

export interface Network {
  id?: string
  networkId: string
  name?: string
  type: string
  venues: { count: number, names: string[] }
}
