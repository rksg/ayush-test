import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { MdnsProxyForwardingRule, MdnsProxyForwardingRuleTypeEnum } from '@acx-ui/rc/utils'
import { render, screen, within }                                   from '@acx-ui/test-utils'

import { mockedForwardingRules } from './__tests__/fixtures'
import MdnsProxyFormContext      from './MdnsProxyFormContext'
import { MdnsProxySettingsForm } from './MdnsProxySettingsForm'



describe('MdnsProxySettingsForm', () => {
  it('should render the form correctly', () => {
    const { asFragment } = render(
      <Form><MdnsProxySettingsForm /></Form>, {
        route: false
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render the form with the data correctly', async () => {
    const { asFragment } = render(
      <MdnsProxyFormContext.Provider
        value={{
          editMode: true,
          currentData: {
            name: 'mDNS Proxy 123',
            forwardingRules: mockedForwardingRules
          }
        }}>
        <Form><MdnsProxySettingsForm /></Form>
      </MdnsProxyFormContext.Provider>, {
        route: false
      }
    )

    expect(asFragment()).toMatchSnapshot()

    const targetForwardingRuleType = mockedForwardingRules[0].type
    await screen.findByRole('row', { name: new RegExp(targetForwardingRuleType) })
  })

  it('should create forwarding rule', async () => {
    const forwardingRuleInput: MdnsProxyForwardingRule = {
      type: MdnsProxyForwardingRuleTypeEnum.AIRPLAY,
      fromVlan: 1,
      toVlan: 2
    }
    const typeLabel = 'AirPlay'

    const { container } = render(<Form><MdnsProxySettingsForm /></Form>, { route: false })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))
    await userEvent.click(await screen.findByRole('combobox', { name: 'Type' }))
    await userEvent.click(screen.getByText(typeLabel))

    await userEvent.type(
      screen.getByRole('textbox', { name: /From VLAN/i }),
      forwardingRuleInput.fromVlan.toString()
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: /To VLAN/i }),
      forwardingRuleInput.toVlan.toString()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    const forwardingRulesTable = await within(container).findByRole('table')
    await within(forwardingRulesTable).findByRole('cell', {
      name: typeLabel
    })
    await within(forwardingRulesTable).findByRole('cell', {
      name: forwardingRuleInput.fromVlan.toString()
    })
    await within(forwardingRulesTable).findByRole('cell', {
      name: forwardingRuleInput.toVlan.toString()
    })
  })
})
