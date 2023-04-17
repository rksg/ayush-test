import { useContext, useEffect, useReducer } from 'react'

import {
  Form,
  Tooltip,
  Checkbox
} from 'antd'
import { useIntl } from 'react-intl'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { GuestNetworkTypeEnum }       from '@acx-ui/rc/utils'


// TODO: remove this flag and use feature toggle
const toggleFlag = false

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

  // if one condition is true, then go render it.
  const isRenderNeed = [toggleFlag, isExemption(guestNetworkTypeEnum)].some(Boolean)

  // TODO unblock after develope.
  // if (!isRenderNeed) {
  //   return null
  // }

  return (<Form.Item>
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
  </Form.Item>)
}