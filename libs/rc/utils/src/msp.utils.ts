import moment from 'moment-timezone'

import {
  EntitlementDeviceType,
  EntitlementDeviceSubType,
  EntitlementNetworkDeviceType,
  MspEntitlement }
  from './types/msp'

export class EntitlementUtil {
  public static deviceSubTypeToText (deviceSubType: EntitlementDeviceSubType): string {
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
      case EntitlementDeviceSubType.ICXTEMP:
      case EntitlementDeviceSubType.ICX_ANY:
      case EntitlementDeviceSubType.MSP_WIFI_TEMP:
        return 'Trial'
      case EntitlementDeviceSubType.MSP_WIFI:
        return 'Wi-Fi'
    }
    return ''
  }

  public static getNetworkDeviceTypeUnitText (networkDeviceType: EntitlementNetworkDeviceType,
    count: number): string {
    const unitArray = [count, ' ']

    switch (networkDeviceType) {
      case EntitlementNetworkDeviceType.SWITCH:
        unitArray.push(count > 1 ? 'Switches' : 'Switch')
        break
      case EntitlementNetworkDeviceType.WIFI:
        unitArray.push(count > 1 ? 'APs' : 'AP')
        break
      case EntitlementNetworkDeviceType.LTE:
        unitArray.push(count > 1 ? 'APs' : 'AP')
        break
    }
    return unitArray.join('')
  }

  public static getMspDeviceTypeUnitText (deviceType: EntitlementDeviceType,
    count: number): string {
    const unitArray = [count, ' ']

    switch (deviceType) {
      case 'MSP_SWITCH':
        unitArray.push(count > 1 ? 'Switches' : 'Switch')
        break
      case 'MSP_WIFI':
        unitArray.push(count > 1 ? 'APs' : 'AP')
        break
    }
    return unitArray.join('')
  }

  public static tempLicenseToString (isTempLicense:boolean): string {
    return isTempLicense ? 'Trial' : 'Basic'
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
}

function isExpired () {
  return 'Expired'
}

function displayDays (timeLeft: number) {
  return `${timeLeft} ${(timeLeft === 1 ? 'day' : 'days')}`
}

function displayMonths (timeLeft: number) {
  let monthsValue = timeLeft / 30
  monthsValue = Math.floor(monthsValue)
  if (monthsValue === 12) {
    monthsValue = 11
  }
  return `More than ${monthsValue} Months`
}

function displayYears (timeLeft: number) {
  const yearsValue = timeLeft / 365
  const yearsValueFloored = Math.floor(yearsValue)
  if (yearsValue === yearsValueFloored) {
    return `${yearsValueFloored} ${(yearsValueFloored > 1 ? 'Years' : 'Year')}`
  } else {
    return `More than ${yearsValueFloored} ${(yearsValueFloored > 1 ? 'Years' : 'Year')}`
  }
}
