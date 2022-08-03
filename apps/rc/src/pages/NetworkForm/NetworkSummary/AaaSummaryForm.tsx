import React from 'react'


import { Form, Input } from 'antd'
import { get }         from 'lodash'
import { useIntl }     from 'react-intl'

import { 
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  AaaServerTitle,
  NetworkSaveData
} from '@acx-ui/rc/utils'

export function AaaSummaryForm (props: {
  summaryData: NetworkSaveData;
}) {
  const { summaryData } = props
  return (
    <>
      {
        get(summaryData, 'authRadius.primary.ip') !== undefined && 
            <>
              Authentication Service
              {useAaaServer(
                AaaServerTypeEnum.AUTHENTICATION,
                summaryData
              )}
            </>
      }
      {
        summaryData.enableAccountingService && 
            <>Accounting Service
              {useAaaServer(
                AaaServerTypeEnum.ACCOUNTING,
                summaryData
              )}
            </>
      }
    </>

  )
}

function useAaaServer (
  serverType: AaaServerTypeEnum,
  summaryData: NetworkSaveData
) {
  const { $t } = useIntl()
  const primaryTitle = AaaServerTitle[AaaServerOrderEnum.PRIMARY]
  const secondaryTitle = AaaServerTitle[AaaServerOrderEnum.SECONDARY]

  const enableSecondaryServer = serverType === AaaServerTypeEnum.AUTHENTICATION ? 
    summaryData.enableSecondaryAuthServer : 
    summaryData.enableSecondaryAcctServer 

  const enableProxy = serverType === AaaServerTypeEnum.AUTHENTICATION ? 
    summaryData.enableAuthProxy : summaryData.enableAccountingProxy

  return (    
    <React.Fragment>
      {useAaaServerData(
        primaryTitle,
        `${get(summaryData, `${serverType}.${AaaServerOrderEnum.PRIMARY}.ip`)}`+
        `:${get(summaryData, `${serverType}.${AaaServerOrderEnum.PRIMARY}.port`)}`,
        get(summaryData, `${serverType}.${AaaServerOrderEnum.PRIMARY}.sharedSecret`)
      )}
      {
        enableSecondaryServer && 
        useAaaServerData(
          secondaryTitle,
          `${get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.ip`)}`+
          `:${get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.port`)}`,
          get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.sharedSecret`)
        )
      }
      <Form.Item
        label={$t({ defaultMessage: 'Proxy Service:' })}
        children={enableProxy ? 'Enabled' : 'Disabled'} />
      <Form.Item
        label={$t({ defaultMessage: 'TLS Encryption:' })}
        children='Disabled' />
    </React.Fragment>
  )
}

function useAaaServerData (
  title: string,
  ipPort: string,
  sharedSecret: string
) {
  const { $t } = useIntl()
  return (    
    <React.Fragment>
      <Form.Item
        label={`${title}:`}
        children={ipPort} />
      <Form.Item
        label={$t({ defaultMessage: 'Shared Secret:' })}
        children={<Input.Password
          readOnly
          bordered={false}
          value={sharedSecret}
        />}
      />
    </React.Fragment>
  )
}
