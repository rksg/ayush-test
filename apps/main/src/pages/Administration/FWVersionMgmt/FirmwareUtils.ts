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

export const AVAILABLE_DAYS: Array<{ value: string, label: string }> = [
  { value: 'Sunday', label: 'Sunday' },
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' }
]

export const AVAILABLE_SLOTS: Array<{ value: string, label: string }> = [
  { value: '00:00-02:00', label: '12 AM - 02 AM' },
  { value: '02:00-04:00', label: '02 AM - 04 AM' },
  { value: '04:00-06:00', label: '04 AM - 06 AM' },
  { value: '06:00-08:00', label: '06 AM - 08 AM' },
  { value: '08:00-10:00', label: '08 AM - 10 AM' },
  { value: '10:00-12:00', label: '10 AM - 12 PM' },
  { value: '12:00-14:00', label: '12 PM - 02 PM' },
  { value: '14:00-16:00', label: '02 PM - 04 PM' },
  { value: '16:00-18:00', label: '04 PM - 06 PM' },
  { value: '18:00-20:00', label: '06 PM - 08 PM' },
  { value: '20:00-22:00', label: '08 PM - 10 PM' },
  { value: '22:00-00:00', label: '10 PM - 12 AM' }
]

export const SCHEDULE_START_TIME_FORMAT = 'dddd, MMM. DD, hh A'
export const SCHEDULE_END_TIME_FORMAT = 'hh A'

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
  const versionName = version?.name
  const versionType = transform(version?.category)
  const versionOnboardDate = transformToUserDate(version)

  return `${versionName} (${versionType}) ${versionOnboardDate ? '- ' + versionOnboardDate : ''}`
}

const transformToUserDate = (firmwareVersion: FirmwareVersion): string | undefined => {
  return toUserDate(firmwareVersion?.onboardDate as string)
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
