import React from 'react'

import { Form }    from 'antd'
import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import {
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  Regions
} from '@acx-ui/rc/utils'

import * as contents from '../contentsMap'

export function AuthAccServerSummary (props: {
  summaryData: Regions;
}) {
  const { $t } = useIntl()
  const { summaryData } = props
  return (<>
    {summaryData.authRadius && <>
      {$t({ defaultMessage: 'Authentication Service' })}
      <AaaServerFields
        serverType={AaaServerTypeEnum.AUTHENTICATION}
        data={summaryData}
      />
    </>}
    {summaryData.accountingRadius && <>
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
  data: Regions
}) {
  const enableSecondaryServer = serverType === AaaServerTypeEnum.AUTHENTICATION ?
    data.authRadius?.secondary :
    data.accountingRadius?.secondary

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
  </>)
}

function AaaServerData ({ order, data, serverType }: {
  data: Regions,
  serverType: AaaServerTypeEnum
  order: AaaServerOrderEnum
}) {
  const { $t } = useIntl()
  return (
    <Form.Item
      label={$t(contents.aaaServerTypes[order])}
      children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
        ipAddress: get(data, `${serverType}.${order}.ip`),
        port: get(data, `${serverType}.${order}.port`)
      })} />
  )
}
