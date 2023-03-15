import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { SnmpAuthProtocolEnum, SnmpNotificationTypeEnum, SnmpPrivacyProtocolEnum, SnmpV3Agent } from '@acx-ui/rc/utils'
import { render, screen, within }                                                               from '@acx-ui/test-utils'

import SnmpAgentV3Table from './SnmpV3AgentTable'


describe('SnmpV3AgentTable', () => {
  const data: SnmpV3Agent[] = [
    {
      userName: 'joe_un1',
      readPrivilege: false,
      trapPrivilege: true,
      notificationType: SnmpNotificationTypeEnum.Trap,
      targetAddr: '192.168.0.100',
      targetPort: 162,
      authProtocol: SnmpAuthProtocolEnum.SHA,
      authPassword: '1234567890',
      privacyProtocol: SnmpPrivacyProtocolEnum.None
    },
    {
      userName: 'joe_un2',
      readPrivilege: true,
      trapPrivilege: false,
      notificationType: SnmpNotificationTypeEnum.Inform,
      targetPort: 162,
      authProtocol: SnmpAuthProtocolEnum.MD5,
      authPassword: '123456789',
      privacyProtocol: SnmpPrivacyProtocolEnum.AES,
      privacyPassword: '12345678'
    }
  ]

  it('should Delete SNMP V3 Agent successfully', async () => {
    render(
      <Form>
        <SnmpAgentV3Table data={data} />
      </Form>
    )

    let v3Rows = await screen.findAllByRole('row', { name: /joe_un/i })
    expect(v3Rows.length).toBe(2)

    // Delete SNMPv3 Agent
    let v3Row = await screen.findByRole('row', { name: /joe_un1/i })
    await userEvent.click(await within(v3Row).findByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    v3Rows = await screen.findAllByRole('row', { name: /joe_un/i })
    expect(v3Rows.length).toBe(1)
  })

  it('should Edit SNMP V3 Agent successfully', async () => {
    render(
      <Form>
        <SnmpAgentV3Table data={data} />
      </Form>
    )

    let v3Rows = await screen.findAllByRole('row', { name: /joe_un/i })
    expect(v3Rows.length).toBe(2)

    // Edit SNMPv3 Agent
    let v3Row = await screen.findByRole('row', { name: /joe_un2/i })
    await userEvent.click(await within(v3Row).findByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

    await screen.findByText('Edit SNMPv3 Agent')

    await userEvent.type(
      await screen.findByRole('textbox', { name: /User Name/i }), 'jj_un2')

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
  })

  it('should Add SNMP V3 Agent successfully', async () => {
    render(
      <Form>
        <SnmpAgentV3Table data={[]} />
      </Form>
    )

    // Add SNMPv3 Agent
    await userEvent.click(await screen.findByRole('button', { name: 'Add SNMPv3 Agent' }))
    await userEvent.type(
      await screen.findByRole('textbox', { name: /User Name/i }), 'jj_un1')

    await userEvent.type(
      await screen.findByLabelText(/Authentication Password/i), '88888888')
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

  })
})
