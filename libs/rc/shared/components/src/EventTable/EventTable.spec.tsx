import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { Event, EventBase, EventMeta, TableQuery } from '@acx-ui/rc/utils'
import { Provider }                                from '@acx-ui/store'
import { findTBody, render, screen, within }       from '@acx-ui/test-utils'
import { RequestPayload }                          from '@acx-ui/types'

import { events, eventsMeta } from './__tests__/fixtures'

import { EventTable } from '.'

const mockExportCsv = jest.fn()
jest.mock('./useExportCsv', () => ({
  ...jest.requireActual('./useExportCsv'),
  useExportCsv: () => ({ exportCsv: mockExportCsv })
}))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: { detailLevel: 'it' } })
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Tooltip: (props: React.PropsWithChildren<{ title: JSX.Element }>) => <div data-testid='tooltip'>
    <span>{props.children /* eslint-disable-line testing-library/no-node-access */}</span>
    <span data-testid='tooltip-content'>{props.title}</span>
  </div>
}))

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

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should render event list', async () => {
    render(
      <EventTable tableQuery={tableQuery} />,
      { route: { params }, wrapper: Provider }
    )

    await screen.findByPlaceholderText('Search Source, Description')
    expect(await screen.findAllByText('Severity')).toHaveLength(2)
    expect(await screen.findAllByText('Event Type')).toHaveLength(2)
    expect(await screen.findAllByText('Product')).toHaveLength(2)

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

  it('should render based on filterables/searchables is empty', async () => {
    render(<EventTable
      tableQuery={tableQuery}
      searchables={[]}
      filterables={[]}
    />, { route: { params }, wrapper: Provider })
    await screen.findByText('Severity')
    await screen.findByText('Event Type')
    await screen.findByText('Product')
  })

  it('should render based on filterables/searchables is false', async () => {
    render(<EventTable
      tableQuery={tableQuery}
      searchables={false}
      filterables={false}
    />, { route: { params }, wrapper: Provider })
    await screen.findByText('Severity')
    await screen.findByText('Event Type')
    await screen.findByText('Product')
  })

  it('should render based on filterables/searchables is array', async () => {
    render(<EventTable
      tableQuery={tableQuery}
      searchables={['message', 'entity_type']}
      filterables={['severity', 'entity_type', 'product']}
    />, { route: { params }, wrapper: Provider })
    await screen.findByPlaceholderText('Search Source, Description')
    expect(await screen.findAllByText('Severity')).toHaveLength(2)
    expect(await screen.findAllByText('Event Type')).toHaveLength(2)
    expect(await screen.findAllByText('Product')).toHaveLength(2)
  })

  it('should open/close/reopen event drawer', async () => {
    render(
      <EventTable tableQuery={tableQuery} />,
      { route: { params }, wrapper: Provider }
    )
    const row = await screen.findByRole('row', {
      name: /AP 730-11-60 RF operating channel was changed from channel 7 to channel 9./
    })
    await userEvent.click(within(row).getByRole('button', { name: /2022/ }))
    expect(screen.getByRole('dialog')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('dialog').parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
    await userEvent.click(within(row).getByRole('button', { name: /2022/ }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('dialog').parentNode)
      .not.toHaveClass('ant-drawer-content-wrapper-hidden')
  })

  it('should close drawer, when data changed', async () => {
    const { rerender } = render(
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

    const newTableQuery = {
      ...tableQuery, data: { data: [] }
    } as unknown as TableQuery<Event, RequestPayload<unknown>, unknown>
    rerender(<Provider><EventTable tableQuery={newTableQuery} /></Provider>)
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('dialog').parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
  })

  it('renders value as-is for non entity prop', async () => {
    tableQuery.data!.data = [{
      ...events[0] as EventBase,
      ...eventsMeta[0] as EventMeta,
      message: '{"message_template": "Serial Number is @@serialNumber"}'
    }]

    render(
      <EventTable tableQuery={tableQuery} />,
      { route: { params }, wrapper: Provider }
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
      <EventTable tableQuery={tableQuery} />,
      { route: { params }, wrapper: Provider }
    )

    const cell = await screen.findByRole('cell', {
      name: `AP ${eventsMeta[0].apName!} Not available`
    })

    expect(await within(cell).findByText(eventsMeta[0].apName!)).toBeVisible()
    expect(await within(cell).findByTestId('tooltip-content')).toHaveTextContent('Not available')
  })

  it('should download csv on click', async () => {
    render(
      <EventTable tableQuery={tableQuery} />,
      { route: { params }, wrapper: Provider }
    )
    await userEvent.click(screen.getByTestId('DownloadOutlined'))
    expect(mockExportCsv).toBeCalled()
  })

  it('should not render omitColumns',async () => {
    render(
      <EventTable tableQuery={tableQuery} omitColumns={['product']}/>,
      { route: { params }, wrapper: Provider }
    )
    expect(screen.queryByText('Product')).toBeNull()
  })
})
