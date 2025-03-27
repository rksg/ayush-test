/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const MessageMapping = {
  arc_privacy_settings_label: defineMessage({ defaultMessage: 'Enable application-recognition and control' }),
  arc_privacy_settings_label_non_prime_admin: defineMessage({ defaultMessage: 'Application-recognition and control is' }),
  arc_privacy_settings_description: defineMessage({ defaultMessage: 'This setting determines the default behavior for new MSP customers. It specifies whether Application Recognition and Control (ARC) is enabled or disabled by default for the WLAN networks of newly added MSP customers.' }),
  app_visibility_privacy_settings_label: defineMessage({ defaultMessage: 'Enable application visibility for all MSP customer tenants' }),
  app_visibility_privacy_settings_label_non_prime_admin: defineMessage({ defaultMessage: 'Application visibility for all MSP customer tenants is' }),
  app_visibility_privacy_settings_description: defineMessage({ defaultMessage: 'When enabled, MSP Admins can view customer tenant application usage. When disabled, MSP Admins cannot view customer tenant application usage, ensuring privacy for customer-sensitive data. This setting applies to all MSP customer tenants and does not  intervene with individual tenant configurations.' })
}