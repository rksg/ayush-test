import userEvent   from '@testing-library/user-event'
import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { MdnsProxyForwardingRule, MdnsProxyForwardingRuleTypeEnum } from '@acx-ui/rc/utils'
import { render, renderHook, screen, within }                       from '@acx-ui/test-utils'

import { mdnsProxyForwardingRuleTypeLabelMapping as ruleTypeLabelMapping } from '../../contentsMap'

import { mockedForwardingRules } from './__tests__/fixtures'
import MdnsProxyFormContext      from './MdnsProxyFormContext'
import { MdnsProxySettingsForm } from './MdnsProxySettingsForm'


describe('MdnsProxySettingsForm', () => {
  it('should render the form', () => {
    const { asFragment } = render(<Form><MdnsProxySettingsForm /></Form>)

    expect(asFragment()).toMatchSnapshot()
  })

  it('should create forwarding rule', async () => {
    const ruleToAdd: MdnsProxyForwardingRule = {
      type: MdnsProxyForwardingRuleTypeEnum.AIRPLAY,
      fromVlan: 1,
      toVlan: 2
    }

    const { result: fakeRuleTypeLabel } = renderHook(() => {
      return useIntl().$t(ruleTypeLabelMapping[ruleToAdd.type])
    })

    render(
      <Form>
        <MdnsProxySettingsForm />
      </Form>
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))
    await userEvent.click(await screen.findByRole('combobox', { name: 'Type' }))
    await userEvent.click(screen.getByText(fakeRuleTypeLabel.current))

    await userEvent.type(
      screen.getByRole('textbox', { name: /From VLAN/i }),
      ruleToAdd.fromVlan.toString()
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: /To VLAN/i }),
      ruleToAdd.toVlan.toString()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    // Check if the created data can be found in the table
    await screen.findByRole('cell', { name: fakeRuleTypeLabel.current })
    await screen.findByRole('cell', { name: ruleToAdd.fromVlan.toString() })
    await screen.findByRole('cell', { name: ruleToAdd.toVlan.toString() })
  })

  it('should edit forwarding rule', async () => {
    const ruleAfterEdit: MdnsProxyForwardingRule = {
      type: MdnsProxyForwardingRuleTypeEnum.AIRPORT_MANAGEMENT,
      fromVlan: 77,
      toVlan: 88
    }
    const { result: ruleAfterEditTypeLabel } = renderHook(() => {
      return useIntl().$t(ruleTypeLabelMapping[ruleAfterEdit.type])
    })

    const dataSource = mockedForwardingRules.slice(0, 1)

    render(
      <MdnsProxyFormContext.Provider
        value={{
          editMode: false,
          currentData: {
            name: 'mDNS Proxy 123',
            forwardingRules: dataSource
          }
        }}>
        <Form>
          <MdnsProxySettingsForm />
        </Form>
      </MdnsProxyFormContext.Provider>
    )

    const targetRule: MdnsProxyForwardingRule = dataSource[0]
    const { result: targetRuleTypeLabel } = renderHook(() => {
      return useIntl().$t(ruleTypeLabelMapping[targetRule.type])
    })

    // eslint-disable-next-line max-len
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRuleTypeLabel.current) })

    await userEvent.click(within(targetRow).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: /Edit/i }))

    await userEvent.click(await screen.findByRole('combobox', { name: 'Type' }))
    await userEvent.click(screen.getByText(ruleAfterEditTypeLabel.current))

    const fromVlanInput = screen.getByRole('textbox', { name: /From VLAN/i })
    await userEvent.clear(fromVlanInput)
    await userEvent.type(fromVlanInput, ruleAfterEdit.fromVlan.toString())

    const toVlanInput = screen.getByRole('textbox', { name: /To VLAN/i })
    await userEvent.clear(toVlanInput)
    await userEvent.type(toVlanInput, ruleAfterEdit.toVlan.toString())

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await screen.findByRole('cell', { name: ruleAfterEditTypeLabel.current })
    await screen.findByRole('cell', { name: ruleAfterEdit.fromVlan.toString() })
    await screen.findByRole('cell', { name: ruleAfterEdit.toVlan.toString() })
  })

  it('should delete forwarding rule', async () => {
    render(
      <MdnsProxyFormContext.Provider
        value={{
          editMode: false,
          currentData: {
            name: 'mDNS Proxy 123',
            forwardingRules: mockedForwardingRules
          }
        }}>
        <Form>
          <MdnsProxySettingsForm />
        </Form>
      </MdnsProxyFormContext.Provider>
    )

    const targetRule: MdnsProxyForwardingRule = mockedForwardingRules[1]
    const { result: targetRuleTypeLabel } = renderHook(() => {
      return useIntl().$t(ruleTypeLabelMapping[targetRule.type])
    })

    // eslint-disable-next-line max-len
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRuleTypeLabel.current) })

    await userEvent.click(within(targetRow).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: /Delete/i }))

    await screen.findByText('Delete "' + targetRuleTypeLabel.current + '"?')
    await userEvent.click(await screen.findByRole('button', { name: /Delete Rule/i }))

    // eslint-disable-next-line max-len
    const targetAfterDelete = screen.queryByRole('cell', { name: targetRuleTypeLabel.current })
    expect(targetAfterDelete).toBeNull()
  })
})
