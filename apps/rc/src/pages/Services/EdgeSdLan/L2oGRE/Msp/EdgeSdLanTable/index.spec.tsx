import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeSdLanFixtures, EdgeSdLanUrls, EdgeUrlsInfo, ServiceOperation, ServiceType, getServiceDetailsLink } from '@acx-ui/rc/utils'
import { Provider }                                                                                                             from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within }                                               from '@acx-ui/test-utils'
import { useTableQuery }                                                                                                        from '@acx-ui/utils'

import { EdgeSdLanTable } from '.'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const mockedGetVenueList = jest.fn()
const mockedGetClusterList = jest.fn()
const mockedDeleteReq = jest.fn()
const mockedUsedNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetEdgeMvSdLanViewDataListQuery: () => ({
    data: {
      data: []
    }
  })
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeTableCompatibilityWarningTooltip: () => (
    <div data-testid='CompatibilityCheck'>CompatibilityCheck</div>
  ),
  EdgeServiceStatusLight: () => <div data-testid='ServiceStatusLight'>ServiceStatusLight</div>,
  useEdgeSdLansCompatibilityData: () => ({
    compatibilities: []
  })
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useTableQuery: jest.fn().mockImplementation(() => ({
    data: {
      data: mockedMvSdLanDataList,
      totalCount: mockedMvSdLanDataList.length
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: mockedMvSdLanDataList.length
    },
    handleFilterChange: jest.fn(),
    handleTableChange: jest.fn(),
    isLoading: false,
    isFetching: false
  }))
}))

describe('EdgeSdLanTable - MSP', () => {
  const params = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  beforeEach(() => {
    jest.clearAllMocks()

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => {
          mockedGetVenueList()
          return res(ctx.json({ data: [] }))
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => {
          mockedGetClusterList()
          return res(ctx.json({ data: [] }))
        }
      ),
      rest.delete(
        EdgeSdLanUrls.deleteEdgeSdLan.url,
        (_, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: {}
      })

    await waitFor(() => expect(mockedGetVenueList).toHaveBeenCalled())
    await waitFor(() => expect(mockedGetClusterList).toHaveBeenCalled())

    expect(screen.getByRole('button', { name: 'Add SD-LAN Service' })).toBeVisible()
    await basicCheck()
  })

  it('should delete selected row', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: {}
      }
    )

    await basicCheck()
    const row = screen.getByRole('row', { name: new RegExp(`${mockedMvSdLanDataList[0].name}`) })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText(`Delete "${mockedMvSdLanDataList[0].name}"?`)
    await userEvent.click(screen.getByRole('button', { name: 'Delete SD-LAN' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockedDeleteReq).toBeCalledTimes(1)
  })

  it('should go edit page', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLan/list' }
      }
    )

    await basicCheck()
    const row = screen.getByRole('row', { name: new RegExp(`${mockedMvSdLanDataList[0].name}`) })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    const editPath = getServiceDetailsLink({
      type: ServiceType.EDGE_SD_LAN,
      oper: ServiceOperation.EDIT,
      serviceId: mockedMvSdLanDataList[0].id!
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${editPath}`,
      hash: '',
      search: ''
    })
  })

  it('should display venue names when hover', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    await basicCheck()
    const row1 = screen.getByRole('row', { name: new RegExp(`${mockedMvSdLanDataList[0].name}`) })
    await userEvent.hover(within(row1).getByText('1'))
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Mocked-Venue-1')).toBeInTheDocument()
  })

  it('should display my account and my customer venue name', async () => {
    jest.mocked(useTableQuery).mockImplementation(() => ({
      data: {
        data: [
          mockedMvSdLanDataList[0],
          {
            ...mockedMvSdLanDataList[1],
            tunneledWlans: [
              mockedMvSdLanDataList[1].tunneledWlans[0],
              {
                ...mockedMvSdLanDataList[1].tunneledWlans[1],
                wlanId: 60001
              }
            ]
          }
        ],
        totalCount: mockedMvSdLanDataList.length
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: mockedMvSdLanDataList.length
      },
      handleFilterChange: jest.fn(),
      handleTableChange: jest.fn(),
      isLoading: false,
      isFetching: false
    }))

    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    await basicCheck()
    const row1 = screen.getByRole('row', { name: new RegExp(`${mockedMvSdLanDataList[1].name}`) })
    await userEvent.hover(within(row1).getByText('2'))
    expect(await screen.findByText('My Account:')).toBeInTheDocument()
    expect(screen.getByText('My Customers:')).toBeInTheDocument()
    expect(screen.getByText('Mocked-Venue-2')).toBeInTheDocument()
    expect(screen.getByText('Mocked-Venue-3')).toBeInTheDocument()
  })
})

const basicCheck= async () => {
  expect(await screen.findByText('SD-LAN (2)')).toBeVisible()
  // eslint-disable-next-line max-len
  expect(screen.getByRole('row', { name: 'Mocked_SDLAN_1 CompatibilityCheck ServiceStatusLight My account Mocked_tunnel-1 SE_Cluster 0 1' })).toBeVisible()
  // eslint-disable-next-line max-len
  expect(screen.getByRole('row', { name: 'Mocked_SDLAN_2 CompatibilityCheck ServiceStatusLight My account Mocked_tunnel-2 SE_Cluster 1 2' })).toBeVisible()
}