import { NetworkTypeEnum, useTableQuery } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import { render, screen }                 from '@acx-ui/test-utils'

import { NetworksTable } from './NetworksTable'

const mockedTableSetPayload = jest.fn()

jest.mock('@acx-ui/rc/services', () => ({
  useWifiNetworkListQuery: jest.fn()
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useTableQuery: jest.fn().mockReturnValue({
    data: {},
    setPayload: (params: unknown) => mockedTableSetPayload(params)
  })
}))

describe('NetworksTable', () => {
  it('renders correctly with no network IDs', () => {
    render(<Provider>
      <NetworksTable networkIds={undefined} />
    </Provider>)

    expect(screen.getByText('Network Name')).toBeVisible()
    expect(screen.getByText('Network Type')).toBeInTheDocument()
  })

  it('renders correctly with network IDs', () => {
    const networkIds = ['id1', 'id2']
    render(<Provider>
      <NetworksTable networkIds={networkIds} />
    </Provider>)

    expect(screen.getByText('Network Name')).toBeInTheDocument()
    expect(screen.getByText('Network Type')).toBeInTheDocument()
  })

  it('updates table query when network IDs change', () => {
    mockedTableSetPayload.mockReset()

    const networkIds = ['id1', 'id2']
    const { rerender } = render(<Provider>
      <NetworksTable networkIds={networkIds} />
    </Provider>)

    const newNetworkIds = ['id3', 'id4']
    rerender(<NetworksTable networkIds={newNetworkIds} />)

    expect(mockedTableSetPayload).toHaveBeenNthCalledWith(2, { filters: { id: newNetworkIds } })
  })

  it('renders table with correct columns and data', async () => {

    const networkIds = ['id1', 'id2']
    const data = [
      { id: 'id1', name: 'Network 1', nwSubType: NetworkTypeEnum.PSK },
      { id: 'id2', name: 'Network 2', nwSubType: NetworkTypeEnum.DPSK }
    ]

    jest.mocked(useTableQuery).mockReturnValue({
      data: { data, totalCount: data.length },
      pagination: { current: 1, pageSize: 10 },
      handleTableChange: jest.fn(),
      setPayload: jest.fn()
    })

    render(<Provider>
      <NetworksTable networkIds={networkIds} />
    </Provider>, { route: { params: { tenantId: 'tenant-id' } } })

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(rows[1]).toHaveTextContent('Network 1')
    expect(rows[2]).toHaveTextContent('Network 2')
    expect(rows[2]).toHaveTextContent('Dynamic Pre-Shared Key (DPSK)')
  })
})