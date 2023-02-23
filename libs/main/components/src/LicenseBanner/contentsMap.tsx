/* eslint-disable max-len */
import { useIntl, defineMessage } from 'react-intl'

import {
  LicenseBannerTypeEnum
} from '@acx-ui/rc/utils'


import { ExpireInfo } from './'

const deviceTypeText = {
  WIFI: defineMessage({ defaultMessage: 'APs' }),
  LTE: defineMessage({ defaultMessage: 'APs' }),
  SWITCH: defineMessage({ defaultMessage: 'Switch' }),
  MSP_WIFI: defineMessage({ defaultMessage: 'APs' }),
  MSP_SWITCH: defineMessage({ defaultMessage: 'Switch' }),
  ANALYTICS: defineMessage({ defaultMessage: 'Devices' })
}

export const LicenseBannerRemindMapping = (expireInfo:ExpireInfo)=> {
  const { $t } = useIntl()
  const isMulti = expireInfo.isMultipleLicense
  const param = { deviceText: $t(deviceTypeText[expireInfo.deviceType]), daysText: expireInfo.effectDays, deviceCount: expireInfo.deviceCount }
  if(expireInfo.deviceType==='ANALYTICS'){
    return {
      [LicenseBannerTypeEnum.ra_below_50_percent]: $t({ defaultMessage: 'Analytics service has been deactivated' }),
      [LicenseBannerTypeEnum.ra_50_to_90_percent]: $t({ defaultMessage: 'Insufficient number of RUCKUS Analytics subscription' }),
      [LicenseBannerTypeEnum.ra_onboard_only]: $t({ defaultMessage: 'RUCKUS Analytics Trial subscription will expire in {daysText} days' },{ daysText: expireInfo.effectDays }),
      [LicenseBannerTypeEnum.initial]: isMulti ?
        $t({ defaultMessage: 'Analytics subscription about to expire in {daysText} days' },{ daysText: expireInfo.effectDays })
        :
        $t({ defaultMessage: 'Analytics subscription for {deviceText} will expire in {daysText} days' }, param),
      [LicenseBannerTypeEnum.closeToExpiration]: isMulti ?
        $t({ defaultMessage: 'Analytics subscription will expire in {daysText} days' },{ daysText: expireInfo.effectDays })
        :
        $t({ defaultMessage: 'Analytics subscription for {deviceText} will expire in {daysText} days' }, param),
      [LicenseBannerTypeEnum.gracePeriod]: isMulti ?
        $t({ defaultMessage: 'Analytics subscription expired. Grace period ends in {daysText} days' },{ daysText: expireInfo.effectDays })
        : $t({ defaultMessage: 'Your subscription for {deviceText} expired. Grace period ends in {daysText} days' }, param),
      [LicenseBannerTypeEnum.expired]: isMulti ? $t({ defaultMessage: 'Your subscription have expired' })
        : $t({ defaultMessage: 'Your subscription has expired' }),
      [LicenseBannerTypeEnum.msp_expired]: $t({ defaultMessage: 'Your license has expired' })
    }
  }
  else{
    return {
      [LicenseBannerTypeEnum.gracePeriod]: isMulti ? $t({ defaultMessage: 'Your subscription expired. Grace period ends in {daysText} days' }, param):
        $t({ defaultMessage: 'Your subscription for {deviceCount} {deviceText} expired. Grace period ends in {daysText} days' }, param),
      [LicenseBannerTypeEnum.initial]: isMulti ? $t({ defaultMessage: 'Subscription about to expire in {daysText} days' }, param)
        : $t({ defaultMessage: 'Subscription for {deviceCount} {deviceText} will expire in {daysText} days' }, param),
      [LicenseBannerTypeEnum.closeToExpiration]: isMulti ? $t({ defaultMessage: 'Subscription for {deviceCount} {deviceText} will expire in {daysText} days' }, param):
        $t({ defaultMessage: 'Subscription for {deviceText} will expire in {daysText} days' }, param),
      [LicenseBannerTypeEnum.expired]: $t({ defaultMessage: 'Your subscriptions have expired' }),
      [LicenseBannerTypeEnum.msp_expired]: $t({ defaultMessage: 'Due to MSP subscriptions expiration, the number of your assigned subscriptions({deviceCount}) exceeds the number of available MSP subscriptions' }, { deviceCount: expireInfo.deviceCount })
    }
  }
}

export const LicenseBannerDescMapping = ()=> {
  return {
    [LicenseBannerTypeEnum.ra_below_50_percent]: defineMessage({
      defaultMessage: '<a>To restore the service - contact RUCKUS sales team</a>'
    }),
    [LicenseBannerTypeEnum.ra_50_to_90_percent]: defineMessage({
      defaultMessage: '<a>To ensure data collection - contact RUCKUS sales team</a>'
    }),
    [LicenseBannerTypeEnum.ra_onboard_only]: defineMessage({
      defaultMessage: '<a>To ensure data collection - contact RUCKUS sales team</a>'
    }),
    [LicenseBannerTypeEnum.initial]: defineMessage({
      defaultMessage: '<b>Ensure service level</b>, <a> Act now</a>'
    }),
    [LicenseBannerTypeEnum.closeToExpiration]: defineMessage({
      defaultMessage: '<b>Ensure service level</b>, <a>Act now</a>'
    }),
    [LicenseBannerTypeEnum.gracePeriod]: defineMessage({
      defaultMessage: '<b>{expireDeviceType} configuration will be deleted on {graceDate}</b>, <a>Act now</a>'
    }),
    [LicenseBannerTypeEnum.expired]: defineMessage({
      defaultMessage: '<b>{expireDeviceType} configuration was deleted</b>'
    }),
    [LicenseBannerTypeEnum.msp_expired]: defineMessage({
      defaultMessage: '<b>MSP subscriptions have expired</b>'
    })
  }
}


