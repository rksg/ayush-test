import React from 'react'

import { Form, Input } from 'antd'
import { get }         from 'lodash'

import { 
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  AaaServerTitle,
  CreateNetworkFormFields,
  NetworkSaveData,
  WlanSecurityEnum,
  PskWlanSecurityEnum,
  macAuthMacFormatOptions
} from '@acx-ui/rc/utils'

export function PskSummaryForm (props: {
  summaryData: CreateNetworkFormFields;
}) {
  const { summaryData } = props
  return (
    <>
      {summaryData.wlanSecurity !== WlanSecurityEnum.WPA3 && 
       summaryData.wlanSecurity !== WlanSecurityEnum.WEP &&
       summaryData.passphrase &&
        <Form.Item
          label={summaryData.wlanSecurity === WlanSecurityEnum.WPA23Mixed ? 
            'WPA2 Passphrase:' : 'Passphrase:'}
          children={<Input.Password
            readOnly
            bordered={false}
            value={summaryData.passphrase}
          />}
        />
      }
      {(summaryData.wlanSecurity === WlanSecurityEnum.WPA3 ||
        summaryData.wlanSecurity === WlanSecurityEnum.WPA23Mixed) &&
        summaryData.saePassphrase &&
        <Form.Item
          label={summaryData.wlanSecurity === WlanSecurityEnum.WPA3?
            'SAE Passphrase:' : 'WPA3 SAE Passphrase:'}
          children={<Input.Password
            readOnly
            bordered={false}
            value={summaryData.saePassphrase}
          />}
        />
      }
      {summaryData.wlanSecurity === WlanSecurityEnum.WEP && summaryData.wepHexKey &&
        <Form.Item
          label='Hex Key:'
          children={<Input.Password
            readOnly
            bordered={false}
            value={summaryData.wepHexKey}
          />}
        />
      }
      <Form.Item
        label='Security Protocol:'
        children={
          PskWlanSecurityEnum[summaryData.wlanSecurity as keyof typeof PskWlanSecurityEnum]
        } />
      {summaryData.managementFrameProtection &&
        <Form.Item
          label='Management Frame Protection:'
          children={summaryData.managementFrameProtection} />
      }
      <Form.Item
        label='Use MAC Auth:'
        children={summaryData.macAddressAuthentication? 'Enabled' : 'Disabled'} />
      {summaryData.macAddressAuthentication &&
        <React.Fragment>
          <Form.Item
            label='MAC Address Format:'
            children={
              macAuthMacFormatOptions[
                summaryData.macAuthMacFormat as keyof typeof macAuthMacFormatOptions
              ]
            }/>
            
          Authentication Service
          {getAaaServer(
            AaaServerTypeEnum.AUTHENTICATION,
            summaryData
          )}

          {summaryData.enableAccountingService && 
            <>Accounting Service
              {getAaaServer(
                AaaServerTypeEnum.ACCOUNTING,
                summaryData
              )}
            </>
          }
        </React.Fragment>
      }
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