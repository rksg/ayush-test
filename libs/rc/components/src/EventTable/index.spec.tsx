import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                                            from '@acx-ui/feature-toggle'
import { Event, EventBase, EventMeta, RequestPayload, TableQuery } from '@acx-ui/rc/utils'
import { Provider }                                                from '@acx-ui/store'
import { findTBody, render, screen, within }                       from '@acx-ui/test-utils'

import { events, eventsMeta } from './__tests__/fixtures'

import { EventTable } from '.'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Tooltip: (props: React.PropsWithChildren<{ title: JSX.Element }>) => <div data-testid='tooltip'>
    <span>{props.children /* eslint-disable-line testing-library/no-node-access */}</span>
    <span data-testid='tooltip-content'>{props.title}</span>
  </div>
}))

const params = { tenantId: 'tenant-id' }

describe('EventTable', () => {
  const tableQuery = {
    data: { data: events.map(base =>
      ({ ...base, ...eventsMeta.find(meta => meta.id === base.id) }))
    },
    pagination: { current: 1, page: 1, pageSize: 10, total: 0 },
    handleTableChange: jest.fn()
  } as unknown as TableQuery<Event, RequestPayload<unknown>, unknown>

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should render activity list', async () => {
    render(
      <Provider>
        <EventTable tableQuery={tableQuery} />
      </Provider>,
      { route: { params } }
    )

    const tbody = within(await findTBody())
    const rows = await tbody.findAllByRole('row')

    const expected = [
      'AP 730-11-60 RF operating channel was changed from channel 7 to channel 9.',
      'AP 850-151-164 is unable to reach radius server 123.10.10.45.',
      'User 8483-A14-Dell6E was disconnected from the Wi-Fi network 123guest due to lack of activity.', // eslint-disable-line max-len
      'FEK3204N013 Switch is deleted by the cloud controller.'
    ]

    expected.forEach((expected, index) => expect(rows[index].textContent).toContain(expected))
  })

  it('should open/close activity drawer', async () => {
    render(
      <Provider>
        <EventTable tableQuery={tableQuery} />
      </Provider>,
      { route: { params } }
    )
    const row = await screen.findByRole('row', {
      name: /AP 730-11-60 RF operating channel was changed from channel 7 to channel 9./
    })
    await userEvent.click(within(row).getByRole('button', { name: /2022/ }))
    screen.getByText('Event Details')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Activity Details')).toBeNull()
  })

  it('renders value as-is for non entity prop', async () => {
    tableQuery.data!.data = [{
      ...events[0] as EventBase,
      ...eventsMeta[0] as EventMeta,
      message: '{"message_template": "Serial Number is @@serialNumber"}'
    }]

    render(
      <Provider>
        <EventTable tableQuery={tableQuery} />
      </Provider>,
      { route: { params } }
    )

    const serialNumber = events[0].serialNumber
    const element = await screen.findByText(`Serial Number is ${serialNumber}`)
    expect(element).toBeVisible()
  })

  it('renders "Not Available" tooltip for entity not exists', async () => {
    tableQuery.data!.data = [{
      ...events[0] as EventBase,
      ...eventsMeta[0] as EventMeta,
      isApExists: false,
      message: '{"message_template": "AP @@apName"}'
    }]

    render(
      <Provider>
        <EventTable tableQuery={tableQuery} />
      </Provider>,
      { route: { params } }
    )

    const cell = await screen.findByRole('cell', {
      name: `AP ${eventsMeta[0].apName!} Not available`
    })

    expect(await within(cell).findByText(eventsMeta[0].apName!)).toBeVisible()
    expect(await within(cell).findByTestId('tooltip-content')).toHaveTextContent('Not available')
  })

  it('render value as-is for entity not enabled', async () => {
    tableQuery.data!.data = [{
      ...events[3] as EventBase,
      ...eventsMeta[3] as EventMeta
    }]

    const name = eventsMeta[3].switchName
    const { rerender } = render(
      <Provider><EventTable tableQuery={tableQuery} /></Provider>,
      { route: { params } }
    )

    let elements = await screen.findAllByText(name)
    expect(elements).toHaveLength(2)
    elements.forEach(element => expect(element.nodeName).toBe('A'))

    jest.mocked(useIsSplitOn).mockReturnValue(false)

    rerender(<Provider><EventTable tableQuery={tableQuery} /></Provider>)

    elements = await screen.findAllByText(name)
    expect(elements).toHaveLength(1)
    elements.forEach(element => expect(element.nodeName).not.toBe('A'))
  })
})
