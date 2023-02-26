import moment from 'moment-timezone'

import {
  firmwareTypeTrans,
  FirmwareVersion,
  FirmwareVenue,
  FirmwareVenueVersion,
  FirmwareType,
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
export const compareVersions = (a: String, b: String): number => {
  let v1 = (a || '').split('.')
  let v2 = (b || '').split('.')
  for (let i = 0; i < Math.min(v1.length, v2.length); i++) {
    let res = Number(v1[i]) - Number(v2[i])
    if (res !== 0) {
      return res
    }
  }
  return 0
}

// eslint-disable-next-line max-len
const typeIsApFunc = (value: FirmwareVenueVersion) => value && value.type && value.type === FirmwareType.AP_FIRMWARE_UPGRADE

export const getApVersion = (venue: FirmwareVenue): string | undefined => {
  return getApFieldInVersions(venue, 'version')
}

// eslint-disable-next-line max-len
function getApFieldInVersions<T extends keyof FirmwareVenueVersion> (venue: FirmwareVenue, fieldName: T): FirmwareVenueVersion[T] | undefined {
  if (!venue.versions) {
    return undefined
  }

  const apVersion = venue.versions.filter(typeIsApFunc)
  return apVersion.length > 0 ? apVersion[0][fieldName] : undefined
}

const transform = firmwareTypeTrans()

export const getVersionLabel = (version: FirmwareVersion): string => {
  const versionName = version.name
  const versionType = transform(version.category)
  const versionOnboardDate = transformToUserDate(version)

  return `${versionName} (${versionType}) ${versionOnboardDate ? '- ' + versionOnboardDate : ''}`
}

const transformToUserDate = (firmwareVersion: FirmwareVersion): string | undefined => {
  return toUserDate(firmwareVersion.onboardDate as string)
}

const toUserDate = (date: string): string => {
  if (date) {
    return getDateByFormat(date, 'MM/DD/YYYY hh:mm A')
  }
  return date
}

const getDateByFormat = (date: string, format: string) => {
  return moment(date).format(format)
}

export const toTimeString = (value?: string) => {
  return value ? moment(value).utc().format('MM/DD/YYYY') : ''
}

export const returnExpirationString = (data: Partial<MacRegistrationPool>) => {
  const { $t } = getIntl()
  if (!data.expirationEnabled) {
    return $t({ defaultMessage: 'Never expires' })
  } else {
    if (data.expirationType === ExpirationType.SPECIFIED_DATE) {
      return toTimeString(data?.expirationDate)
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
      expirationDate: moment.utc(data.date).format('YYYY-MM-DDT23:59:59[Z]'),
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

export const transferDataToExpirationFormFields = (data: MacRegistrationPool) => {
  let expiration: ExpirationDateEntity = new ExpirationDateEntity()
  if (!data.expirationEnabled) {
    expiration.setToNever()
  } else if (data.expirationType === ExpirationType.SPECIFIED_DATE) {
    expiration.setToByDate(data.expirationDate!)
  } else {
    expiration.setToAfterTime(data.expirationType!, data.expirationOffset!)
  }
  return { expiration }
}
