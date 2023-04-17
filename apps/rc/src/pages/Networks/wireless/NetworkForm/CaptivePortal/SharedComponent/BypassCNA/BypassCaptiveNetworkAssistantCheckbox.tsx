import { useContext, useEffect, useReducer } from 'react'

import {
  Form,
  Tooltip,
  Checkbox
} from 'antd'
import { useIntl } from 'react-intl'

import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { GuestNetworkTypeEnum }       from '@acx-ui/rc/utils'


interface BypassCNAProps {
  guestNetworkTypeEnum: GuestNetworkTypeEnum
}

const exemptionList = [
  GuestNetworkTypeEnum.Cloudpath
]

function isExemption (guestNetworkTypeEnum: GuestNetworkTypeEnum) : boolean {
  return exemptionList.includes(guestNetworkTypeEnum)
}

export function BypassCaptiveNetworkAssistantCheckbox (props: BypassCNAProps) {

  const { $t } = useIntl()
  const { guestNetworkTypeEnum } = props

  // TODO: remove this flag and use feature toggle
  const featureToggle = false
  // const featureToggle = useIsSplitOn(Features.WIFI_EDA_BYPASS_CNA_TOGGLE)

  // if one condition is true, then go render it.
  const isRenderNeed = [featureToggle, isExemption(guestNetworkTypeEnum)].some(Boolean)

  // TODO unblock after develope.
  if (!isRenderNeed) {
    return null
  }

  /* eslint-disable max-len */
  return (
    <Form.Item>
      <Form.Item
        name={['wlan', 'bypassCNA']}
        noStyle
        valuePropName='checked'
        initialValue={false}
        children={
          <Checkbox>
            {$t({ defaultMessage: 'Use Bypass Captive Network Assistant' })}
          </Checkbox>
        }
      />
      <Tooltip title={$t({ defaultMessage: 'When bypass CNA is enabled, devices that have already been authenticated, are not redirected for authentication when reconnecting the onboarding network.' })}
        placement='bottom'>
        <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
      </Tooltip>
    </Form.Item>
  )
}