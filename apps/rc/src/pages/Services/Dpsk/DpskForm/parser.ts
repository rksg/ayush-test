import {
  CreateDpskFormFields,
  ExpirationMode,
  DpskSaveData,
  ExpirationType,
  ExpirationDateEntity
} from '@acx-ui/rc/utils'


export function transferFormFieldsToSaveData (data: CreateDpskFormFields): DpskSaveData {
  let expiration: Partial<DpskSaveData>

  if (data.expiration.mode === ExpirationMode.NEVER) {
    expiration = { expirationType: null }
  } else if (data.expiration.mode === ExpirationMode.BY_DATE) {
    expiration = {
      expirationType: ExpirationType.SPECIFIED_DATE,
      expirationDate: data.expiration.date
    }
  } else {
    expiration = {
      expirationType: data.expiration.type,
      expirationOffset: data.expiration.offset
    }
  }

  return {
    name: data.name,
    passphraseLength: data.passphraseLength,
    passphraseFormat: data.passphraseFormat,
    expirationType: null,
    ...expiration
  }
}

export function transferSaveDataToFormFields (data: DpskSaveData): CreateDpskFormFields {
  let expiration: ExpirationDateEntity = new ExpirationDateEntity()

  if (!data.expirationType) {
    expiration.setToNever()
  } else if (data.expirationType === ExpirationType.SPECIFIED_DATE) {
    expiration.setToByDate(data.expirationDate!)
  } else {
    expiration.setToAfterTime(data.expirationType!, data.expirationOffset!)
  }

  return {
    name: data.name,
    passphraseFormat: data.passphraseFormat,
    passphraseLength: data.passphraseLength,
    expiration
  }
}
