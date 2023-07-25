import React, { useState } from 'react'

import { Form }     from 'antd'
import { useWatch } from 'antd/lib/form/Form'
import { useIntl }  from 'react-intl'

import { Tooltip }                from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import * as UI from '../../../NetworkMoreSettings/styledComponents'

import { MloComponent }       from './MloComponent'
import { Wifi6And7Component } from './WiFi6AndComponent'


export const WiFi7 = () => {
  const { $t } = useIntl()
  const wifi7MloFlag = useIsSplitOn(Features.WIFI_EDA_WIFI7_MLO_TOGGLE)
  const form = Form.useFormInstance()
  const [
    enableWifi7,
    enableMlo
  ] = [
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableWifi7']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'])]


  const [isChecks, setChecks] = useState([true, false])

  const onEnableWiFiChange = (isWiFiEnabled: boolean) => {
    form.setFieldValue(['wlan', 'advancedCustomization', 'enableWifi6'], isWiFiEnabled)
    form.setFieldValue(['wlan', 'advancedCustomization', 'enableWifi7'], isWiFiEnabled)
    if (!isWiFiEnabled) {
      // eslint-disable-next-line max-len
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], isWiFiEnabled)
    }

    setChecks([isWiFiEnabled, isWiFiEnabled ? isChecks[1] : false])
  }

  const onEnableMLOChange = (isMLOEnabled: boolean) => {
    form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], isMLOEnabled)
    setChecks([isChecks[0], isMLOEnabled])
  }

  return (
    <>
      <UI.Subtitle>
        {$t({ defaultMessage: 'Wi-Fi 7' })}
        <Tooltip.Question
          title={'Only work with Wi-Fi Aps, e.g., R770'}
          placement='right'
        />
      </UI.Subtitle>
      <Wifi6And7Component
        checked={isChecks[0]}
        initialValue={isChecks[0]}
        enableWifi7={enableWifi7}
        onEnableWiFiChange={onEnableWiFiChange}
      />
      { wifi7MloFlag &&
              <MloComponent
                checked={isChecks[1]}
                initialValue={isChecks[1]}
                enableMlo={enableMlo}
                enableWifi7={enableWifi7}
                onEnableMLOChange={onEnableMLOChange}
              />
      }
    </>
  )
}