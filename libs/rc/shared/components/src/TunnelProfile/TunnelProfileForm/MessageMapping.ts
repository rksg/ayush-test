/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const MessageMapping = {
  mtu_help_msg: defineMessage({ defaultMessage: 'Please check Ethernet MTU on AP, Tunnel MTU gets applied only if its less than Ethernet MTU' }),
  tunnel_type_help_msg: defineMessage({ defaultMessage: 'The Personal Identity Network service uses VxLAN (VNI) tunneling, and the SD-LAN service maps VLAN to VNI for tunneling. Please choose the correct option for your service.' })
}