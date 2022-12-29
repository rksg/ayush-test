import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Event, RequestPayload, TableQuery } from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import { render, renderHook, screen }        from '@acx-ui/test-utils'

import { events, eventsMeta } from './__tests__/fixtures'

import { EventTable, useEventTableFilter } from '.'

const params = { tenantId: 'tenant-id' }

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useDateFilter: jest.fn(() => ({
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00'
  }))
}))

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

describe('useEventTableFilter', () => {
  it('should return correct value', () => {
    const { result } = renderHook(() => useEventTableFilter())
    expect(result.current)
      .toEqual({ fromTime: '2021-12-31T16:00:00Z', toTime: '2022-01-01T16:00:00Z' })
  })
})