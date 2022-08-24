import React from 'react'

import { Form, Input } from 'antd'
import { get }         from 'lodash'
import { useIntl }     from 'react-intl'

import { 
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  NetworkSaveData,
  WlanSecurityEnum,
  PskWlanSecurityEnum,
  macAuthMacFormatOptions
} from '@acx-ui/rc/utils'

import * as contents from '../contentsMap'

export function PskSummaryForm (props: {
  summaryData: NetworkSaveData;
}) {
  const { $t } = useIntl()
  const { summaryData } = props
  return (
    <>
      {summaryData.wlan?.wlanSecurity !== WlanSecurityEnum.WPA3 && 
       summaryData.wlan?.wlanSecurity !== WlanSecurityEnum.WEP &&
       summaryData.wlan?.passphrase &&
        <Form.Item
          label={summaryData.wlanSecurity === WlanSecurityEnum.WPA23Mixed ? 
            $t({ defaultMessage: 'WPA2 Passphrase:' }) :
            $t({ defaultMessage: 'Passphrase:' })
          }
          children={<Input.Password
            readOnly
            bordered={false}
            value={summaryData.wlan?.passphrase}
          />}
        />
      }
      {(summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WPA3 ||
        summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WPA23Mixed) &&
        summaryData.wlan?.saePassphrase &&
        <Form.Item
          label={summaryData.wlanSecurity === WlanSecurityEnum.WPA3?
            $t({ defaultMessage: 'SAE Passphrase:' }) :
            $t({ defaultMessage: 'WPA3 SAE Passphrase:' })
          }
          children={<Input.Password
            readOnly
            bordered={false}
            value={summaryData.wlan?.saePassphrase}
          />}
        />
      }
      {summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WEP && summaryData.wlan?.wepHexKey &&
        <Form.Item
          label={$t({ defaultMessage: 'Hex Key:' })}
          children={<Input.Password
            readOnly
            bordered={false}
            value={summaryData.wlan?.wepHexKey}
          />}
        />
      }
      <Form.Item
        label={$t({ defaultMessage: 'Security Protocol:' })}
        children={
          PskWlanSecurityEnum[summaryData.wlan?.wlanSecurity as keyof typeof PskWlanSecurityEnum]
        } />
      {summaryData.wlan?.managementFrameProtection &&
        <Form.Item
          label={$t({ defaultMessage: 'Management Frame Protection:' })}
          children={summaryData.wlan?.managementFrameProtection} />
      }
      <Form.Item
        label={$t({ defaultMessage: 'Use MAC Auth:' })}
        children={summaryData.wlan?.macAddressAuthentication? 'Enabled' : 'Disabled'} />
      {summaryData.wlan?.macAddressAuthentication &&
        <React.Fragment>
          <Form.Item
            label={$t({ defaultMessage: 'MAC Address Format:' })}
            children={
              macAuthMacFormatOptions[
                summaryData.wlan?.macAuthMacFormat as keyof typeof macAuthMacFormatOptions
              ]
            }/>
            
          {$t({ defaultMessage: 'Authentication Service' })}
          {getAaaServer(
            AaaServerTypeEnum.AUTHENTICATION,
            summaryData
          )}

          {summaryData.enableAccountingService && 
            <>{$t({ defaultMessage: 'Accounting Service' })}
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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { $t } = useIntl()
  const primaryTitle = $t(contents.aaaServerTypes[AaaServerOrderEnum.PRIMARY])
  const secondaryTitle = $t(contents.aaaServerTypes[AaaServerOrderEnum.SECONDARY])

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