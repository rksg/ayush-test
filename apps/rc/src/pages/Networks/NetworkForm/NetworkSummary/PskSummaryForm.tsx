import React from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { 
  AaaServerTypeEnum,
  NetworkSaveData,
  WlanSecurityEnum,
  PskWlanSecurityEnum,
  macAuthMacFormatOptions
} from '@acx-ui/rc/utils'

import { AaaServer } from './AaaServer'

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
        children={summaryData.wlan?.macAddressAuthentication?
          $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' })} />
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
          <AaaServer serverType={AaaServerTypeEnum.AUTHENTICATION} summaryData={summaryData} />
          {summaryData.enableAccountingService && 
            <>{$t({ defaultMessage: 'Accounting Service' })}
              <AaaServer serverType={AaaServerTypeEnum.ACCOUNTING} summaryData={summaryData} />
            </>
          }
        </React.Fragment>
      }
    </>

  )
}