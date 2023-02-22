/* eslint-disable max-len */
import { useIntl }       from 'react-intl'
import { defineMessage } from 'react-intl'

import {
  LicenseBannerTypeEnum
} from '@acx-ui/rc/utils'
import { formatter } from '@acx-ui/utils'

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

export const LicenseBannerDescMapping = (expireInfo:ExpireInfo)=> {
  const { $t } = useIntl()
  return {
    [LicenseBannerTypeEnum.ra_below_50_percent]: {
      btnText: $t({ defaultMessage: 'To restore the service - contact RUCKUS sales team' })
    },
    [LicenseBannerTypeEnum.ra_50_to_90_percent]: {
      btnText: $t({ defaultMessage: 'To ensure data collection - contact RUCKUS sales team' })
    },

    [LicenseBannerTypeEnum.ra_onboard_only]: {
      btnText: $t({ defaultMessage: 'For permanent subscription or to learn more about RUCKUS Analytics - click here' })
    },
    [LicenseBannerTypeEnum.initial]: {
      content: $t({ defaultMessage: 'Ensure service level' }),
      btnText: ', ' + $t({ defaultMessage: 'Act now' })
    },
    [LicenseBannerTypeEnum.closeToExpiration]: {
      content: $t({ defaultMessage: 'Ensure service level' }),
      btnText: ', ' + $t({ defaultMessage: 'Act now' })
    },
    [LicenseBannerTypeEnum.gracePeriod]: {
      content: $t({ defaultMessage: '{expireDeviceType} configuration will be deleted on {graceDate}' },
        {
          expireDeviceType: $t(deviceTypeText[expireInfo.deviceType]),
          graceDate: formatter('dateFormat')(expireInfo.effectDate)
        }),
      btnText: ', ' + $t({ defaultMessage: 'Act now' })
    },
    [LicenseBannerTypeEnum.expired]: {
      content: $t({ defaultMessage: '{expireDeviceType} configuration was deleted' },
        {
          expireDeviceType: $t(deviceTypeText[expireInfo.deviceType])
        })
    },
    [LicenseBannerTypeEnum.msp_expired]: {
      content: $t({ defaultMessage: 'MSP subscriptions have expired' })
    }
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

export const MSPLicenseBannerDescMapping = (expireInfo:ExpireInfo)=> {
  const { $t } = useIntl()
  return {
    [LicenseBannerTypeEnum.ra_below_50_percent]: {
      btnText: $t({ defaultMessage: 'To restore the service - contact RUCKUS sales team' })
    },
    [LicenseBannerTypeEnum.ra_50_to_90_percent]: {
      btnText: $t({ defaultMessage: 'To ensure data collection - contact RUCKUS sales team' })
    },

    [LicenseBannerTypeEnum.ra_onboard_only]: {
      btnText: $t({ defaultMessage: 'For permanent subscription or to learn more about RUCKUS Analytics - click here' })
    },
    [LicenseBannerTypeEnum.initial]: {
      content: $t({ defaultMessage: 'Ensure service level' }),
      btnText: ', ' + $t({ defaultMessage: 'Act now' })
    },
    [LicenseBannerTypeEnum.closeToExpiration]: {
      content: $t({ defaultMessage: 'Ensure service level' }),
      btnText: ', ' + $t({ defaultMessage: 'Act now' })
    },
    [LicenseBannerTypeEnum.gracePeriod]: {
      content: $t({ defaultMessage: '{expireDeviceType} configuration will be deleted on {graceDate}' },
        {
          expireDeviceType: $t(deviceTypeText[expireInfo.deviceType]),
          graceDate: formatter('dateFormat')(expireInfo.effectDate)
        }),
      btnText: ', ' + $t({ defaultMessage: 'Act now' })
    },
    [LicenseBannerTypeEnum.expired]: {
      content: $t({ defaultMessage: 'MSP license usage exceeds limit' }),
      btnText: ', ' + $t({ defaultMessage: 'Act now' })
    },
    [LicenseBannerTypeEnum.msp_expired]: {
      content: $t({ defaultMessage: 'MSP license usage exceeds limit' }),
      btnText: ', ' + $t({ defaultMessage: 'Act now' })
    }
  }
}
