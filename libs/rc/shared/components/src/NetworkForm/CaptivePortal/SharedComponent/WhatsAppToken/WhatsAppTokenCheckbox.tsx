import { useContext } from 'react'

import { Button, Form }              from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Tooltip }                                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                               from '@acx-ui/icons'
import { NotificationSmsUsage, SmsProviderType, useConfigTemplate } from '@acx-ui/rc/utils'
import { TenantLink }                                               from '@acx-ui/react-router-dom'

import NetworkFormContext     from '../../../NetworkFormContext'
import * as UI                from '../../../styledComponents'
import { SelfSignInAppStyle } from '../../SelfSignInForm'
import { RedAlertMessage }    from '../RedAlertMessage'


export const WhatsAppTokenCheckbox = ({ SMSUsage, onChange }: {
  SMSUsage?: NotificationSmsUsage,
  onChange: Function
}) => {
  const { data } = useContext(NetworkFormContext)
  const isEnabledWhatsApp = useIsSplitOn(Features.WHATSAPP_SELF_SIGN_IN_TOGGLE)
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const { provider = SmsProviderType.RUCKUS_ONE } = SMSUsage || {}
  const { useWatch } = Form
  const enableWhatsappLogin = useWatch(['guestPortal', 'enableWhatsappLogin'])

  if (!isEnabledWhatsApp) {
    return null
  }

  // eslint-disable-next-line max-len
  const isAlert = enableWhatsappLogin && data?.guestPortal?.enableWhatsappLogin && provider !== SmsProviderType.TWILIO
  const isDisabled = !isAlert && (!enableWhatsappLogin || provider !== SmsProviderType.TWILIO)

  return <><Form.Item name={['guestPortal', 'enableWhatsappLogin']}
    initialValue={false}
    style={SelfSignInAppStyle}>
    <>
      <UI.RedAlertCheckbox
        alert={isAlert}
        onChange={(e) => onChange(e.target.checked,
          ['guestPortal', 'enableWhatsappLogin'])}
        checked={enableWhatsappLogin}
        disabled={isDisabled}
      >
        <UI.WhatsApp />
        {$t({ defaultMessage: 'WhatsApp' })}
      </UI.RedAlertCheckbox>
      {!isAlert && <Tooltip title={isTemplate
        ? $t({
          // eslint-disable-next-line max-len
          defaultMessage: 'Captive Portal Self-sign-in via WhatsApp One-time Passcode. To enable this functionality, please configure a Twilio SMS provider for End Customers.'
        })
        : $t({
          // eslint-disable-next-line max-len
          defaultMessage: 'Captive Portal self-sign-in via WhatsApp One-Time Passcode is supported through the Twilio SMS provider. To enable this functionality, navigate to <Settings></Settings> and add the Twilio SMS provider.'
        }, {
          Settings: () => <TenantLink to='/administration/accountSettings'>
            <Button
              data-testid='button-has-pool'
              type='link'
              style={{ fontSize: 'var(--acx-body-4-font-size)' }}>
              { $t({ defaultMessage: 'Administration > Settings' }) }
            </Button>
          </TenantLink>
        })}
      placement='bottom'>
        <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
      </Tooltip>}
    </>
  </Form.Item>
  {isAlert && <RedAlertMessage>
    <FormattedMessage
      defaultMessage={
        // eslint-disable-next-line max-len
        'Captive Portal self-sign-in via WhatsApp One-Time Passcode is supported through the Twilio SMS provider. To enable this functionality, navigate to <Settings></Settings> and add the Twilio SMS provider.'}
      values={{
        Settings: () => <TenantLink to='/administration/accountSettings'>
          <Button
            data-testid='button-has-pool'
            type='link'
            style={{ fontSize: 'var(--acx-body-4-font-size)' }}>
            { $t({ defaultMessage: 'Administration > Settings' }) }
          </Button>
        </TenantLink>
      }}
    />
  </RedAlertMessage>}
  </>
}
