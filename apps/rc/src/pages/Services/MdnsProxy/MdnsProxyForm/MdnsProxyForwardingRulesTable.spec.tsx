import userEvent   from '@testing-library/user-event'
import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  MdnsProxyForwardingRule,
  MdnsProxyForwardingRuleTypeEnum
} from '@acx-ui/rc/utils'
import { logRoles, render, renderHook, screen, within } from '@acx-ui/test-utils'

import { mdnsProxyForwardingRuleTypeLabelMapping as ruleTypeLabelMapping } from '../../contentsMap'

import { mockedForwardingRules }         from './__tests__/fixtures'
import { MdnsProxyForwardingRulesTable } from './MdnsProxyForwardingRulesTable'





describe('MdnsProxyForwardingRulesTable', () => {
  it('should render the table with the given data', async () => {
    const { asFragment } = render(<MdnsProxyForwardingRulesTable rules={mockedForwardingRules} />)

    expect(asFragment()).toMatchSnapshot()

    const { result: targetTypeLabel } = renderHook(() => {
      const { $t } = useIntl()
      return $t(ruleTypeLabelMapping[mockedForwardingRules[0].bridgeService])
    })

    await screen.findByRole('row', { name: new RegExp(targetTypeLabel.current) })
  })

  it('should render the readonly table', async () => {
    const { asFragment } = render(
      <MdnsProxyForwardingRulesTable
        rules={mockedForwardingRules}
        readonly={true}
      />
    )

    expect(asFragment()).toMatchSnapshot()

    const { result: targetTypeLabel } = renderHook(() => {
      const { $t } = useIntl()
      return $t(ruleTypeLabelMapping[mockedForwardingRules[0].bridgeService])
    })

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetTypeLabel.current) })
    const targetRowRadio = within(targetRow).queryByRole('radio')

    expect(targetRowRadio).toBeNull()
  })

  it('should be invalid when creating the duplicated rule', async () => {
    const ruleToAdd: MdnsProxyForwardingRule = {
      id: '__RULE_ID__',
      bridgeService: MdnsProxyForwardingRuleTypeEnum.AIRPLAY,
      fromVlan: 1,
      toVlan: 2
    }

    const { result: fakeRuleTypeLabel } = renderHook(() => {
      return useIntl().$t(ruleTypeLabelMapping[ruleToAdd.bridgeService])
    })

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Form form={formRef.current}>
        <MdnsProxyForwardingRulesTable rules={[ruleToAdd]} />
      </Form>
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))

    const drawer = await screen.findByRole('dialog')
    await userEvent.click(await within(drawer).findByRole('combobox', { name: 'Type' }))
    // await userEvent.click(await within(drawer).findByText(fakeRuleTypeLabel.current))

    // await userEvent.type(
    //   within(drawer).getByRole('spinbutton', { name: /From VLAN/i }),
    //   ruleToAdd.fromVlan.toString()
    // )
    // await userEvent.type(
    //   within(drawer).getByRole('spinbutton', { name: /To VLAN/i }),
    //   ruleToAdd.toVlan.toString()
    // )

    // // eslint-disable-next-line max-len
    // const errorMessageElem = await within(drawer).findByText('Rule with same Type and VLAN IDs already exists')
    // expect(errorMessageElem).toBeInTheDocument()
  })
})
