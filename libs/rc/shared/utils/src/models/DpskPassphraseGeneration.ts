import { PassphraseExpirationEnum } from './PassphraseExpirationEnum'
import { PassphraseFormatEnum }     from './PassphraseFormatEnum'

export class DpskPassphraseGeneration {
  length: number

  format: PassphraseFormatEnum

  expiration: PassphraseExpirationEnum

  constructor () {
    this.length = 18

    this.format = PassphraseFormatEnum.MOST_SECURED

    this.expiration = PassphraseExpirationEnum.UNLIMITED
  }
}
