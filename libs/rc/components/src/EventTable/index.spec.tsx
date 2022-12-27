import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Event, RequestPayload, TableQuery } from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import { render, screen }                    from '@acx-ui/test-utils'

import { events, eventsMeta } from './__tests__/fixtures'

import { EventTable } from '.'

const params = { tenantId: 'tenant-id' }

describe('EventTable', () => {
  const tableQuery = {
    data: { data: events.map(base =>
      ({ ...base, ...eventsMeta.find(meta => meta.id === base.id) }))
    },
    pagination: { current: 1, page: 1, pageSize: 10, total: 0 },
    handleTableChange: jest.fn()
  } as unknown as TableQuery<Event, RequestPayload<unknown>, unknown>

  it('should render activity list', async () => {
    render(
      <Provider>
        <EventTable tableQuery={tableQuery} />
      </Provider>,
      { route: { params } }
    )
    await screen.findByText(
      'AP 730-11-60 RF operating channel was changed from channel 7 to channel 9.'
    )
  })

  it('should open/close activity drawer', async () => {
    render(
      <Provider>
        <EventTable tableQuery={tableQuery} />
      </Provider>,
      { route: { params } }
    )
    await screen.findByText(
      'AP 730-11-60 RF operating channel was changed from channel 7 to channel 9.'
    )
    await userEvent.click(screen.getByRole('button', { name: /2022/ }))
    screen.getByText('Event Details')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Activity Details')).toBeNull()
  })
})
