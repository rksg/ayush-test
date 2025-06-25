import React from 'react'

import { Form }    from 'antd'
import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { Features,  useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  NetworkSaveData,
  macAuthMacFormatOptions
} from '@acx-ui/rc/utils'

import { AaaSummary } from './AaaSummary'
export function AaaSummaryForm (props: {
  summaryData: NetworkSaveData
}) {
  const { summaryData } = props
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const isSupportNetworkRadiusAccounting = useIsSplitOn(Features.WIFI_NETWORK_RADIUS_ACCOUNTING_TOGGLE)

  const isDisplayAuth = (summaryData.authRadius &&
    get(summaryData, 'authRadius.primary.ip') !== undefined)

  const isDisplayAccounting = (isSupportNetworkRadiusAccounting)? true :
    !!summaryData.useCertificateTemplate

  return (<>
    <AaaSummary
      summaryData={summaryData}
      isDisplayAuth={isDisplayAuth}
      isDisplayAccounting={isDisplayAccounting}
    />
    <Form.Item
      label={$t({ defaultMessage: 'MAC Authentication' })}
      children={
        summaryData.wlan?.macAddressAuthenticationConfiguration?.macAddressAuthentication?
          $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' })} />
    {summaryData.wlan?.macAddressAuthenticationConfiguration?.macAddressAuthentication &&
      <Form.Item
        label={$t({ defaultMessage: 'MAC Address Format' })}
        children={
          macAuthMacFormatOptions[
            // eslint-disable-next-line max-len
            summaryData.wlan?.macAddressAuthenticationConfiguration?.macAuthMacFormat as keyof typeof macAuthMacFormatOptions
          ]
        }/>
    }
  </>)
}
