import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mockDDoSRules } from './__tests__/fixtures'

import { DDoSRulesTable } from './'

describe('DDoS rules table', () => {
  it('should render when data source undefined', async () => {
    render(
      <Provider>
        <DDoSRulesTable
          dataSource={undefined}
        />
      </Provider>)

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(2)
    expect(rows[1].textContent).toBe('')
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <DDoSRulesTable
          dataSource={mockDDoSRules}
        />
      </Provider>)

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(3) // 2 + 1(header row)
  })
})