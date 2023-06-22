import React from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { PasswordInput }              from '@acx-ui/components'
import { Features, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useMacRegListsQuery }        from '@acx-ui/rc/services'
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

  const macRegistrationEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const { data: macRegListOption } = useMacRegListsQuery({
    payload: { pageSize: 10000 }
  }, { skip: !macRegistrationEnabled })

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
          children={<PasswordInput
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
          children={<PasswordInput
            readOnly
            bordered={false}
            value={summaryData.wlan?.saePassphrase}
          />}
        />
      }
      {summaryData.wlan?.wlanSecurity === WlanSecurityEnum.WEP && summaryData.wlan?.wepHexKey &&
        <Form.Item
          label={$t({ defaultMessage: 'Hex Key:' })}
          children={<PasswordInput
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
      {summaryData.wlan?.macAddressAuthentication && !summaryData.wlan?.macRegistrationListId &&
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
      {summaryData.wlan?.macAddressAuthentication && summaryData.wlan?.macRegistrationListId &&
      <Form.Item
        label={$t({ defaultMessage: 'Mac registration list:' })}
        children={
          `${macRegListOption?.data.find(
            regList => regList.id === summaryData.wlan?.macRegistrationListId
          )?.name}`
        }/>
      }
    </>

  )
}
