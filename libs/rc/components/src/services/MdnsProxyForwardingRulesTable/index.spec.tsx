import { useState } from 'react'

import userEvent   from '@testing-library/user-event'
import { useIntl } from 'react-intl'

import {
  MdnsProxyForwardingRule,
  BridgeServiceEnum,
  mdnsProxyRuleTypeLabelMapping
} from '@acx-ui/rc/utils'
import { render, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'

import { MdnsProxyForwardingRulesTable } from '.'

jest.mock('./constants', () => {
  return { RULES_MAX_COUNT: 3 }
})

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) => {
    return (
      <select
        role='combobox'
        onChange={e => onChange(e.target.value)}
        {...otherProps}>
        {children}
      </select>
    )
  }

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) => {
    return <option {...otherProps}>{children}</option>
  }

  return { ...antd, Select }
})

const mockedRules: MdnsProxyForwardingRule[] = [
  {
    id: '__UUID__rule1',
    service: BridgeServiceEnum.AIRPLAY,
    fromVlan: 10,
    toVlan: 20
  },
  {
    id: '__UUID__rule2',
    service: BridgeServiceEnum.APPLETV,
    fromVlan: 21,
    toVlan: 30
  }
]

describe('MdnsProxyForwardingRulesTable', () => {
  it('should render the table with the given data', async () => {
    render(<MdnsProxyForwardingRulesTable rules={mockedRules} />)

    const { result: targetTypeLabel } = renderHook(() => {
      const { $t } = useIntl()
      return $t(mdnsProxyRuleTypeLabelMapping[mockedRules[0].service])
    })

    // Verify the given data has been displayed
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: new RegExp(targetTypeLabel.current) })).toBeVisible()
  })

  it('should render the readonly table', async () => {
    render(
      <MdnsProxyForwardingRulesTable
        rules={mockedRules}
        readonly={true}
      />
    )

    const { result: targetTypeLabel } = renderHook(() => {
      const { $t } = useIntl()
      return $t(mdnsProxyRuleTypeLabelMapping[mockedRules[0].service])
    })

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetTypeLabel.current) })
    const targetRowRadio = within(targetRow).queryByRole('radio')

    expect(targetRowRadio).toBeNull()
  })

  it('should be invalid when creating the duplicated rule', async () => {
    const ruleToAdd: MdnsProxyForwardingRule = {
      id: '__RULE_ID__',
      service: BridgeServiceEnum.AIRPLAY,
      fromVlan: 1,
      toVlan: 2
    }

    const { result: fakeRuleTypeLabel } = renderHook(() => {
      return useIntl().$t(mdnsProxyRuleTypeLabelMapping[ruleToAdd.service])
    })

    render(
      <MdnsProxyForwardingRulesTable rules={[ruleToAdd]} />
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))

    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Type' }),
      await screen.findByRole('option', { name: fakeRuleTypeLabel.current })
    )
    await userEvent.type(
      screen.getByRole('spinbutton', { name: /From VLAN/i }),
      ruleToAdd.fromVlan.toString()
    )
    await userEvent.type(
      screen.getByRole('spinbutton', { name: /To VLAN/i }),
      ruleToAdd.toVlan.toString()
    )

    const errorMessageElem = await screen.findByRole('alert')
    expect(errorMessageElem.textContent).toBe('Rule with same Type and VLAN IDs already exists')
  })

  it('should edit forwarding rule', async () => {
    const ruleAfterEdit: MdnsProxyForwardingRule = {
      service: BridgeServiceEnum.AIRPORT_MANAGEMENT,
      fromVlan: 77,
      toVlan: 88
    }
    const { result: ruleAfterEditTypeLabel } = renderHook(() => {
      return useIntl().$t(mdnsProxyRuleTypeLabelMapping[ruleAfterEdit.service])
    })

    const targetRule: MdnsProxyForwardingRule = mockedRules[0]
    const { result: targetRuleTypeLabel } = renderHook(() => {
      return useIntl().$t(mdnsProxyRuleTypeLabelMapping[targetRule.service])
    })

    const Component = () => {
      const [ rules, setRules ] = useState<MdnsProxyForwardingRule[]>([targetRule])

      return (
        <MdnsProxyForwardingRulesTable
          rules={rules}
          setRules={setRules}
        />
      )
    }

    render(<Component/>)

    // eslint-disable-next-line max-len
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRuleTypeLabel.current) })

    await userEvent.click(within(targetRow).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: /Edit/i }))

    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Type' }),
      await screen.findByRole('option', { name: ruleAfterEditTypeLabel.current })
    )

    const fromVlanInput = screen.getByRole('spinbutton', { name: /From VLAN/i })
    await userEvent.clear(fromVlanInput)
    await userEvent.type(fromVlanInput, ruleAfterEdit.fromVlan.toString())

    const toVlanInput = screen.getByRole('spinbutton', { name: /To VLAN/i })
    await userEvent.clear(toVlanInput)
    await userEvent.type(toVlanInput, ruleAfterEdit.toVlan.toString())

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))


    expect(await screen.findByRole('cell', { name: ruleAfterEditTypeLabel.current })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('cell', { name: ruleAfterEdit.fromVlan.toString() })).toBeVisible()
    expect(await screen.findByRole('cell', { name: ruleAfterEdit.toVlan.toString() })).toBeVisible()
  })

  it('should delete forwarding rule', async () => {
    const targetRule: MdnsProxyForwardingRule = mockedRules[0]
    const { result: targetRuleTypeLabel } = renderHook(() => {
      return useIntl().$t(mdnsProxyRuleTypeLabelMapping[targetRule.service])
    })

    const Component = () => {
      const [ rules, setRules ] = useState<MdnsProxyForwardingRule[]>([targetRule])

      return (
        <MdnsProxyForwardingRulesTable
          rules={rules}
          setRules={setRules}
        />
      )
    }

    render(<Component/>)

    // eslint-disable-next-line max-len
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRuleTypeLabel.current) })

    await userEvent.click(within(targetRow).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: /Delete/i }))

    // eslint-disable-next-line max-len
    expect(await screen.findByText('Delete "' + targetRuleTypeLabel.current + '"?')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: /Delete Rule/i }))


    // eslint-disable-next-line max-len
    const targetAfterDelete = screen.queryByRole('cell', { name: targetRuleTypeLabel.current })
    expect(targetAfterDelete).toBeNull()
  })

  it('should behave that the rules have reached the max limit', async () => {
    const Component = () => {
      const [ rules, setRules ] = useState<MdnsProxyForwardingRule[]>([...mockedRules])

      return (
        <MdnsProxyForwardingRulesTable
          rules={rules}
          setRules={setRules}
        />
      )
    }

    render(<Component/>)

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))

    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: /Type/ }),
      await screen.findByRole('option', { name: 'Other' })
    )
    await userEvent.type(await screen.findByRole('textbox', { name: /Service Name/i }), 'S1')
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: /Transport Protocol/ }),
      await screen.findByRole('option', { name: 'TCP' })
    )
    await userEvent.type(screen.getByRole('spinbutton', { name: /From VLAN/i }), '111')
    await userEvent.type(screen.getByRole('spinbutton', { name: /To VLAN/i }), '222')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(async () =>
      expect(await screen.findByRole('button', { name: 'Add Rule' })).toBeDisabled()
    )
    const button = await screen.findByRole('button', { name: 'Add Rule' })
    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.hover(button.parentElement!)
    // Verify the warning message of the rules maximum limit
    expect(await screen.findByText('The rule has reached the limit (3).')).toBeInTheDocument()
  })
})
