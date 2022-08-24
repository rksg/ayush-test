import React from 'react'

import { Form, Input } from 'antd'
import { get }         from 'lodash'
import { useIntl }     from 'react-intl'

import {
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  NetworkSaveData
} from '@acx-ui/rc/utils'

import * as contents from '../contentsMap'

export function AaaSummaryForm (props: {
  summaryData: NetworkSaveData
}) {
  const { $t } = useIntl()
  const { summaryData } = props
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

function AaaServerFields ({ serverType, data }: {
  serverType: AaaServerTypeEnum,
  data: NetworkSaveData
}) {
  const { $t } = useIntl()
  const enableSecondaryServer = serverType === AaaServerTypeEnum.AUTHENTICATION ?
    data.enableSecondaryAuthServer :
    data.enableSecondaryAcctServer

  const enableProxy = serverType === AaaServerTypeEnum.AUTHENTICATION ?
    data.enableAuthProxy : data.enableAccountingProxy

  return (<>
    <AaaServerData
      data={data}
      serverType={serverType}
      order={AaaServerOrderEnum.PRIMARY}
    />
    {enableSecondaryServer && <AaaServerData
      data={data}
      serverType={serverType}
      order={AaaServerOrderEnum.SECONDARY}
    />}
    <Form.Item
      label={$t({ defaultMessage: 'Proxy Service:' })}
      children={$t(enableProxy ? contents.states.enabled : contents.states.disabled)} />
    <Form.Item
      label={$t({ defaultMessage: 'TLS Encryption:' })}
      children={$t(contents.states.disabled)} />
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
      children={<Input.Password
        readOnly
        bordered={false}
        value={get(data, `${serverType}.${order}.sharedSecret`)}
      />}
    />
  </>)
}
