import {
  DpskSaveData,
  ExpirationType,
  PassphraseFormatEnum,
  ServiceType,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'

export const mockedTenantId = '__Tenant_ID__'

export const mockedServiceId = '__Service_ID__'

// eslint-disable-next-line max-len
export const createPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE })
// eslint-disable-next-line max-len
export const editPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.EDIT })

export const mockedCreateFormData: DpskSaveData = {
  name: 'Fake DPSK for Create',
  passphraseLength: 16,
  passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
  expirationType: ExpirationType.DAYS_AFTER_TIME,
  expirationOffset: 5
}

export const mockedEditFormData: DpskSaveData = {
  name: 'Fake DPSK for Edit',
  passphraseLength: 22,
  passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
  expirationType: ExpirationType.HOURS_AFTER_TIME,
  expirationOffset: 3
}
