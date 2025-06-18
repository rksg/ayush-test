import React from 'react'

import { Form }    from 'antd'
import { get }     from 'lodash'
import { useIntl } from 'react-intl'

import { PasswordInput }                                          from '@acx-ui/components'
import { useIsTierAllowed, TierFeatures, useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import {
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  NetworkSaveData,
  transformDisplayOnOff,
  useConfigTemplate
} from '@acx-ui/rc/utils'

import * as contents from '../contentsMap'

type AaaSummaryProps = {
  summaryData: NetworkSaveData
  isDisplayAuth?: boolean // Define whether display the Auth service fields, default display
  isDisplayAccounting?: boolean // Define whether display the Accounting service fields, default display
}

type AaaServerFieldsProps = {
  serverType: AaaServerTypeEnum,
  data: NetworkSaveData,
  supportRadsec?:boolean
}

type AaaServerDataProps = {
  serverType: AaaServerTypeEnum
  data: NetworkSaveData,
  order: AaaServerOrderEnum
}

export const AaaSummary = (props: AaaSummaryProps) => {
  const {
    summaryData,
    isDisplayAuth = true,
    isDisplayAccounting = true
  } = props
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate

  return (<>
    {isDisplayAuth && get(summaryData, 'authRadius.primary.ip') !== undefined && <>
      {$t({ defaultMessage: 'Authentication Service' })}
      <AaaServerFields
        serverType={AaaServerTypeEnum.AUTHENTICATION}
        data={summaryData}
        supportRadsec={supportRadsec}
      />
    </>}
    {isDisplayAccounting &&
      <div>
        {$t({ defaultMessage: 'Accounting Service' })}
        <AaaServerFields
          serverType={AaaServerTypeEnum.ACCOUNTING}
          data={summaryData}
          supportRadsec={supportRadsec}
        />
      </div>
    }
  </>)
}

const AaaServerFields = (props: AaaServerFieldsProps) => {
  const { $t } = useIntl()
  const { serverType, data, supportRadsec=false } = props

  const enableProxy = serverType === AaaServerTypeEnum.AUTHENTICATION ?
    data.enableAuthProxy : data.enableAccountingProxy

  function getAccountingDisplayName (data: NetworkSaveData) {
    const isEnabled = transformDisplayOnOff(data?.enableAccountingService ?? false)
    return (data?.enableAccountingService)? `${isEnabled} (${data[serverType]?.name})`: isEnabled
  }

  const isAAAServerOn =
    !(serverType === AaaServerTypeEnum.ACCOUNTING && !!!data?.enableAccountingService)

  return (<>
    <Form.Item
      children={
        (serverType === AaaServerTypeEnum.AUTHENTICATION)?
          `${data[serverType]?.name}` :
          getAccountingDisplayName(data)
      }
    />
    {isAAAServerOn && <>
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
      {supportRadsec &&
      <Form.Item
        label={$t({ defaultMessage: 'RadSec' })}
        children={$t({ defaultMessage: '{tlsEnabled}' }, {
          tlsEnabled: transformDisplayOnOff(data[serverType]?.radSecOptions?.tlsEnabled ?? false)
        })}
      />
      }
      <Form.Item
        label={$t({ defaultMessage: 'Proxy Service:' })}
        children={$t(enableProxy ? contents.states.enabled : contents.states.disabled)} />
    </>}
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
