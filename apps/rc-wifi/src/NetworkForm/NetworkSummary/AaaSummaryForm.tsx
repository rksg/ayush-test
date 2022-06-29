import React from 'react'

import { Form, Input } from 'antd'
import { get }         from 'lodash'

import { 
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  AaaServerTitle,
  NetworkSaveData
} from '@acx-ui/rc/utils'

import { CloudpathSummary } from './CloudpathSummary'

export function AaaSummaryForm (props: {
  summaryData: NetworkSaveData;
}) {
  const { summaryData } = props
  return (
    <>
      {summaryData.isCloudpathEnabled &&
        <CloudpathSummary cloudpathServerId={summaryData.cloudpathServerId}></CloudpathSummary>
      }
      {!summaryData.isCloudpathEnabled && <>
        {
          get(summaryData, 'authRadius.primary.ip') !== undefined && 
            <>
              Authentication Service
              {getAaaServer(
                AaaServerTypeEnum.AUTHENTICATION,
                summaryData
              )}
            </>
        }
        {
          summaryData.enableAccountingService && 
            <>Accounting Service
              {getAaaServer(
                AaaServerTypeEnum.ACCOUNTING,
                summaryData
              )}
            </>
        }
      </>}
    </>

  )
}

function getAaaServer (
  serverType: AaaServerTypeEnum,
  summaryData: NetworkSaveData
) {
  const primaryTitle = AaaServerTitle[AaaServerOrderEnum.PRIMARY]
  const secondaryTitle = AaaServerTitle[AaaServerOrderEnum.SECONDARY]

  const enableSecondaryServer = serverType === AaaServerTypeEnum.AUTHENTICATION ? 
    summaryData.enableSecondaryAuthServer : 
    summaryData.enableSecondaryAcctServer 

  const enableProxy = serverType === AaaServerTypeEnum.AUTHENTICATION ? 
    summaryData.enableAuthProxy : summaryData.enableAccountingProxy

  return (    
    <React.Fragment>
      {getAaaServerData(
        primaryTitle,
        `${get(summaryData, `${serverType}.${AaaServerOrderEnum.PRIMARY}.ip`)}`+
        `:${get(summaryData, `${serverType}.${AaaServerOrderEnum.PRIMARY}.port`)}`,
        get(summaryData, `${serverType}.${AaaServerOrderEnum.PRIMARY}.sharedSecret`)
      )}
      {
        enableSecondaryServer && 
        getAaaServerData(
          secondaryTitle,
          `${get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.ip`)}`+
          `:${get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.port`)}`,
          get(summaryData, `${serverType}.${AaaServerOrderEnum.SECONDARY}.sharedSecret`)
        )
      }
      <Form.Item
        label='Proxy Service:'
        children={enableProxy ? 'Enabled' : 'Disabled'} />
      <Form.Item
        label='TLS Encryption:'
        children='Disabled' />
    </React.Fragment>
  )
}

function getAaaServerData (
  title: string,
  ipPort: string,
  sharedSecret: string
) {
  return (    
    <React.Fragment>
      <Form.Item
        label={`${title}:`}
        children={ipPort} />
      <Form.Item
        label='Shared Secret:'
        children={<Input.Password
          readOnly
          bordered={false}
          value={sharedSecret}
        />}
      />
    </React.Fragment>
  )
}