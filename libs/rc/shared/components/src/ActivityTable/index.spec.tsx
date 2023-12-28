import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'


import { Activity, TableQuery } from '@acx-ui/rc/utils'
import { Provider }             from '@acx-ui/store'
import { render, screen }       from '@acx-ui/test-utils'
import { RequestPayload }       from '@acx-ui/types'

import { activities } from './__tests__/fixtures'

import { ActivityTable } from '.'

const params = { tenantId: 'tenant-id' }

describe('ActivityTable', () => {
  const tableQuery = {
    data: { data: activities },
    pagination: { current: 1, page: 1, pageSize: 10, total: 0 },
    handleTableChange: jest.fn()
  } as unknown as TableQuery<Activity, RequestPayload<unknown>, unknown>

  it('should render activity table', async () => {
    render(
      <Provider>
        <ActivityTable tableQuery={tableQuery} />
      </Provider>,
      { route: { params } }
    )
    await screen.findByRole('row', { name: /Network ' 123roam ' was updated/ })
  })

  it('should open/close activity drawer', async () => {
    render(
      <Provider>
        <ActivityTable tableQuery={tableQuery} />
      </Provider>,
      { route: { params } }
    )
    await screen.findByRole('row', { name: /Network ' 123roam ' was updated/ })
    await userEvent.click(screen.getByRole('button', { name: /2022/ }))
    expect(screen.getByRole('dialog')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('dialog').parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
  })

  it('should close drawer, when data changed', async () => {
    const { rerender } = render(
      <Provider>
        <ActivityTable tableQuery={tableQuery} />
      </Provider>,
      { route: { params } }
    )
    await screen.findByRole('row', { name: /Network ' 123roam ' was updated/ })
    await userEvent.click(screen.getAllByRole('button', { name: /2022/ })[0])
    expect(screen.getByRole('dialog')).toBeVisible()

    const newTableQuery = {
      ...tableQuery, data: { data: [] }
    } as unknown as TableQuery<Activity, RequestPayload<unknown>, unknown>
    rerender(<Provider><ActivityTable tableQuery={newTableQuery} /></Provider>)
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('dialog').parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
  })
})
