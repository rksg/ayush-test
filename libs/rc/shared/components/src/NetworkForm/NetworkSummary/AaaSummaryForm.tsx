import React from 'react'

import { Form }    from 'antd'
import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { PasswordInput } from '@acx-ui/components'
import {
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  NetworkSaveData,
  macAuthMacFormatOptions
} from '@acx-ui/rc/utils'

import * as contents from '../contentsMap'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
export function AaaSummaryForm (props: {
  summaryData: NetworkSaveData
}) {
  const { summaryData } = props
  const { $t } = useIntl()
  const support8021xMacAuth = useIsSplitOn(Features.WIFI_8021X_MAC_AUTH_TOGGLE)
  return (<>
    {get(summaryData, 'authRadius.primary.ip') !== undefined && <>
      {$t({ defaultMessage: 'Authentication Service' })}
      <AaaServerFields
        serverType={AaaServerTypeEnum.AUTHENTICATION}
        data={summaryData}
      />
    </>}
    {summaryData.enableAccountingService && <>
      {$t({ defaultMessage: 'Accounting Service' })}
      <AaaServerFields
        serverType={AaaServerTypeEnum.ACCOUNTING}
        data={summaryData}
      />
    </>}
    {support8021xMacAuth &&
      <Form.Item
        label={$t({ defaultMessage: 'MAC Authentication' })}
        children={
          summaryData.wlan?.macAddressAuthenticationConfiguration?.macAddressAuthentication?
          $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' })} />
    }
    {support8021xMacAuth &&
     summaryData.wlan?.macAddressAuthenticationConfiguration?.macAddressAuthentication &&
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
function AaaServerFields ({ serverType, data }: {
  serverType: AaaServerTypeEnum,
  data: NetworkSaveData
}) {
  const { $t } = useIntl()

  const enableProxy = serverType === AaaServerTypeEnum.AUTHENTICATION ?
    data.enableAuthProxy : data.enableAccountingProxy

  return (<>
    <AaaServerData
      data={data}
      serverType={serverType}
      order={AaaServerOrderEnum.PRIMARY}
    />
    {data[serverType]?.secondary && <AaaServerData
      data={data}
      serverType={serverType}
      order={AaaServerOrderEnum.SECONDARY}
    />}
    <Form.Item
      label={$t({ defaultMessage: 'Proxy Service:' })}
      children={$t(enableProxy ? contents.states.enabled : contents.states.disabled)} />
  </>)
}
function AaaServerData ({ order, data, serverType }: {
  data: NetworkSaveData,
  serverType: AaaServerTypeEnum
  order: AaaServerOrderEnum
}) {
  const { $t } = useIntl()
  return (<>
    <Form.Item
      label={$t(contents.aaaServerTypes[order])}
      children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
        ipAddress: get(data, `${serverType}.${order}.ip`),
        port: get(data, `${serverType}.${order}.port`)
      })} />
    <Form.Item
      label={$t({ defaultMessage: 'Shared Secret:' })}
      children={<PasswordInput
        readOnly
        bordered={false}
        value={get(data, `${serverType}.${order}.sharedSecret`)}
      />}
    />
  </>)
}
