import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { SnmpNotificationTypeEnum, SnmpV2Agent } from '@acx-ui/rc/utils'
import { render, screen, within }                from '@acx-ui/test-utils'

import SnmpAgentV2Table from './SnmpV2AgentTable'


describe('SnmpV2AgentTable', () => {
  const data: SnmpV2Agent[] = [
    {
      communityName: 'joe_cn1',
      readPrivilege: true,
      trapPrivilege: false
    },
    {
      communityName: 'joe_cn2',
      readPrivilege: false,
      trapPrivilege: true,
      notificationType: SnmpNotificationTypeEnum.Inform,
      targetAddr: '192.168.0.120',
      targetPort: 162
    }
  ]

  it('should Delete SNMP V2 Agent successfully', async () => {
    render(
      <Form>
        <SnmpAgentV2Table data={data} />
      </Form>
    )

    let rows = await screen.findAllByRole('row', { name: /joe_cn/i })
    expect(rows.length).toBe(2)

    // Delete SNMPv3 Agent
    let row = await screen.findByRole('row', { name: /joe_cn1/i })
    await userEvent.click(await within(row).findByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    rows = await screen.findAllByRole('row', { name: /joe_cn/i })
    expect(rows.length).toBe(1)
  })

  it('should Edit SNMP V2 Agent successfully', async () => {
    render(
      <Form>
        <SnmpAgentV2Table data={data} />
      </Form>
    )

    let rows = await screen.findAllByRole('row', { name: /joe_cn/i })
    expect(rows.length).toBe(2)

    // Edit SNMPv2 Agent
    let row = await screen.findByRole('row', { name: /joe_cn2/i })
    await userEvent.click(await within(row).findByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    await screen.findAllByText('Edit SNMPv2 Agent')

    await userEvent.type(
      await screen.findByRole('textbox', { name: /Community Name/i }), 'jj_cn2')

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
  })

  it('should Add SNMP V2 Agent successfully', async () => {
    render(
      <Form>
        <SnmpAgentV2Table data={[]} />
      </Form>
    )

    // Add SNMPv2 Agent
    await userEvent.click(await screen.findByRole('button', { name: 'Add SNMPv2 Agent' }))
    await userEvent.type(await screen.findByRole('textbox', { name: 'Community Name' }), 'cn1')
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    await screen.findByText('Please enable at least one privilege option.')

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Read-only' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })
})