export const MSPLicenseBannerRemindMapping = (expireInfo:ExpireInfo)=> {
  const { $t } = useIntl()
  const isMulti = expireInfo.isMultipleLicense
  const param = { deviceText: $t(deviceTypeText[expireInfo.deviceType]), daysText: expireInfo.effectDays, deviceCount: expireInfo.deviceCount }
  if(expireInfo.deviceType==='ANALYTICS'){
    return {
      [LicenseBannerTypeEnum.ra_below_50_percent]: $t({ defaultMessage: 'Analytics service has been deactivated' }),
      [LicenseBannerTypeEnum.ra_50_to_90_percent]: $t({ defaultMessage: 'Insufficient number of RUCKUS Analytics subscription' }),
      [LicenseBannerTypeEnum.ra_onboard_only]: $t({ defaultMessage: 'RUCKUS Analytics Trial subscription will expire in {daysText} days' },{ daysText: expireInfo.effectDays }),
      [LicenseBannerTypeEnum.initial]: isMulti ?
        $t({ defaultMessage: 'Analytics subscription about to expire in {daysText} days' },{ daysText: expireInfo.effectDays })
        :
        $t({ defaultMessage: 'Analytics subscription for {deviceText} will expire in {daysText} days' }, param),
      [LicenseBannerTypeEnum.closeToExpiration]: isMulti ?
        $t({ defaultMessage: 'Analytics subscription will expire in {daysText} days' },{ daysText: expireInfo.effectDays })
        :
        $t({ defaultMessage: 'Analytics subscription for {deviceText} will expire in {daysText} days' }, param),
      [LicenseBannerTypeEnum.gracePeriod]: isMulti ?
        $t({ defaultMessage: 'Analytics subscription expired. Grace period ends in {daysText} days' },{ daysText: expireInfo.effectDays })
        : $t({ defaultMessage: 'Your subscription for {deviceText} expired. Grace period ends in {daysText} days' }, param),
      [LicenseBannerTypeEnum.expired]: isMulti ? $t({ defaultMessage: 'Your subscription have expired' })
        : $t({ defaultMessage: 'Your subscription has expired' }),
      [LicenseBannerTypeEnum.msp_expired]: isMulti ? $t({ defaultMessage: 'MSP licenses have expired' })
        : $t({ defaultMessage: 'MSP subscription has expired' })
    }
  }
  else{
    return {
      [LicenseBannerTypeEnum.gracePeriod]: isMulti ? $t({ defaultMessage: 'Your subscription expired. Grace period ends in {daysText} days' }, param):
        $t({ defaultMessage: 'Your subscription for {deviceCount} {deviceText} expired. Grace period ends in {daysText} days' }, param),
      [LicenseBannerTypeEnum.initial]: isMulti ? $t({ defaultMessage: 'MSP subscription for {deviceCount} APs will expire in {daysText} days' }, param)
        : $t({ defaultMessage: 'MSP subscription about to expire in {daysText} days' }, param),
      [LicenseBannerTypeEnum.closeToExpiration]: isMulti ? $t({ defaultMessage: 'MSP subscription for {deviceCount} APs will expire in {daysText} days' }, param)
        : $t({ defaultMessage: 'MSP subscription about to expire in {daysText} days' }, param),
      [LicenseBannerTypeEnum.expired]: isMulti ? $t({ defaultMessage: 'MSP licenses have expired' })
        : $t({ defaultMessage: 'MSP subscription has expired' }),
      [LicenseBannerTypeEnum.msp_expired]: isMulti ? $t({ defaultMessage: 'MSP licenses have expired' })
        : $t({ defaultMessage: 'MSP subscription has expired' })
    }
  }
}

export const MSPLicenseBannerDescMapping = ()=> {
  return {
    [LicenseBannerTypeEnum.ra_below_50_percent]: defineMessage({
      defaultMessage: '<a>To restore the service - contact RUCKUS sales team</a>'
    }),
    [LicenseBannerTypeEnum.ra_50_to_90_percent]: defineMessage({
      defaultMessage: '<a>To ensure data collection - contact RUCKUS sales team</a>'
    }),
    [LicenseBannerTypeEnum.ra_onboard_only]: defineMessage({
      defaultMessage: '<a>For permanent subscription or to learn more about RUCKUS Analytics - click here</a>'
    }),
    [LicenseBannerTypeEnum.initial]: defineMessage({
      defaultMessage: '<b>Ensure service level</b>, <a>Act now</a>'
    }),
    [LicenseBannerTypeEnum.closeToExpiration]: defineMessage({
      defaultMessage: '<b>Ensure service level</b>, <a>Act now</a>'
    }),
    [LicenseBannerTypeEnum.gracePeriod]: defineMessage({
      defaultMessage: '<b>{expireDeviceType} configuration will be deleted on {graceDate}</b>, <a>Act now</a>'
    }),
    [LicenseBannerTypeEnum.expired]: defineMessage({
      defaultMessage: '<b>MSP subscriptions usage exceeds limit</b>'
    }),
    [LicenseBannerTypeEnum.msp_expired]: defineMessage({
      defaultMessage: '<b>MSP subscriptions usage exceeds limit</b>, <a>Act now</a>'
    })
  }
}
