import moment from 'moment-timezone'

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
    // eslint-disable-next-line max-len
    const utcTimeStr = moment(mockedExpirationByDate.date + ' 23:59:59').utc()
    expect(expiration.expirationDate).toStrictEqual(utcTimeStr)
    expect(expiration.expirationType).toBe(ExpirationType.SPECIFIED_DATE)

    expiration = transferExpirationFormFieldsToData(mockedExpirationAfterTime)
    expect(expiration.expirationOffset).toBe(1)
    expect(expiration.expirationType).toBe(ExpirationType.DAYS_AFTER_TIME)
  })

  it('should transfer data to expirationForm fields', () => {
    const mockedBasicSaveData: MacRegistrationPool = {
      autoCleanup: true,
      enabled: true,
      name: 'test',
      registrationCount: 0,
      defaultAccess: 'REJECT'
    }

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

    // eslint-disable-next-line max-len
    let expiration = transferDataToExpirationFormFields({ ...mockedBasicSaveData, ...mockedExpirationNever })
    expect(expiration.expiration.mode).toBe(ExpirationMode.NEVER)

    // eslint-disable-next-line max-len
    expiration = transferDataToExpirationFormFields({ ...mockedBasicSaveData, ...mockedExpirationByDate })
    expect(expiration.expiration.mode).toBe(ExpirationMode.BY_DATE)
    expect(expiration.expiration.date).toBe(mockedExpirationByDate.expirationDate)

    // eslint-disable-next-line max-len
    expiration = transferDataToExpirationFormFields({ ...mockedBasicSaveData, ...mockedExpirationAfterTime })
    expect(expiration.expiration.mode).toBe(ExpirationMode.AFTER_TIME)
    expect(expiration.expiration.type).toBe(mockedExpirationAfterTime.expirationType)
    expect(expiration.expiration.offset).toBe(mockedExpirationAfterTime.expirationOffset)

  })
})
