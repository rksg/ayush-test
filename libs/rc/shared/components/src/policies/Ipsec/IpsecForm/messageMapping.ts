/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const messageMapping = {
  security_gateway_tooltip: defineMessage({ defaultMessage: 'Enter the IP address or fully-qualified domain name (FQDN) of the IPsec server. If you use the IP address, the IP address format that you must enter will depend on the IP mode that is configured on the controller' }),
  authentication_certificate_help_msg: defineMessage({ defaultMessage: 'The client certificate is pre-installed on the AP. Uploading the server root CA is required for authentication and validation on the IPsec server.' }),
  ike_rekey_tooltip: defineMessage({ defaultMessage: 'Set the time interval at which the IKE key renews or uncheck to disable the IKE rekey.' }),
  esp_rekey_tooltip: defineMessage({ defaultMessage: 'Set the time interval at which the ESP key renews or uncheck to disable the ESP rekey.' }),
  gateway_dhcp_option_tooltip: defineMessage({ defaultMessage: 'Set the DHCP Option 43 subcode that will be used to discover the address of the security gateway on the network. The available range is 3-243, excluding 6' }),
  gateway_retry_tooltip: defineMessage({ defaultMessage: 'Set the number of times that the controller will attempt to discover the address of the security gateway. Available values are 1-16.' }),
  connection_esp_replay_window_tooltip: defineMessage({ defaultMessage: 'Set the ESP replay window (in packets). Available range is 1-32.' }),
  connection_ip_compression_tooltip: defineMessage({ defaultMessage: 'To enable IP Payload Compression Protocol (IPComp) compression before encryption.' }),
  connection_dead_peer_detection_delay_tooltip: defineMessage({ defaultMessage: 'By default, the IKE protocol runs a health check with the remote peer to ensure that it is alive. Uncheck it to disable the health check. Available range is 1-65536 seconds' }),
  connection_force_nat_tooltip: defineMessage({ defaultMessage: 'Enabling this option will enforce UDP encapsulation of ESP packets.' }),
  connection_nat_keep_alive_interval_tooltip: defineMessage({ defaultMessage: 'Set the keepalive interval for NAT traversal. Available range is 1-65536 seconds' }),
  failover_retry_interval_tooltip: defineMessage({ defaultMessage: '1-30 minutes' }),
  failover_retry_mode_tooltip: defineMessage({ defaultMessage: 'Select Revertive if you want APs to fall back to the specified primary security gateway. Select Non-revertive if you want APs to maintain connectivity with the security gateway to which they are currently connected' }),
  enc_alg_all_tooltip: defineMessage({ defaultMessage: '3DES,AES128,AES192, and AES256' }),
  auth_alg_all_tooltip: defineMessage({ defaultMessage: 'MD5,SHA1,SHA256,SHA384, and SHA512' }),
  prf_alg_all_tooltip: defineMessage({ defaultMessage: 'USE-INTEGRITY-ALG,PRF-MD5,PRF-SHA1,PRF-SHA256,PRF-SHA384, and PRF-SHA512' }),
  dh_group_all_tooltip: defineMessage({ defaultMessage: 'MODP768,MODP1024,MODP1536,MODP2048,MODP3072,MODP4096,MODP6144, and MODP8192' }),
  psk_invalid_message: defineMessage({ defaultMessage: 'The preshared key must contain 44 ~ 128 HEX characters or  8 ~ 64 ACSII characters, including characters from space (char 32) to ~(char 126) except " or ` or $(, or Base64 characters.' })
}