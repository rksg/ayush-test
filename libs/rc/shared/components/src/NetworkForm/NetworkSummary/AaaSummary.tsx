import React from 'react'

import { Form }    from 'antd'
import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { PasswordInput } from '@acx-ui/components'
import {
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  NetworkSaveData
} from '@acx-ui/rc/utils'

import * as contents from '../contentsMap'

type AaaSummaryProps = {
  summaryData: NetworkSaveData
}

type AaaServerFieldsProps = {
  serverType: AaaServerTypeEnum,
  data: NetworkSaveData
}

type AaaServerDataProps = {
  serverType: AaaServerTypeEnum
  data: NetworkSaveData,
  order: AaaServerOrderEnum
}

export const AaaSummary = (props: AaaSummaryProps) => {
  const { summaryData } = props
  const { $t } = useIntl()
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
  </>)
}

const AaaServerFields = (props: AaaServerFieldsProps) => {
  const { $t } = useIntl()
  const { serverType, data } = props

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
      label={$t({ defaultMessage: 'RadSec' })}
      children={$t({ defaultMessage: '{tlsEnabled}' }, {
        tlsEnabled: data[serverType]?.radSecOptions?.tlsEnabled ? 'On' : 'Off'
      })}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Proxy Service:' })}
      children={$t(enableProxy ? contents.states.enabled : contents.states.disabled)} />
  </>)
}


const AaaServerData = (props: AaaServerDataProps) => {
  const { $t } = useIntl()
  const { serverType, data, order } = props

  const tlsEnabled = get(data, `${serverType}.radSecOptions.tlsEnabled`)
  const sharedSecret = get(data, `${serverType}.${order}.sharedSecret`)
  return (<>
    <Form.Item
      label={$t(contents.aaaServerTypes[order])}
      children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
        ipAddress: get(data, `${serverType}.${order}.ip`),
        port: get(data, `${serverType}.${order}.port`)
      })} />
    {!tlsEnabled && sharedSecret && <Form.Item
      label={$t({ defaultMessage: 'Shared Secret:' })}
      children={<PasswordInput
        readOnly
        bordered={false}
        value={sharedSecret}
      />}
    />}
  </>)
}
