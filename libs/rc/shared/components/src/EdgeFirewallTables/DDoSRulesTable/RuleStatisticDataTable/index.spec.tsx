import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mockDDoSRulesWithStatistic } from '../__tests__/fixtures'

import { RuleStatisticDataTable } from './'

describe('DDoS rules table with statistic data', () => {

  it('should correctly render', async () => {
    render(
      <Provider>
        <RuleStatisticDataTable
          dataSource={mockDDoSRulesWithStatistic}
        />
      </Provider>)

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(4) // 2 + 2(header row)
  })
})