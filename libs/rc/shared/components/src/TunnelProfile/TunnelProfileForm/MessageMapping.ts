/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const MessageMapping = {
  mtu_help_msg: defineMessage({ defaultMessage: 'Please check Ethernet MTU on AP, Tunnel MTU gets applied only if its less than Ethernet MTU' }),
  mtu_tooltip: defineMessage({ defaultMessage: 'This is a network setting that controls how the gateway handles the Path MTU Discovery (PMTUD).' }),
  tunnel_type_tooltip: defineMessage({ defaultMessage: 'The Personal Identity Network service uses VxLAN (VNI) tunneling, and the SD-LAN service maps VLAN to VNI for tunneling. Please choose the correct option for your service.' }),
  force_fragment_tooltip: defineMessage({ defaultMessage: 'When enabled, the AP or Edge device will ignore the Don\'t Fragment (DF) bit in the IP header of packets, which indicates whether the packets can be fragmented or not and fragment them if packet size is more than the MTU' }),
  idle_timeout_tooltip: defineMessage({ defaultMessage: 'This is the network setting that controls how long the tunnel entries are retained at the SmartEdge device' })
}