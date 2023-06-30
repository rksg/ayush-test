import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mockACLOutboundRules } from './__tests__/fixtures'

import { StatefulACLRulesTable } from './'

describe('Stateful ACL rules table', () => {
  it('should render when data source undefined', async () => {
    render(
      <Provider>
        <StatefulACLRulesTable
          dataSource={undefined}
        />
      </Provider>)

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(2)
    expect(rows[1].textContent).toBe('')
  })

  it('should correctly render with page size', async () => {
    render(
      <Provider>
        <StatefulACLRulesTable
          dataSource={mockACLOutboundRules}
          pagination={{
            pageSize: 5,
            defaultPageSize: 5
          }}
        />
      </Provider>)

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(6) // 5 + 1(header row)
  })

  it('should correctly render custom protocol value', async () => {
    render(
      <Provider>
        <StatefulACLRulesTable
          dataSource={mockACLOutboundRules}
          pagination={{
            pageSize: 5,
            defaultPageSize: 5
          }}
        />
      </Provider>)

    await screen.findAllByRole('row')
    expect(screen.queryByText('Custom (213)')).toBeValid()
  })
})

