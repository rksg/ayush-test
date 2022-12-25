import userEvent   from '@testing-library/user-event'
import { useIntl } from 'react-intl'

import {
  MdnsProxyForwardingRule,
  BridgeServiceEnum,
  mdnsProxyRuleTypeLabelMapping
} from '@acx-ui/rc/utils'
import { render, renderHook, screen, within } from '@acx-ui/test-utils'

import { MdnsProxyForwardingRulesTable } from '.'


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

export const mockedForwardingRules: MdnsProxyForwardingRule[] = [
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
    render(<MdnsProxyForwardingRulesTable rules={mockedForwardingRules} />)

    const { result: targetTypeLabel } = renderHook(() => {
      const { $t } = useIntl()
      return $t(mdnsProxyRuleTypeLabelMapping[mockedForwardingRules[0].service])
    })

    await screen.findByRole('row', { name: new RegExp(targetTypeLabel.current) })
  })

  it('should render the readonly table', async () => {
    render(
      <MdnsProxyForwardingRulesTable
        rules={mockedForwardingRules}
        readonly={true}
      />
    )

    const { result: targetTypeLabel } = renderHook(() => {
      const { $t } = useIntl()
      return $t(mdnsProxyRuleTypeLabelMapping[mockedForwardingRules[0].service])
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
})
