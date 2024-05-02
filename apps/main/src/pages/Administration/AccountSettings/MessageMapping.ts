/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const MessageMapping = {
  recovery_passphrase_tooltip: defineMessage({ defaultMessage: 'Passphrase of a special recovery network which is activated on AP once it loses connection with RUCKUS One.' }),
  recovery_passphrase_description_1: defineMessage({ defaultMessage: '- When you enter the passphrase make sure to type only 16 digits, no spaces' }),
  recovery_passphrase_description_2: defineMessage({ defaultMessage: '- The SSID of the recovery network is: “Recover.Me-xxxxxx” where “xxxxxx” are the last six characters of the AP\'s MAC address' }),
  change_recovery_passphrase_description: defineMessage({ defaultMessage: 'Note: Changing the passphrase will be applied to disconnected APs only once they are reconnected to RUCKUS One' }),
  recovery_passphrase_no_aps_message: defineMessage({ defaultMessage: 'This feature will become available once you add APs' }),
  default_system_language_description: defineMessage({ defaultMessage: 'Changes only affect new user accounts. To edit your language profile, go to ' }),
  map_region_description: defineMessage({ defaultMessage: 'Selected Map Region affects all the user in this account.' }),
  map_region_not_enabled_message: defineMessage({ defaultMessage: 'Map is not enabled.' }),
  enable_access_support_description: defineMessage({ defaultMessage: 'If checked, Ruckus support team is granted a temporary administrator-level access for 21 days.{br} Enable when requested by Ruckus support team.' }),
  enable_mfa_description_1: defineMessage({ defaultMessage: '- By enabling this option, all users of this account will be required to set and use MFA' }),
  enable_mfa_description_2: defineMessage({ defaultMessage: '- All users of this account will be required to provide verification code via chosen security method (email, SMS or authentication app)' }),
  enable_mfa_description_3: defineMessage({ defaultMessage: '- Managing the personal authentication settings will be done in the User Profile menu, accessible in the portal\'s header' }),
  enable_mfa_description_4: defineMessage({ defaultMessage: '- If MFA option is disabled, all users of this account are allowed to login using email and password, no extra authentication is required' }),
  enable_mfa_copy_codes_help_1: defineMessage({ defaultMessage: 'If admins have trouble receiving the security code, these codes below can be used as a backup method to access the account.' }),
  enable_mfa_copy_codes_help_2: defineMessage({ defaultMessage: 'Make sure to copy and store them in a safe place.' }),
  wifi_country_code_tooltip: defineMessage({ defaultMessage: 'Wi-Fi country code is used to indicate the available channels and power levels for use by access points at a <venueSingular></venueSingular>. In most use cases the Wi-Fi country code is identical to the location of <venueSingular></venueSingular> and need not be modified. If needed, you may select an alternate country code that is appropriate for your location.' }),
  enable_r1_beta_access_description: defineMessage({ defaultMessage: 'This option enables current and future beta features for this account across all <venuePlural></venuePlural>, networks, and users.{br} When disabled, any configuration related to beta features will remain available until deleted.' }),
  enable_r1_beta_disable_description: defineMessage({ defaultMessage: 'Please note that if you decide to disable beta features, your current configurations will be retained. However, you won\'t be able to modify them until you re-enable beta features. {br1}{br2} In order to disable the Beta features, we have to log you out.' }),
  enable_r1_beta_terms_condition_drawer_footer_msg: defineMessage({ defaultMessage: 'By clicking “Enable Beta”, you agree to the RUCKUS One Beta Terms & Conditions.' }),
  enable_r1_beta_terms_condition_drawer_msg: defineMessage({ defaultMessage: 'Ruckus Wireless, Inc. (“RUCKUS”) is providing you with access to certain product features and capabilities that are not yet commercially available and that are still being evaluated for general release. As such, these features and capabilities are provided “AS IS” and RUCKUS expressly disclaims all warranties, whether express, implied, statutory or otherwise, including without limitation any conditions or warranties of merchantability, performance, fitness for a particular purpose or use, and non infringement. The foregoing disclaimers shall apply to the fullest extent permitted by law. RUCKUS disclaims any and all liability in connection with your access to and use of beta features and capabilities. RUCKUS may modify, discontinue, or terminate your access to these features and capabilities at anytime at its sole discretion.' }),
  enable_r1_beta_logout_dialog_msg: defineMessage({ defaultMessage: 'In order to enable the Beta features, we have to log you out. Once you log-in back, the features will be available for you to use.' })
}
