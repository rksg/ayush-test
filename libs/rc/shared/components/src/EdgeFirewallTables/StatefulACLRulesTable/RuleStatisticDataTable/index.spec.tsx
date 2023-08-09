
import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mockACLInboundRulesWithStatistic } from '../__tests__/fixtures'

import { RuleStatisticDataTable } from './'

describe('Stateful ACL rules table with statistic data', () => {

  it('should correctly render', async () => {
    render(
      <Provider>
        <RuleStatisticDataTable
          dataSource={mockACLInboundRulesWithStatistic}
        />
      </Provider>)

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(2) // 1 + 1(header row)
    expect(screen.queryByRole('row',
      { name: /1 Block Any Any Any 19 300 KB/ })).toBeValid()
  })
})