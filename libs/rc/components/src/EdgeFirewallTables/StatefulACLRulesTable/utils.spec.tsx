import { AccessAction, ACLDirection, AddressType, ProtocolType, StatefulAclRule } from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mockACLOutboundRules }                          from './__tests__/fixtures'
import { getRuleSrcDstString, isStatefulACLDefaultRule } from './utils'


describe('Stateful ACL rules utils', () => {

  describe('is stateful ACL outbound default rule', () => {
    it('1st - 3rd rule should be default', async () => {
      let isDefault = isStatefulACLDefaultRule(
        ACLDirection.OUTBOUND,
        mockACLOutboundRules[0],
        mockACLOutboundRules)
      expect(isDefault).toBe(true)

      isDefault = isStatefulACLDefaultRule(
        ACLDirection.OUTBOUND,
        mockACLOutboundRules[1],
        mockACLOutboundRules)
      expect(isDefault).toBe(true)

      isDefault = isStatefulACLDefaultRule(
        ACLDirection.OUTBOUND,
        mockACLOutboundRules[2],
        mockACLOutboundRules)
      expect(isDefault).toBe(true)
    })

    it('last rule should be default', async () => {
      const isDefault = isStatefulACLDefaultRule(
        ACLDirection.OUTBOUND,
        mockACLOutboundRules[mockACLOutboundRules.length-1],
        mockACLOutboundRules)

      expect(isDefault).toBe(true)
    })

    it('others should not be default', async () => {
      const isDefault = isStatefulACLDefaultRule(
        ACLDirection.OUTBOUND,
        mockACLOutboundRules[4],
        mockACLOutboundRules)

      expect(isDefault).toBe(false)
    })
  })

  describe('is stateful ACL inbound default rule', () => {
    it('only last rule should be default', async () => {
      let isDefault = isStatefulACLDefaultRule(
        ACLDirection.INBOUND,
        mockACLOutboundRules[0],
        mockACLOutboundRules)
      expect(isDefault).toBe(false)

      isDefault = isStatefulACLDefaultRule(
        ACLDirection.INBOUND,
        mockACLOutboundRules[1],
        mockACLOutboundRules)
      expect(isDefault).toBe(false)

      isDefault = isStatefulACLDefaultRule(
        ACLDirection.INBOUND,
        mockACLOutboundRules[mockACLOutboundRules.length-1],
        mockACLOutboundRules)

      expect(isDefault).toBe(true)
    })

    it('others should not be default', async () => {
      const isDefault = isStatefulACLDefaultRule(
        ACLDirection.INBOUND,
        mockACLOutboundRules[4],
        mockACLOutboundRules)

      expect(isDefault).toBe(false)
    })
  })


  describe('rule source destination string', () => {
    it('invalid address type', async () => {
      const anyRule = {
        priority: 1,
        description: 'custom rule',
        accessAction: AccessAction.ALLOW,
        protocolType: ProtocolType.SCTP,
        protocolValue: undefined,
        sourceAddressType: '',
        sourceAddress: '',
        sourceAddressMask: '',
        sourcePort: '',
        destinationAddressType: AddressType.IP_ADDRESS,
        destinationAddress: '192.168.2.3',
        destinationAddressMask: '',
        destinationPort: ''
      } as unknown as StatefulAclRule

      const { container } = render(
        <Provider>
          {getRuleSrcDstString(anyRule, true)}
        </Provider>)

      expect(container.innerHTML).toBe('')
    })

    it('source any address', async () => {
      const anyRule = {
        priority: 1,
        description: 'custom rule',
        accessAction: AccessAction.ALLOW,
        protocolType: ProtocolType.SCTP,
        protocolValue: undefined,
        sourceAddressType: AddressType.ANY_IP_ADDRESS,
        sourceAddress: '',
        sourceAddressMask: '',
        sourcePort: '',
        destinationAddressType: AddressType.IP_ADDRESS,
        destinationAddress: '192.168.2.3',
        destinationAddressMask: '',
        destinationPort: ''
      }

      render(
        <Provider>
          {getRuleSrcDstString(anyRule, true)}
        </Provider>)

      await screen.findByText('Any')
    })

    it('source ip address', async () => {
      const ipRule = {
        priority: 1,
        description: 'custom rule',
        accessAction: AccessAction.ALLOW,
        protocolType: ProtocolType.SCTP,
        protocolValue: undefined,
        sourceAddressType: AddressType.IP_ADDRESS,
        sourceAddress: '192.168.10.11',
        sourceAddressMask: '',
        sourcePort: '',
        destinationAddressType: AddressType.IP_ADDRESS,
        destinationAddress: '192.168.2.3',
        destinationAddressMask: '',
        destinationPort: ''
      }

      render(
        <Provider>
          {getRuleSrcDstString(ipRule, true)}
        </Provider>)

      await screen.findByText('192.168.10.11')
    })

    it('source subnet address', async () => {
      const subnetRule = {
        priority: 1,
        description: 'custom rule',
        accessAction: AccessAction.ALLOW,
        protocolType: ProtocolType.SCTP,
        protocolValue: undefined,
        sourceAddressType: AddressType.SUBNET_ADDRESS,
        sourceAddress: '192.168.2.3',
        sourceAddressMask: '255.255.255.0',
        sourcePort: '',
        destinationAddressType: AddressType.IP_ADDRESS,
        destinationAddress: '192.168.12.23',
        destinationAddressMask: '',
        destinationPort: ''
      }

      render(
        <Provider>
          {getRuleSrcDstString(subnetRule, true)}
        </Provider>)

      await screen.findByText('Subnet: 192.168.2.3')
      await screen.findByText('Mask: 255.255.255.0')
    })


    it('destination any address', async () => {
      const anyRule = {
        priority: 1,
        description: 'custom rule',
        accessAction: AccessAction.ALLOW,
        protocolType: ProtocolType.SCTP,
        protocolValue: undefined,
        sourceAddressType: AddressType.ANY_IP_ADDRESS,
        sourceAddress: '',
        sourceAddressMask: '',
        sourcePort: '',
        destinationAddressType: AddressType.ANY_IP_ADDRESS,
        destinationAddress: '',
        destinationAddressMask: '',
        destinationPort: ''
      }

      render(
        <Provider>
          {getRuleSrcDstString(anyRule, false)}
        </Provider>)

      await screen.findByText('Any')
    })

    it('destination ip address', async () => {
      const ipRule = {
        priority: 1,
        description: 'custom rule',
        accessAction: AccessAction.ALLOW,
        protocolType: ProtocolType.SCTP,
        protocolValue: undefined,
        sourceAddressType: AddressType.IP_ADDRESS,
        sourceAddress: '192.168.10.11',
        sourceAddressMask: '',
        sourcePort: '',
        destinationAddressType: AddressType.IP_ADDRESS,
        destinationAddress: '172.168.2.3',
        destinationAddressMask: '',
        destinationPort: ''
      }

      render(
        <Provider>
          {getRuleSrcDstString(ipRule, false)}
        </Provider>)

      await screen.findByText('172.168.2.3')
    })

    it('destination subnet address', async () => {
      const subnetRule = {
        priority: 1,
        description: 'custom rule',
        accessAction: AccessAction.ALLOW,
        protocolType: ProtocolType.SCTP,
        protocolValue: undefined,
        sourceAddressType: AddressType.SUBNET_ADDRESS,
        sourceAddress: '192.168.2.3',
        sourceAddressMask: '255.255.255.0',
        sourcePort: '',
        destinationAddressType: AddressType.SUBNET_ADDRESS,
        destinationAddress: '172.16.1.1',
        destinationAddressMask: '255.255.0.0',
        destinationPort: ''
      }

      render(
        <Provider>
          {getRuleSrcDstString(subnetRule, false)}
        </Provider>)

      await screen.findByText('Subnet: 172.16.1.1')
      await screen.findByText('Mask: 255.255.0.0')
    })
  })
})