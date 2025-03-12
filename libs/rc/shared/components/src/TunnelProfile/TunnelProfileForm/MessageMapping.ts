/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const MessageMapping = {
  mtu_help_msg: defineMessage({ defaultMessage: 'Please check Ethernet MTU on AP, Tunnel MTU gets applied only if its less than Ethernet MTU' }),
  mtu_tooltip: defineMessage({ defaultMessage: 'This is a network setting that controls how the gateway handles the Path MTU Discovery (PMTUD).' }),
  tunnel_type_tooltip: defineMessage({ defaultMessage: 'The Personal Identity Network service uses VxLAN (VNI) tunneling, and the SD-LAN service maps VLAN to VNI for tunneling. Please choose the correct option for your service.' }),
  force_fragment_tooltip: defineMessage({ defaultMessage: 'When enabled, the AP or Edge device will ignore the Don\'t Fragment (DF) bit in the IP header of packets, which indicates whether the packets can be fragmented or not and fragment them if packet size is more than the MTU' }),
  idle_timeout_tooltip: defineMessage({ defaultMessage: 'This is the network setting that controls how long the tunnel entries are retained at the RUCKUS Edge device' }),
  mtu_request_timeout_tooltip: defineMessage({ defaultMessage: 'Maximum time to wait for a response for Path MTU request. The valid range is from 10ms to 10s.' }),
  mtu_request_retry_tooltip: defineMessage({ defaultMessage: 'Maximum number Path MTU requests sent to test one MTU value. The valid range is between 3-64.' }),
  keep_alive_interval_tooltip: defineMessage({ defaultMessage: 'The interval at which AP sends keep-alive requests to RUCKUS Edge.' }),
  keep_alive_retry_tooltip: defineMessage({ defaultMessage: 'The consecutive number of keep-alive requests that can be lost before disconnecting from RUCKUS Edge.' }),
  nat_traversal_support_tooltip: defineMessage({ defaultMessage: 'Facilitates VxLAN-GPE tunnel traffic through NAT devices for seamless connectivity and interoperability.' })
}