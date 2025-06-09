import React from 'react'

import { Form }    from 'antd'
import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { PasswordInput }                                          from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  Regions,
  NetworkSaveData,
  WisprPage,
  useConfigTemplate
} from '@acx-ui/rc/utils'

import * as contents from '../contentsMap'

export function AuthAccServerSummary (props: {
  summaryData: Regions|WisprPage|NetworkSaveData;
  isCloudPath?: boolean;
  enableAuthProxy?: boolean;
  enableAcctProxy?: boolean;
}) {
  const { $t } = useIntl()
  const { summaryData, isCloudPath, enableAcctProxy, enableAuthProxy } = props
  return (<>
    {summaryData.authRadius && <>
      {$t({ defaultMessage: 'Authentication Service' })}
      <div style={{ marginTop: 6, backgroundColor: 'var(--acx-neutrals-20)',
        width: 210, paddingLeft: 5 }}>
        {isCloudPath&&
          <Form.Item
            label={$t({ defaultMessage: 'Proxy Service' })}
            children={enableAuthProxy?$t({ defaultMessage: 'Enabled' })
              :$t({ defaultMessage: 'Disabled' })}
          />
        }
        <AaaServerFields
          serverType={AaaServerTypeEnum.AUTHENTICATION}
          data={summaryData}
        /></div>
    </>}
    {summaryData.accountingRadius && <>
      {$t({ defaultMessage: 'Accounting Service' })}
      <div style={{ marginTop: 6, backgroundColor: 'var(--acx-neutrals-20)',
        width: 210, paddingLeft: 5 }}>
        {isCloudPath&&
          <Form.Item
            label={$t({ defaultMessage: 'Proxy Service' })}
            children={enableAcctProxy?$t({ defaultMessage: 'Enabled' })
              :$t({ defaultMessage: 'Disabled' })}
          />
        }
        <AaaServerFields
          serverType={AaaServerTypeEnum.ACCOUNTING}
          data={summaryData}
        /></div>
    </>}
  </>)
}

function AaaServerFields ({ serverType, data }: {
  serverType: AaaServerTypeEnum,
  data: Regions|WisprPage|NetworkSaveData
}) {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate

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
    {supportRadsec &&
      <Form.Item
        label={$t({ defaultMessage: 'RadSec' })}
        children={$t({ defaultMessage: '{tlsEnabled}' }, {
          tlsEnabled: get(data, `${serverType}.radSecOptions.tlsEnabled`) ? 'On' : 'Off'
        })}
      />}
  </>)
}

function AaaServerData ({ order, data, serverType }: {
  data: Regions|WisprPage|NetworkSaveData,
  serverType: AaaServerTypeEnum
  order: AaaServerOrderEnum
}) {
  const { $t } = useIntl()
  const tlsEnabled = get(data, `${serverType}.radSecOptions.tlsEnabled`)
  const secret = get(data, `${serverType}.${order}.sharedSecret`)
  return (<>
    <Form.Item
      label={$t(contents.aaaServerTypes[order])}
      children={$t({ defaultMessage: '{ipAddress}:{port}' }, {
        ipAddress: get(data, `${serverType}.${order}.ip`),
        port: get(data, `${serverType}.${order}.port`)
      })} />
    {!tlsEnabled && secret && <Form.Item
      label={$t({ defaultMessage: 'Shared Secret' })}
      children={<PasswordInput
        readOnly
        bordered={false}
        value={secret}
      />}
    />}
  </>
  )
}
