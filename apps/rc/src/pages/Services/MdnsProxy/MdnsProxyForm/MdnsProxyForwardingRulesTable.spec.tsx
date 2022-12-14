import { useIntl } from 'react-intl'

import { render, renderHook, screen, within } from '@acx-ui/test-utils'

import { mdnsProxyForwardingRuleTypeLabelMapping as ruleTypeLabelMapping } from '../../contentsMap'

import { mockedForwardingRules }         from './__tests__/fixtures'
import { MdnsProxyForwardingRulesTable } from './MdnsProxyForwardingRulesTable'



describe('MdnsProxyForwardingRulesTable', () => {
  it('should render the table with the given data', async () => {
    const { asFragment } = render(<MdnsProxyForwardingRulesTable rules={mockedForwardingRules} />)

    expect(asFragment()).toMatchSnapshot()

    const { result: targetTypeLabel } = renderHook(() => {
      const { $t } = useIntl()
      return $t(ruleTypeLabelMapping[mockedForwardingRules[0].type])
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
      return $t(ruleTypeLabelMapping[mockedForwardingRules[0].type])
    })

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetTypeLabel.current) })
    const targetRowRadio = within(targetRow).queryByRole('radio')

    expect(targetRowRadio).toBeNull()
  })
})
