import {
  CreateDpskFormFields,
  ExpirationMode,
  DpskSaveData,
  ExpirationType,
  ExpirationDateEntity,
  PolicyDefaultAccess,
  DeviceNumberType
} from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
type ExpirationTypeForSaveData = Pick<DpskSaveData, 'expirationType' | 'expirationOffset' | 'expirationDate'>

export function transferFormFieldsToSaveData (data: CreateDpskFormFields): DpskSaveData {
  const { expiration, policyDefaultAccess, deviceNumberType, ...rest } = data

  return {
    ...rest,
    ...(transferExpirationDateEntityToSaveData(expiration)),
    ...(rest.policySetId ? {
      policyDefaultAccess: policyDefaultAccess === PolicyDefaultAccess.REJECT ? false : true
    } : {})
  }
}

export function transferSaveDataToFormFields (data: DpskSaveData): CreateDpskFormFields {
  const {
    expirationType,
    expirationDate,
    expirationOffset,
    policyDefaultAccess,
    deviceCountLimit,
    ...rest
  } = data

  const expiration: ExpirationDateEntity = transferSaveDataToExpirationDateEntity({
    expirationType,
    expirationDate,
    expirationOffset
  })

  return {
    ...rest,
    // eslint-disable-next-line max-len
    ...(rest.policySetId ? { policyDefaultAccess: policyDefaultAccess ? PolicyDefaultAccess.ACCEPT : PolicyDefaultAccess.REJECT } : {}),
    deviceCountLimit,
    deviceNumberType: deviceCountLimit ? DeviceNumberType.LIMITED : DeviceNumberType.UNLIMITED,
    expiration
  }
}

// eslint-disable-next-line max-len
function transferExpirationDateEntityToSaveData (expiration: ExpirationDateEntity): ExpirationTypeForSaveData {
  let expirationForSaveData: ExpirationTypeForSaveData

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

  return expirationForSaveData
}

// eslint-disable-next-line max-len
function transferSaveDataToExpirationDateEntity (expirationForSaveData: ExpirationTypeForSaveData): ExpirationDateEntity {
  const { expirationType, expirationDate, expirationOffset } = expirationForSaveData
  let expiration: ExpirationDateEntity = new ExpirationDateEntity()

  if (!expirationType) {
    expiration.setToNever()
  } else if (expirationType === ExpirationType.SPECIFIED_DATE) {
    expiration.setToByDate(expirationDate!)
  } else {
    expiration.setToAfterTime(expirationType!, expirationOffset!)
  }

  return expiration
}
