import { useContext } from 'react'


import { Button, Form }              from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { cssStr, Tooltip }            from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { SmsProviderType }            from '@acx-ui/rc/utils'
import { NotificationSmsUsage }       from '@acx-ui/rc/utils'
import { TenantLink }                 from '@acx-ui/react-router-dom'

import NetworkFormContext from '../../../NetworkFormContext'
import * as UI            from '../../../styledComponents'

const SelfSignInAppStyle = { marginBottom: '0' }

enum SMSTokenAction {
    default,
    disable,
    alert
}

interface SMSComponentState {
    checkboxDisable: boolean,
    tooltipVisible: boolean,
    alertVisible: boolean
}

function actionRunner (current: SMSTokenAction, next: SMSTokenAction){
  switch(next) {
    case SMSTokenAction.default:
      return
    case SMSTokenAction.disable:
      return
    case SMSTokenAction.alert:
      return
    default:
      console.error(`Invalid action: ${next}`)
      return
  }
}

export const isSMSTokenAvailable = (ruckusOneUsed: number, provider: SmsProviderType, ff : {
  isSmsProviderEnabled: boolean,
  isGracePeriodEnabled: boolean
}) : boolean => {

  const { isSmsProviderEnabled, isGracePeriodEnabled } = ff

  if (!isSmsProviderEnabled) {
    return true
  }
  // if Provider unset, disable SMS option even used SMS is not over 100
  if (provider === SmsProviderType.SMSProvider_UNSET){
    return false
  }
  if (provider === SmsProviderType.RUCKUS_ONE){
    // When Provider is R1 and Grace Period is on, Client can still use R1 SMS even used SMS over 100
    if (isGracePeriodEnabled) {
      return true
    }
    // When Provider is R1 and used SMS over 100, disable the SMS option
    if (ruckusOneUsed >= 100) {
      return false
    }
  }
  return true
}

export const SMSTokenCheckbox = ({ SMSUsage, onChange }: {
  SMSUsage?: NotificationSmsUsage,
  onChange: Function
}) => {
  const { ruckusOneUsed = 0, provider = SmsProviderType.RUCKUS_ONE } = SMSUsage || {}

  const isSmsProviderEnabled = useIsSplitOn(Features.NUVO_SMS_PROVIDER_TOGGLE)
  const isGracePeriodEnabled = useIsSplitOn(Features.NUVO_SMS_GRACE_PERIOD_TOGGLE)

  const { editMode } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const { useWatch } = Form
  const enableSmsLogin = useWatch(['guestPortal', 'enableSmsLogin'])

  const displaySMSTokenToolTips = () => {
    // eslint-disable-next-line max-len
    const defaultMessage = $t({ defaultMessage: 'Captive Portal Self-sign-in via SMS One-time Passcode.' })

    // when FF is off
    if (!isSmsProviderEnabled) {
      // eslint-disable-next-line max-len
      return $t({ defaultMessage: 'Self-service signup using one time token sent to a mobile number' })
    }

    // when provider is not ruckus one, no needs to consider used pools at this condition
    if (provider !== SmsProviderType.RUCKUS_ONE && provider !== SmsProviderType.SMSProvider_UNSET) {
      return defaultMessage
    }

    // when provider is ruckus one and grace period is on, no needs to consider the used SMS count
    if(provider === SmsProviderType.RUCKUS_ONE && isGracePeriodEnabled){
      return defaultMessage
    }

    // when provider is ruckus one but there's pool still remains
    if(provider === SmsProviderType.RUCKUS_ONE && ruckusOneUsed < 100) {
      return (
        <FormattedMessage
          defaultMessage={
            `{defaultMessage}<br></br>
              You have {poolCount} messages remaining in the RUCKUS-provided pool. 
              To ensure uninterrupted service, kindly set up an SMS provider on the 
              <SMSLink></SMSLink> page.`}
          values={{
            defaultMessage: defaultMessage,
            poolCount: 100 - ruckusOneUsed,
            br: () => <br/>,
            SMSLink: () => {
              return (<TenantLink to='/administration/accountSettings'>
                <Button
                  data-testid='button-has-pool'
                  type='link'
                  style={{ fontSize: 'var(--acx-body-4-font-size)' }}>
                  { $t({ defaultMessage: 'Administration > Settings' }) }
                </Button>
              </TenantLink>)}
          }}
        />
      )
    } else {
      // when provider is ruckus one, no pool remains
      return (
        <FormattedMessage
          defaultMessage={
            `{defaultMessage}<br></br>
              To activate the SMS option, configure an SMS provider 
              on the <SMSLink></SMSLink> page.`}
          values={{
            defaultMessage,
            br: () => <br/>,
            SMSLink: () => {
              return (<TenantLink to='/administration/accountSettings'>
                <Button
                  data-testid='button-no-pool'
                  type='link'
                  style={{ fontSize: 'var(--acx-body-4-font-size)' }}>
                  { $t({ defaultMessage: 'Administration > Settings' }) }
                </Button>
              </TenantLink>)}
          }}
        />
      )
    }
  }

  return <Form.Item name={['guestPortal', 'enableSmsLogin']}
    initialValue={false}
    style={SelfSignInAppStyle}>
    <>
      <UI.RedAlertCheckbox onChange={(e) => {
        onChange(e.target.checked, ['guestPortal', 'enableSmsLogin'])
      }}
      checked={enableSmsLogin}
      disabled={!editMode && !isSMSTokenAvailable(ruckusOneUsed, provider, {
        isSmsProviderEnabled, isGracePeriodEnabled
      })}
      >
        <UI.SMSToken />
        {$t({ defaultMessage: 'SMS Token' })}
      </UI.RedAlertCheckbox>
      <Tooltip
        title={displaySMSTokenToolTips()}
        placement='bottom'>
        <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
      </Tooltip>
    </>
  </Form.Item>

}

export const SMSRedAlert = () => {

  const { $t } = useIntl()

  return <Form.Item style={SelfSignInAppStyle}>
    <div style={{
      paddingLeft: '24px',
      width: '600px',
      color: cssStr('--acx-semantics-red-70')
    }} >
      <div style={{ height: '100%',float: 'left' }}>
        <UI.WarningTriangleSolid/>
      </div>
      <div style={{ fontSize: '12px', paddingLeft: '3px', float: 'left' }}>
        <FormattedMessage
          defaultMessage={
            `To keep this option enabled, configure an SMS provider on the<br></br>
          <SMSLink></SMSLink> or set a social login option.`}
          values={{
            br: () => <br/>,
            SMSLink: () => {
              return (<TenantLink to='/administration/accountSettings'>
                <Button
                  data-testid='red-alert-message'
                  type='link'
                  style={{ fontSize: 'var(--acx-body-4-font-size)' }}>
                  { $t({ defaultMessage: 'Administration > Settings' }) }
                </Button>
              </TenantLink>)}
          }}
        />
      </div>
    </div>
  </Form.Item>
}