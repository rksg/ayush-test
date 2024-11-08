import moment from 'moment-timezone'

import { CertificateExpirationType, CertificateTemplateFormData, ExpirationDateEntity, ExpirationMode, ExpirationType, OnboardCA } from '@acx-ui/rc/utils'

const toLocalDateString = (date: string) => {
  return moment(date).startOf('day').local().format()
}

const expirationTypeMap: Record<CertificateExpirationType, ExpirationType> = {
  [CertificateExpirationType.YEARS_AFTER_TIME]: ExpirationType.YEARS_AFTER_TIME,
  [CertificateExpirationType.HOURS_AFTER_TIME]: ExpirationType.HOURS_AFTER_TIME,
  [CertificateExpirationType.DAYS_AFTER_TIME]: ExpirationType.DAYS_AFTER_TIME,
  [CertificateExpirationType.WEEKS_AFTER_TIME]: ExpirationType.WEEKS_AFTER_TIME,
  [CertificateExpirationType.MONTHS_AFTER_TIME]: ExpirationType.MONTHS_AFTER_TIME,
  [CertificateExpirationType.MINUTES_AFTER_TIME]: ExpirationType.MINUTES_AFTER_TIME,
  [CertificateExpirationType.SPECIFIED_DATE]: ExpirationType.SPECIFIED_DATE
}

const setExpirationDateEntity = (type: CertificateExpirationType, date: string, value: number) => {
  const entity = new ExpirationDateEntity()
  const transferedType = expirationTypeMap[type]

  if (transferedType === ExpirationType.SPECIFIED_DATE) {
    entity.setToByDate(toLocalDateString(date))
  } else {
    entity.setToAfterTime(transferedType, value)
  }

  return entity
}

type modelMapping = { typeKey: string; valueKey: string; dateKey: string; }
const setPayloadExpiration = (expiration: ExpirationDateEntity, modeMapping: modelMapping) => {
  const result: { [key: string]: CertificateExpirationType | number | string | undefined } = {}
  if (expiration.mode === ExpirationMode.AFTER_TIME) {
    result[modeMapping.typeKey] = CertificateExpirationType[expiration.type!]
    result[modeMapping.valueKey] = expiration.offset
  } else if (expiration.mode === ExpirationMode.BY_DATE) {
    result[modeMapping.dateKey] = expiration.date
    result[modeMapping.typeKey] = CertificateExpirationType[ExpirationType.SPECIFIED_DATE]
  }
  return result
}

export const transferPayloadToExpirationFormData = (onboardCa?: OnboardCA) => {
  if (!onboardCa) {
    const notAfter: ExpirationDateEntity = new ExpirationDateEntity()
    const notBefore: ExpirationDateEntity = new ExpirationDateEntity()
    return { notAfter, notBefore }
  }

  const {
    notAfterDate, notAfterType, notAfterValue,
    notBeforeDate, notBeforeType, notBeforeValue
  } = onboardCa

  const notAfter = setExpirationDateEntity(notAfterType, notAfterDate || '', notAfterValue || 0)
  const notBefore = setExpirationDateEntity(notBeforeType, notBeforeDate || '', notBeforeValue || 0)
  return { notAfter, notBefore }
}

export const transferExpirationFormDataToPayload = (formData: CertificateTemplateFormData) => {
  return {
    // eslint-disable-next-line max-len
    ...setPayloadExpiration(formData.notAfter, { typeKey: 'notAfterType', valueKey: 'notAfterValue', dateKey: 'notAfterDate' }),
    // eslint-disable-next-line max-len
    ...setPayloadExpiration(formData.notBefore, { typeKey: 'notBeforeType', valueKey: 'notBeforeValue', dateKey: 'notBeforeDate' })
  }
}
