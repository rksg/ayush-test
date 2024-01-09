/* eslint-disable max-len */
import { defineMessage, IntlShape } from 'react-intl'

import {
  LicenseBannerTypeEnum,
  EntitlementUtil
} from '@acx-ui/rc/utils'


import { ExpireInfo } from './'


export const LicenseBannerRemindMapping = (expireInfo:ExpireInfo, $t: IntlShape['$t'])=> {

  const isMulti = expireInfo.isMultipleLicense
  const param = { deviceText: EntitlementUtil.getDeviceTypeText($t, expireInfo.deviceType), daysText: expireInfo.effectDays, deviceCount: expireInfo.deviceCount }

  return {
    [LicenseBannerTypeEnum.gracePeriod]: isMulti ? $t({ defaultMessage: 'Your RUCKUS One subscription has expired. You can use the application for {daysText} days' }, param):
      $t({ defaultMessage: 'Your RUCKUS One subscription for {deviceCount} {deviceText} has expired.  You can use the application for {daysText} days' }, param),
    [LicenseBannerTypeEnum.initial]: isMulti ? $t({ defaultMessage: 'Subscription about to expire in {daysText} days' }, param)
      : $t({ defaultMessage: 'Your RUCKUS One subscription for {deviceCount} {deviceText} expires in {daysText} days' }, param),
    [LicenseBannerTypeEnum.closeToExpiration]: isMulti ? $t({ defaultMessage: 'Subscription for {deviceCount} {deviceText} expires in {daysText} days' }, param):
      $t({ defaultMessage: 'Your RUCKUS One subscription for {deviceText} will expire in {daysText} days' }, param),
    [LicenseBannerTypeEnum.expired]: $t({ defaultMessage: 'Your RUCKUS One subscriptions have expired' }),
    [LicenseBannerTypeEnum.msp_expired]: $t({ defaultMessage: 'Due to MSP subscriptions expiration, the number of your assigned subscriptions({deviceCount}) exceeds the number of available MSP subscriptions' }, { deviceCount: expireInfo.deviceCount })
  }
}

export const LicenseBannerDescMapping = ()=> {
  return {
    [LicenseBannerTypeEnum.initial]: defineMessage({
      defaultMessage: '<a>Renew</a><b> your subscription</b>'
    }),
    [LicenseBannerTypeEnum.closeToExpiration]: defineMessage({
      defaultMessage: '<a>Renew</a><b> your subscription</b>'
    }),
    [LicenseBannerTypeEnum.gracePeriod]: defineMessage({
      defaultMessage: '<a>Renew</a><b> your subscription</b>'
    }),
    [LicenseBannerTypeEnum.expired]: defineMessage({
      defaultMessage: '<a>Renew</a><b> your subscription</b>'
    }),
    [LicenseBannerTypeEnum.msp_expired]: defineMessage({
      defaultMessage: '<a>Renew</a><b> your subscription</b>'
    })
  }
}


export const MSPLicenseBannerRemindMapping = (expireInfo:ExpireInfo, $t: IntlShape['$t'])=> {
  const isMulti = expireInfo.isMultipleLicense
  const param = {
    deviceText: EntitlementUtil.getDeviceTypeText($t, expireInfo.deviceType),
    daysText: expireInfo.effectDays,
    deviceCount: expireInfo.deviceCount }

  return {
    [LicenseBannerTypeEnum.gracePeriod]: isMulti ? $t({ defaultMessage: 'Your subscription expired. Grace period ends in {daysText} days' }, param):
      $t({ defaultMessage: 'Your subscription for {deviceCount} {deviceText} expired. Grace period ends in {daysText} days' }, param),
    [LicenseBannerTypeEnum.initial]: isMulti ? $t({ defaultMessage: 'MSP subscription for {deviceCount} {deviceText} will expire in {daysText} days' }, param)
      : $t({ defaultMessage: 'MSP subscription about to expire in {daysText} days' }, param),
    [LicenseBannerTypeEnum.closeToExpiration]: isMulti ? $t({ defaultMessage: 'MSP subscription for {deviceCount} {deviceText} will expire in {daysText} days' }, param)
      : $t({ defaultMessage: 'MSP subscription about to expire in {daysText} days' }, param),
    [LicenseBannerTypeEnum.expired]: isMulti ? $t({ defaultMessage: 'MSP licenses have expired' })
      : $t({ defaultMessage: 'MSP subscription has expired' }),
    [LicenseBannerTypeEnum.msp_expired]: isMulti ? $t({ defaultMessage: 'MSP licenses have expired' })
      : $t({ defaultMessage: 'MSP subscription has expired' })
  }
}

export const MSPLicenseBannerDescMapping = ()=> {
  return {
    [LicenseBannerTypeEnum.initial]: defineMessage({
      defaultMessage: '<b>Ensure service level</b>, <a>Act now</a>'
    }),
    [LicenseBannerTypeEnum.closeToExpiration]: defineMessage({
      defaultMessage: '<b>Ensure service level</b>, <a>Act now</a>'
    }),
    [LicenseBannerTypeEnum.gracePeriod]: defineMessage({
      defaultMessage: '<b>{expireDeviceType} configuration may be deleted on {graceDate}</b>, <a>Act now</a> <b>to prevent outage</b>'
    }),
    [LicenseBannerTypeEnum.expired]: defineMessage({
      defaultMessage: '<b>MSP subscriptions usage exceeds limit</b>'
    }),
    [LicenseBannerTypeEnum.msp_expired]: defineMessage({
      defaultMessage: '<b>MSP subscriptions usage exceeds limit</b>, <a>Act now</a>'
    })
  }
}
