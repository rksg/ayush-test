import {
  Form } from 'antd'
import { useIntl } from 'react-intl'

import { Vlan, transformTitleCase, transformDisplayOnOff, SpanningTreeProtocolName } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export const VlanDetail = (props: { row : Vlan }) => {
  const { $t } = useIntl()
  const { row } = props
  // eslint-disable-next-line max-len
  const subtitle = $t({ defaultMessage: 'VLAN settings as defined in the switch configuration profile or via CLI directly to the switch' })

  return (

    <Form
      labelCol={{ span: 12 }}
      labelAlign='left'
    >
      <UI.SubTitle>{subtitle}</UI.SubTitle>
      <Form.Item
        label={$t({ defaultMessage: 'VLAN ID:' })}
        children={row.vlanId}
      />
      <Form.Item
        label={$t({ defaultMessage: 'VLAN Name:' })}
        children={row.vlanName|| '--'}
      />
      <Form.Item
        label={$t({ defaultMessage: 'IPv4 DHCP Snooping:' })}
        children={transformDisplayOnOff(row.ipv4DhcpSnooping || false)}
      />
      <Form.Item
        label={$t({ defaultMessage: 'ARP Inspection:' })}
        children={transformDisplayOnOff(row.arpInspection || false)}
      />
      <Form.Item
        label={$t({ defaultMessage: 'IGMP Snooping:' })}
        children={transformTitleCase(row.igmpSnooping || '')}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Multicast Version:' })}
        children={row.multicastVersion || '--'}
      />
      <Form.Item
        label={$t({ defaultMessage: 'Spanning tree protocol:' })}
        children={row.spanningTreeProtocol ?
          SpanningTreeProtocolName[row.spanningTreeProtocol] : '--'}
      />

      <Form.Item
        style={{ wordBreak: 'break-all' }}
        label={$t({ defaultMessage: 'Untagged Ports:' })}
        children={row.untaggedPorts || '--'}
      />
      <Form.Item
        style={{ wordBreak: 'break-all' }}
        label={$t({ defaultMessage: 'Tagged Ports:' })}
        children={row.taggedPorts || '--'}
      />

    </Form>
  )
}
