import React from 'react'

import { Form }     from 'antd'
import { useWatch } from 'antd/lib/form/Form'
import { useIntl }  from 'react-intl'

import { Tooltip }                from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import * as UI from '../../../NetworkMoreSettings/styledComponents'

import MloComponent       from './MloComponent'
import Wifi6And7Component from './WiFi6AndComponent'


const WiFi7 = () => {
  const { $t } = useIntl()
  const wifi7MloFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_MLO_TOGGLE)
  const form = Form.useFormInstance()

  const [enableWiFi, enableMlo] = [
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableWifi7']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'])
  ]

  const onEnableWiFiChange = (enableWiFi: boolean) => {
    form.setFieldValue(['wlan', 'advancedCustomization', 'enableWifi6'], enableWiFi)
    form.setFieldValue(['wlan', 'advancedCustomization', 'enableWifi7'], enableWiFi)
    form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'],
      enableWiFi ? enableMlo : false)
  }

  const onEnableMloChange = (enableMlo: boolean) => {
    form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], enableMlo)
  }


  return (
    <>
      <UI.Subtitle>
        {$t({ defaultMessage: 'Wi-Fi 7' })}
        <Tooltip.Question
          title={$t({ defaultMessage: 'Only work with Wi-Fi Aps, e.g., R770' })}
          placement='right'
          iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
        />
      </UI.Subtitle>
      <Wifi6And7Component
        initialValue={enableWiFi}
        checked={enableWiFi}
        onEnableWiFiChange={onEnableWiFiChange}
      />
      { wifi7MloFlag &&
              <MloComponent
                initialValue={enableMlo}
                checked={enableMlo}
                isDisableMlo={!enableWiFi}
                onEnableMloChange={onEnableMloChange}
              />
      }
    </>
  )
}


export default WiFi7