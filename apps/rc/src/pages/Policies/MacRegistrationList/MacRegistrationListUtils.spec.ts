import {
  ExpirationDateEntity, ExpirationMode,
  ExpirationType,
  MacRegistrationPool
} from '@acx-ui/rc/utils'

import { transferDataToExpirationFormFields, transferExpirationFormFieldsToData } from './MacRegistrationListUtils'


describe('MacRegistrationListUtils parser', () => {

  it('should transfer expirationForm fields to data', () => {
    const mockedExpirationNever: ExpirationDateEntity = new ExpirationDateEntity()
    mockedExpirationNever.setToNever()

    const mockedExpirationByDate: ExpirationDateEntity = new ExpirationDateEntity()
    mockedExpirationByDate.setToByDate('2022-12-01')

    const mockedExpirationAfterTime: ExpirationDateEntity = new ExpirationDateEntity()
    mockedExpirationAfterTime.setToAfterTime(ExpirationType.DAYS_AFTER_TIME, 1)

    let expiration = transferExpirationFormFieldsToData(mockedExpirationNever)
    expect(expiration.expirationEnabled).toBe(false)

    expiration = transferExpirationFormFieldsToData(mockedExpirationByDate)
    expect(expiration.expirationDate).toBe('2022-12-01T23:59:59Z')
    expect(expiration.expirationType).toBe(ExpirationType.SPECIFIED_DATE)

    expiration = transferExpirationFormFieldsToData(mockedExpirationAfterTime)
    expect(expiration.expirationOffset).toBe(1)
    expect(expiration.expirationType).toBe(ExpirationType.DAYS_AFTER_TIME)
  })

  it('should transfer data to expirationForm fields', () => {
    const mockedExpirationNever: Partial<MacRegistrationPool> = {
      expirationEnabled: false
    }

    const mockedExpirationByDate: Partial<MacRegistrationPool> = {
      expirationEnabled: true,
      expirationType: ExpirationType.SPECIFIED_DATE,
      expirationDate: '2022-12-01'
    }

    const mockedExpirationAfterTime: Partial<MacRegistrationPool> = {
      expirationEnabled: true,
      expirationType: ExpirationType.DAYS_AFTER_TIME,
      expirationOffset: 1
    }

    let expiration = transferDataToExpirationFormFields(mockedExpirationNever)
    expect(expiration.expiration.mode).toBe(ExpirationMode.NEVER)

    expiration = transferDataToExpirationFormFields(mockedExpirationByDate)
    expect(expiration.expiration.mode).toBe(ExpirationMode.BY_DATE)
    expect(expiration.expiration.date).toBe(mockedExpirationByDate.expirationDate)

    expiration = transferDataToExpirationFormFields(mockedExpirationAfterTime)
    expect(expiration.expiration.mode).toBe(ExpirationMode.AFTER_TIME)
    expect(expiration.expiration.type).toBe(mockedExpirationAfterTime.expirationType)
    expect(expiration.expiration.offset).toBe(mockedExpirationAfterTime.expirationOffset)

  })
})
