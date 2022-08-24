import {
  CreateDPSKFormFields,
  PassphraseFormatEnum,
  PassphraseExpirationEnum
} from '@acx-ui/rc/utils'


export function transferDetailToSave (data: CreateDPSKFormFields) {
  return {
    name: data.name,
    tags: data.tags ?? '',
    passphraseLength: data.passphraseLength ?? 16,
    passphraseFormat: data.passphraseFormat ?? PassphraseFormatEnum.MOST_SECURED,
    expiration: data.expiration ?? PassphraseExpirationEnum.UNLIMITED,
    network: data.network
  }
}

