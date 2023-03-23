import {
  CreateDpskFormFields,
  ExpirationMode,
  DpskSaveData,
  ExpirationType,
  ExpirationDateEntity,
  PolicyDefaultAccess
} from '@acx-ui/rc/utils'


export function transferFormFieldsToSaveData (data: CreateDpskFormFields): DpskSaveData {
  const { expiration, policyDefaultAccess, ...rest } = data
  // eslint-disable-next-line max-len
  let expirationForSaveData: Pick<DpskSaveData, 'expirationType' | 'expirationOffset' | 'expirationDate'>

  if (expiration.mode === ExpirationMode.NEVER) {
    expirationForSaveData = { expirationType: null }
  } else if (expiration.mode === ExpirationMode.BY_DATE) {
    expirationForSaveData = {
      expirationType: ExpirationType.SPECIFIED_DATE,
      expirationDate: expiration.date
    }
  } else {
    expirationForSaveData = {
      expirationType: expiration.type!,
      expirationOffset: expiration.offset
    }
  }

  return {
    ...rest,
    ...expirationForSaveData,
    policyDefaultAccess: policyDefaultAccess === PolicyDefaultAccess.REJECT ? false : true
  }
}

export function transferSaveDataToFormFields (data: DpskSaveData): CreateDpskFormFields {
  const { expirationType, expirationDate, expirationOffset, policyDefaultAccess, ...rest } = data
  let expiration: ExpirationDateEntity = new ExpirationDateEntity()

  if (!expirationType) {
    expiration.setToNever()
  } else if (expirationType === ExpirationType.SPECIFIED_DATE) {
    expiration.setToByDate(expirationDate!)
  } else {
    expiration.setToAfterTime(expirationType!, expirationOffset!)
  }

  return {
    ...rest,
    // eslint-disable-next-line max-len
    policyDefaultAccess: policyDefaultAccess ? PolicyDefaultAccess.ACCEPT : PolicyDefaultAccess.REJECT,
    expiration
  }
}
