import { useContext, useEffect, useReducer } from 'react'


import { Button, Form }              from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { cssStr, Tooltip }                    from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }         from '@acx-ui/icons'
import { SmsProviderType, useConfigTemplate } from '@acx-ui/rc/utils'
import { NotificationSmsUsage }               from '@acx-ui/rc/utils'
import { TenantLink }                         from '@acx-ui/react-router-dom'

import NetworkFormContext from '../../../NetworkFormContext'
import * as UI            from '../../../styledComponents'

const SelfSignInAppStyle = { marginBottom: '0' }

enum SMSTokenAction {
    default,
    disable,
    alert
}

interface SMSComponentState {
    action: SMSTokenAction,
    checkboxDisable: boolean,
    tooltipVisible: boolean,
    alertVisible: boolean
}

const statesCollection = {
  default: {
    action: SMSTokenAction.default,
    checkboxDisable: false,
    tooltipVisible: true,
    alertVisible: false
  },
  disable: {
    action: SMSTokenAction.disable,
    checkboxDisable: true,
    tooltipVisible: true,
    alertVisible: false
  },
  alert: {
    action: SMSTokenAction.alert,
    checkboxDisable: false,
    tooltipVisible: false,
    alertVisible: true
  }
}

const actionRunner = (current: SMSComponentState, next: SMSComponentState) : SMSComponentState => {
  switch(next.action) {
    case SMSTokenAction.default:
      return statesCollection.default
    case SMSTokenAction.disable:
      return statesCollection.disable
    case SMSTokenAction.alert:
      return statesCollection.alert
    default:
      // eslint-disable-next-line
      console.error(`Invalid action: ${next}`)
      return statesCollection.default
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
  const { isTemplate } = useConfigTemplate()

  const [state, dispatch] = useReducer(actionRunner, statesCollection.default)

  useEffect(() => {

    // eslint-disable-next-line
    if(!isSMSTokenAvailable(ruckusOneUsed, provider, { isSmsProviderEnabled, isGracePeriodEnabled })){
      if (editMode) {
        // Under edit mode and SMS Login is checked
        if (enableSmsLogin && SmsProviderType.RUCKUS_ONE) {
          dispatch(statesCollection.alert)
        }
        // Under edit mode and SMS Login is not checked
        else {
          dispatch(statesCollection.disable)
        }
      }
      // create mode
      else {
        dispatch(statesCollection.disable)
      }
    }
  },[enableSmsLogin, editMode, ruckusOneUsed, provider])

  const displaySMSTokenToolTips = () => {
    // eslint-disable-next-line max-len
    const defaultMessage = isTemplate
      // eslint-disable-next-line max-len
      ? $t({ defaultMessage: 'Captive Portal Self-sign-in via SMS One-time Passcode. To enable this functionality, please configure an SMS provider for End Customers.' })
      : $t({ defaultMessage: 'Captive Portal Self-sign-in via SMS One-time Passcode.' })

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

  return (<>
    <Form.Item name={['guestPortal', 'enableSmsLogin']}
      initialValue={false}
      style={SelfSignInAppStyle}>
      <>
        <UI.RedAlertCheckbox
          alert={state.alertVisible}
          onChange={(e) => {
            onChange(e.target.checked, ['guestPortal', 'enableSmsLogin'])
            if(state.action === SMSTokenAction.alert) {
              dispatch(statesCollection.disable)
            }
          }}
          checked={enableSmsLogin}
          disabled={state.checkboxDisable}
          data-testid='sms-check-box'
        >
          <UI.SMSToken />
          {$t({ defaultMessage: 'SMS Token' })}
        </UI.RedAlertCheckbox>
        {state.tooltipVisible ? <Tooltip
          title={displaySMSTokenToolTips()}
          placement='bottom'>
          <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
        </Tooltip> : undefined}
      </>
    </Form.Item>
    {state.alertVisible ? <SMSRedAlert /> : undefined}
  </>)
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
