import React from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PasswordInput }          from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import {
  NetworkSaveData,
  PskWlanSecurityEnum,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'

import { AaaSummary }            from './AaaSummary'
import { MacAuthenticationInfo } from './MacAuthenticationInfo'

export function PskSummaryForm (props: {
  summaryData: NetworkSaveData;
}) {
  const { $t } = useIntl()
  const { summaryData } = props
  const isSupportNetworkRadiusAccounting =
    useIsSplitOn(Features.WIFI_NETWORK_RADIUS_ACCOUNTING_TOGGLE)

  const isDisplayAuth = (summaryData.authRadius && summaryData.wlan?.macAddressAuthentication &&
    !summaryData.wlan?.isMacRegistrationList)
  const isDisplayAccounting = (isSupportNetworkRadiusAccounting) ? true : isDisplayAuth

  return (
    <>
      {summaryData.wlan?.wlanSecurity !== WlanSecurityEnum.WPA3 &&
        summaryData.wlan?.wlanSecurity !== WlanSecurityEnum.WEP &&
        summaryData.wlan?.passphrase && (
        <Form.Item
          label={
            summaryData.wlanSecurity === WlanSecurityEnum.WPA23Mixed
              ? $t({ defaultMessage: 'WPA2 Passphrase:' })
              : $t({ defaultMessage: 'Passphrase:' })
          }
          children={
            <PasswordInput
              readOnly
              bordered={false}
              value={summaryData.wlan?.passphrase}
            />
          }
        />
      )}
      {(summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WPA3 ||
        summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WPA23Mixed) &&
        summaryData.wlan?.saePassphrase && (
        <Form.Item
          label={
            summaryData.wlanSecurity === WlanSecurityEnum.WPA3
              ? $t({ defaultMessage: 'SAE Passphrase:' })
              : $t({ defaultMessage: 'WPA3 SAE Passphrase:' })
          }
          children={
            <PasswordInput
              readOnly
              bordered={false}
              value={summaryData.wlan?.saePassphrase}
            />
          }
        />
      )}
      {summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WEP &&
        summaryData.wlan?.wepHexKey && (
        <Form.Item
          label={$t({ defaultMessage: 'Hex Key:' })}
          children={
            <PasswordInput
              readOnly
              bordered={false}
              value={summaryData.wlan?.wepHexKey}
            />
          }
        />
      )}
      <Form.Item
        label={$t({ defaultMessage: 'Security Protocol:' })}
        children={
          PskWlanSecurityEnum[
            summaryData.wlan?.wlanSecurity as keyof typeof PskWlanSecurityEnum
          ]
        }
      />
      {summaryData.wlan?.managementFrameProtection && (
        <Form.Item
          label={$t({ defaultMessage: 'Management Frame Protection:' })}
          children={summaryData.wlan?.managementFrameProtection}
        />
      )}

      <MacAuthenticationInfo summaryData={summaryData} />
      <AaaSummary
        summaryData={summaryData}
        isDisplayAuth={isDisplayAuth}
        isDisplayAccounting={isDisplayAccounting}
      />
    </>
  )
}
