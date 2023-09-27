import moment, { Moment }           from 'moment-timezone'
import { defineMessage, IntlShape } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import {
  MspEntitlement,
  EntitlementDeviceType,
  EntitlementDeviceSubType,
  EntitlementNetworkDeviceType
} from './types'

const devicesCountMap = {
  switch: defineMessage({
    defaultMessage: '{count} {count, plural, one {Switch} other {Switches}}',
    description: 'Translation strings - Switch, Switches'
  }),
  ap: defineMessage({
    defaultMessage: '{count} {count, plural, one {AP} other {APs}}',
    description: 'Translation strings - AP, APs'
  })
}


export class EntitlementUtil {
  public static getMspDeviceTypeText (deviceType: EntitlementDeviceType): string {
    switch (deviceType) {
      case 'MSP_SWITCH':
        return 'Switch'
      case 'MSP_WIFI':
        return 'Wi-Fi'
    }
    return 'Wi-Fi'
  }

  public static getDeviceTypeText ($t: IntlShape['$t'], deviceType: EntitlementDeviceType): string {
    switch (deviceType) {
      case EntitlementDeviceType.WIFI:
      case EntitlementDeviceType.MSP_WIFI:
        return $t({ defaultMessage: 'Wi-Fi' })
      case EntitlementDeviceType.SWITCH:
      case EntitlementDeviceType.MSP_SWITCH:
        return $t({ defaultMessage: 'Switch' })
      case EntitlementDeviceType.LTE:
        return $t({ defaultMessage: 'LTE' })
      case EntitlementDeviceType.ANALYTICS:
        return $t({ defaultMessage: 'Analytics' })
      case EntitlementDeviceType.EDGE:
        return $t({ defaultMessage: 'SmartEdge' })
      case EntitlementDeviceType.APSW:
      case EntitlementDeviceType.MSP_APSW:
        return $t({ defaultMessage: 'Devices' })
      default:
        return ''
    }
  }

  public static deviceSubTypeToText (deviceSubType: EntitlementDeviceSubType | undefined): string {
    switch (deviceSubType) {
      case EntitlementDeviceSubType.ICX71L:
        return 'ICX 7150-C08P'
      case EntitlementDeviceSubType.ICX71:
        return 'ICX 7150'
      case EntitlementDeviceSubType.ICX75:
        return 'ICX 7550'
      case EntitlementDeviceSubType.ICX76:
        return 'ICX 7650'
      case EntitlementDeviceSubType.ICX78:
        return 'ICX 7850'
      case EntitlementDeviceSubType.ICX82:
        return 'ICX 8200'
      case EntitlementDeviceSubType.ICXTEMP:
      case EntitlementDeviceSubType.ICX_ANY:
      case EntitlementDeviceSubType.MSP_WIFI_TEMP:
        return getIntl().$t({ defaultMessage: 'Trial' })
      case EntitlementDeviceSubType.MSP_WIFI:
        return 'Wi-Fi'
      case EntitlementDeviceSubType.ICX:
        return 'Basic'
    }
    return ''
  }

  public static getNetworkDeviceTypeUnitText (networkDeviceType: EntitlementNetworkDeviceType,
    count: number): string {
    let type: keyof typeof devicesCountMap
    switch (networkDeviceType) {
      case EntitlementNetworkDeviceType.SWITCH: type = 'switch'; break
      case EntitlementNetworkDeviceType.WIFI:
      case EntitlementNetworkDeviceType.LTE: type = 'ap'; break
      default:
        return ''
    }
    return getIntl().$t(devicesCountMap[type], { count })
  }

  public static getMspDeviceTypeUnitText (deviceType: EntitlementDeviceType,
    count: number): string {
    let type: keyof typeof devicesCountMap = 'ap'
    switch (deviceType) {
      case 'MSP_SWITCH': type = 'switch'; break
      case 'MSP_WIFI': type = 'ap'; break
      default:
        return ''
    }
    return getIntl().$t(devicesCountMap[type], { count })
  }

  public static tempLicenseToString (isTempLicense:boolean): string {
    return isTempLicense ? getIntl().$t({ defaultMessage: 'Trial' }) :
      getIntl().$t({ defaultMessage: 'Basic' })
  }

  public static hasMspEntitlement (entitlementsData: MspEntitlement[]): boolean {
    if (entitlementsData && entitlementsData.length > 0) {
      for (let i = 0; i < entitlementsData.length; i++ ) {
        if (entitlementsData[i].quantity > 0) {
          return true
        }
      }
    }
    return false
  }

  public static timeLeftInDays (expirationDate: string) {
    const newDate = new Date(expirationDate)
    // expiration date should be end of UTC date
    newDate.setUTCHours(23)
    newDate.setUTCMinutes(59)
    newDate.setUTCSeconds(59)

    const hoursLeft = moment(newDate).diff(moment(), 'hours')
    const remainingDays = Math.round(hoursLeft / 24)
    return remainingDays
  }

  public static timeLeftValues (timeLeft: number) {
    if (timeLeft < 0) {
      return isExpired()
    } else if (timeLeft <= 60 && timeLeft >= 0) {
      return displayDays(timeLeft)
    } else if (timeLeft >= 61 && timeLeft < 365) {
      return displayMonths(timeLeft)
    } else if (timeLeft >= 365) {
      return displayYears(timeLeft)
    }
    return ''
  }

  public static getServiceStartDate (startDate?: string) {
    const today = startDate ? new Date(startDate) : new Date()
    const dateFormat = 'YYYY-MM-DD HH:mm:ss[Z]'
    return moment(today.toUTCString()).format(dateFormat)
  }

  public static getServiceEndDate (endDate?: string | Moment) {
    // const expiredDate = DateTimeUtilsService.getDateFromMomentByFormat(this.mspEcEndDate.value, this.userDateFormat);
    // expiredDate.setHours(23);
    // expiredDate.setMinutes(59);
    // expiredDate.setSeconds(59);
    const expiredDate = endDate ? new Date(endDate.toString()) : undefined
    const dateFormat = 'YYYY-MM-DD HH:mm:ss[Z]'
    return moment(expiredDate?.toUTCString()).format(dateFormat)
  }
}

function isExpired () {
  return getIntl().$t({ defaultMessage: 'Expired' })
}

function displayDays (timeLeft: number) {
  return getIntl().$t({ defaultMessage:
    '{days} {days, plural, one {day} other {days}}' }, { days: timeLeft })
}

function displayMonths (timeLeft: number) {
  let monthsValue = timeLeft / 30
  monthsValue = Math.floor(monthsValue)
  if (monthsValue === 12) {
    monthsValue = 11
  }
  return getIntl().$t({ defaultMessage:
    'More than {months} {months, plural, one {Month} other {Months}}' }, { months: monthsValue })
}

function displayYears (timeLeft: number) {
  const yearsValue = timeLeft / 365
  const yearsValueFloored = Math.floor(yearsValue)
  if (yearsValue === yearsValueFloored) {
    return getIntl().$t({ defaultMessage:
      '{years} {years, plural, one {Year} other {Years}}' }, { years: yearsValueFloored })
  } else {
    return getIntl().$t({ defaultMessage:
      'More than {years} {years, plural, one {Year} other {Years}}' }, { years: yearsValueFloored })
  }
}