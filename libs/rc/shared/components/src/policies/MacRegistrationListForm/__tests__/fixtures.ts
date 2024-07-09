import {
  DpskSaveData,
  ExpirationType,
  PassphraseFormatEnum
} from '@acx-ui/rc/utils'

export const mockedCreateFormData: DpskSaveData = {
  name: 'Fake DPSK for Create',
  passphraseLength: 16,
  passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
  expirationType: ExpirationType.DAYS_AFTER_TIME,
  expirationOffset: 5
}