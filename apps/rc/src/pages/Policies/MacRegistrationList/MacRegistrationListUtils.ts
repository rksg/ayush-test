import moment from 'moment-timezone'

import {
  ExpirationDateEntity, ExpirationMode,
  ExpirationType,
  MacRegistrationPool
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

export const expirationTimeUnits: Record<string, string> = {
  HOURS_AFTER_TIME: 'Hours',
  DAYS_AFTER_TIME: 'Days',
  WEEKS_AFTER_TIME: 'Weeks',
  MONTHS_AFTER_TIME: 'Months',
  YEARS_AFTER_TIME: 'Years'
}

export const returnExpirationString = (data: Partial<MacRegistrationPool>) => {
  const { $t } = getIntl()
  if (!data.expirationEnabled) {
    return $t({ defaultMessage: 'Never expires' })
  } else {
    if (data.expirationType === ExpirationType.SPECIFIED_DATE) {
      return toDateTimeString(data?.expirationDate)
    } else {
      // eslint-disable-next-line max-len
      return $t({ defaultMessage: 'After {offset} {unit}' }, {
        offset: data.expirationOffset,
        unit: data.expirationType ? expirationTimeUnits[data.expirationType] : ''
      })
    }
  }
}

export const transferExpirationFormFieldsToData = (data: ExpirationDateEntity) => {
  let expiration
  if (data.mode === ExpirationMode.NEVER) {
    expiration = {
      expirationEnabled: false,
      expirationDate: null
    }
  } else if (data.mode === ExpirationMode.BY_DATE) {
    expiration = {
      expirationType: ExpirationType.SPECIFIED_DATE,
      expirationDate: toExpireEndDate(data.date),
      expirationEnabled: true
    }
  } else {
    expiration = {
      expirationType: data.type,
      expirationOffset: data.offset,
      expirationEnabled: true
    }
  }
  return expiration
}

export const toExpireEndDate = (value?: string) => {
  return value ? moment.utc(value).add(23,'h').add(59,'m').add(59,'s') : ''
}

export const toDateTimeString = (value?: string) => {
  return value ? moment.utc(value).local().format('MM/DD/YYYY hh:mm A') : ''
}

export const toLocalDateString = (date: string) => {
  return moment.utc(date).subtract(23,'h').subtract(59,'m').subtract(59,'s').local().format()
}

export const transferDataToExpirationFormFields = (data: MacRegistrationPool) => {
  let expiration: ExpirationDateEntity = new ExpirationDateEntity()
  if (!data.expirationEnabled) {
    expiration.setToNever()
  } else if (data.expirationType === ExpirationType.SPECIFIED_DATE) {
    expiration.setToByDate(toLocalDateString(data.expirationDate!))
  } else {
    expiration.setToAfterTime(data.expirationType!, data.expirationOffset!)
  }
  return { expiration }
}
