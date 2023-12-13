import { useContext, useEffect } from 'react'

import {
  Form,
  Tooltip,
  Checkbox
} from 'antd'
import { useIntl } from 'react-intl'

import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { GuestNetworkTypeEnum }       from '@acx-ui/rc/utils'

import NetworkFormContext from '../../../NetworkFormContext'

export interface BypassCNAProps {
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
  const form = Form.useFormInstance()
  const { guestNetworkTypeEnum } = props

  const {
    data: networkFromContextData,
    editMode,
    cloneMode
  } = useContext(NetworkFormContext)


  useEffect(() => {
    if (editMode || cloneMode) {
      form.setFieldValue(['wlan', 'bypassCNA'], networkFromContextData?.wlan?.bypassCNA)
    }
  },[])

  const featureToggle = useIsSplitOn(Features.WIFI_EDA_BYPASS_CNA_TOGGLE)

  // if one condition is true, then go render it.
  const isRenderNeed = [featureToggle, isExemption(guestNetworkTypeEnum)].some(Boolean)

  if (!isRenderNeed) {
    return null
  }

  /* eslint-disable max-len */
  return (
    <div style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }} data-testid='bypasscna-fullblock'>
      <Form.Item
        name={['wlan', 'bypassCNA']}
        noStyle
        valuePropName='checked'
        initialValue={false}
        children={
          <Checkbox
            data-testid='bypasscna-checkbox'
            onChange={(e)=> {
              form.setFieldValue(['wlan', 'bypassCNA'], e.target.checked)
            }}>
            {$t({ defaultMessage: 'Use Bypass Captive Network Assistant' })}
          </Checkbox>
        }
      />
      <Tooltip title={$t({ defaultMessage: 'Enabling \'Bypass Captive Network Assistant\' prevents the controller from using the mini-browser on mobile devices. With CNA bypass enabled, portal login is achieved by opening a standard browser to any unauthenticated http page to get redirected to the login portal.' })}
        placement='bottom'>
        <QuestionMarkCircleOutlined style={{ width: '16px', marginLeft: -5, marginBottom: -3 }} />
      </Tooltip>
    </div>
  )
}
