import {
  CreateDpskFormFields,
  DeviceNumberType,
  DpskSaveData,
  ExpirationDateEntity,
  ExpirationMode,
  ExpirationType,
  PassphraseFormatEnum,
  PolicyDefaultAccess
} from '@acx-ui/rc/utils'

import { transferFormFieldsToSaveData, transferSaveDataToFormFields } from './parser'

describe('DpskForm parser', () => {
  it('should transfer form fields to the DPSK saved data', () => {
    const mockedBasicFormFields: CreateDpskFormFields = {
      name: 'DPSK 1',
      passphraseLength: 18,
      passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
      expiration: new ExpirationDateEntity()
    }

    const mockedExpirationNever: ExpirationDateEntity = new ExpirationDateEntity()
    mockedExpirationNever.setToNever()

    const mockedExpirationByDate: ExpirationDateEntity = new ExpirationDateEntity()
    mockedExpirationByDate.setToByDate('2022-12-01')

    const mockedExpirationAfterTime: ExpirationDateEntity = new ExpirationDateEntity()
    mockedExpirationAfterTime.setToAfterTime(ExpirationType.DAYS_AFTER_TIME, 1)

    // Verify Never expiration mode
    const saveDataNeverExpires: DpskSaveData = transferFormFieldsToSaveData({
      ...mockedBasicFormFields,
      expiration: mockedExpirationNever
    })
    expect(saveDataNeverExpires.expirationType).toBeNull()

    // Verify By Date expiration mode
    const saveDataExpireByDate: DpskSaveData = transferFormFieldsToSaveData({
      ...mockedBasicFormFields,
      expiration: mockedExpirationByDate
    })
    expect(saveDataExpireByDate.expirationType).toBe(ExpirationType.SPECIFIED_DATE)
    expect(saveDataExpireByDate.expirationDate).toBe(mockedExpirationByDate.date)

    // Verify After time expiration mode
    const saveDataExpireAfterTime: DpskSaveData = transferFormFieldsToSaveData({
      ...mockedBasicFormFields,
      expiration: mockedExpirationAfterTime
    })
    expect(saveDataExpireAfterTime.expirationType).toBe(ExpirationType.DAYS_AFTER_TIME)
    expect(saveDataExpireAfterTime.expirationOffset).toBe(mockedExpirationAfterTime.offset)

    // Verify cloudpath fatures field
    const saveDataCloudPath: DpskSaveData = transferFormFieldsToSaveData({
      ...mockedBasicFormFields
    })
    expect(saveDataCloudPath.policyDefaultAccess).toBeUndefined()
  })

  it('should transfer the DPSK saved data to form fields', () => {
    const mockedBasicSaveData: DpskSaveData = {
      name: 'DPSK 1',
      passphraseLength: 18,
      passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
      expirationType: null
    }

    const mockedExpirationNever: Partial<DpskSaveData> = {
      expirationType: null
    }

    const mockedExpirationByDate: Partial<DpskSaveData> = {
      expirationType: ExpirationType.SPECIFIED_DATE,
      expirationDate: '2022-12-01'
    }

    const mockedExpirationAfterTime: Partial<DpskSaveData> = {
      expirationType: ExpirationType.DAYS_AFTER_TIME,
      expirationOffset: 1
    }

    // Verify Never expiration mode
    const formFieldsNeverExpires: CreateDpskFormFields = transferSaveDataToFormFields({
      ...mockedBasicSaveData,
      ...mockedExpirationNever
    })
    expect(formFieldsNeverExpires.expiration.mode).toBe(ExpirationMode.NEVER)

    // Verify By Date expiration mode
    const formFieldsExpireByDate: CreateDpskFormFields = transferSaveDataToFormFields({
      ...mockedBasicSaveData,
      ...mockedExpirationByDate
    })
    expect(formFieldsExpireByDate.expiration.mode).toBe(ExpirationMode.BY_DATE)
    expect(formFieldsExpireByDate.expiration.date).toBe(mockedExpirationByDate.expirationDate)

    // Verify After time expiration mode
    const formFieldsExpireAfterTime: CreateDpskFormFields = transferSaveDataToFormFields({
      ...mockedBasicSaveData,
      ...mockedExpirationAfterTime
    })
    expect(formFieldsExpireAfterTime.expiration.mode).toBe(ExpirationMode.AFTER_TIME)
    expect(formFieldsExpireAfterTime.expiration.type).toBe(mockedExpirationAfterTime.expirationType)
    // eslint-disable-next-line max-len
    expect(formFieldsExpireAfterTime.expiration.offset).toBe(mockedExpirationAfterTime.expirationOffset)

    // Verify cloudpath fatures field
    const formFieldsCloudpath1: CreateDpskFormFields = transferSaveDataToFormFields({
      ...mockedBasicSaveData,
      policySetId: 'POLICY_SET_ID',
      policyDefaultAccess: true,
      deviceCountLimit: 10
    })
    expect(formFieldsCloudpath1.policyDefaultAccess).toBe(PolicyDefaultAccess.ACCEPT)
    expect(formFieldsCloudpath1.deviceNumberType).toBe(DeviceNumberType.LIMITED)

    const formFieldsCloudpath2: CreateDpskFormFields = transferSaveDataToFormFields({
      ...mockedBasicSaveData,
      policySetId: 'POLICY_SET_ID',
      policyDefaultAccess: false
    })
    expect(formFieldsCloudpath2.policyDefaultAccess).toBe(PolicyDefaultAccess.REJECT)
    expect(formFieldsCloudpath2.deviceNumberType).toBe(DeviceNumberType.UNLIMITED)
  })
})
