/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const messageMapping = {
  mtu_help_msg: defineMessage({ defaultMessage: 'Please check Ethernet MTU on AP, Tunnel MTU gets applied only if its less than Ethernet MTU' }),
  mtu_tooltip: defineMessage({ defaultMessage: 'This is a network setting that controls how the gateway handles the Path MTU Discovery (PMTUD).' }),
  force_fragment_tooltip: defineMessage({ defaultMessage: 'When enabled, the AP or Edge device will ignore the Don\'t Fragment (DF) bit in the IP header of packets, which indicates whether the packets can be fragmented or not and fragment them if packet size is more than the MTU' }),
  keep_alive_interval_tooltip: defineMessage({ defaultMessage: 'Time interval is the time taken by the APs to send a keepalive message to an active third party WLAN gateway.' }),
  keep_alive_retry_tooltip: defineMessage({ defaultMessage: 'Keepalive attempts are the number of attempts that the APs wait for a response from the active third party WLAN gateway before failing over to the secondary WLAN gateway.' }),
  disassoicate_client_tooltip: defineMessage({ defaultMessage: 'Disassociate client when AP fails over to another tunnel' }),
  fallback_tooltip: defineMessage({ defaultMessage: 'Allows APs to switch back to the primary gateway when it becomes reachable.' }),
  primary_availability_check_tooltip: defineMessage({ defaultMessage: 'How often the AP check if the primary tunnel is reachable. Available range: 60-1440 min.' })
}