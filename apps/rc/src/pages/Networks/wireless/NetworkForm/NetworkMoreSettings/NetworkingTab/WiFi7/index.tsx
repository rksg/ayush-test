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

  const [enableWiFi, enableMLO] = [
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableWifi7']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'])
  ]

  const onEnableWiFiChange = (enableWiFi: boolean) => {
    form.setFieldValue(['wlan', 'advancedCustomization', 'enableWifi6'], enableWiFi)
    form.setFieldValue(['wlan', 'advancedCustomization', 'enableWifi7'], enableWiFi)
    form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'],
      enableWiFi ? enableMLO : false)
  }

  const onEnableMLOChange = (enableMLO: boolean) => {
    form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], enableMLO)
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
                initialValue={enableMLO}
                checked={enableMLO}
                isDisableMlo={!enableWiFi}
                onEnableMLOChange={onEnableMLOChange}
              />
      }
    </>
  )
}


export default WiFi7