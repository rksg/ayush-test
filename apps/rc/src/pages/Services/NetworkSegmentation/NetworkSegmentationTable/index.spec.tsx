import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  EdgeUrlsInfo,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  NetworkSegmentationUrls,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer, render,
  screen, within
} from '@acx-ui/test-utils'

import { mockEdgeData, mockNsgStatsList, mockVenueData } from '../__tests__/fixtures'

import NetworkSegmentationTable from '.'



const mockedUsedNavigate = jest.fn()
const mockUseLocationValue = {
  pathname: getServiceListRoutePath(),
  search: '',
  hash: '',
  state: null
}
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue)
}))

describe('NetworkSegmentationList', () => {
  let params: { tenantId: string }
  const tablePath = '/:tenantId/t' + getServiceRoutePath({
    type: ServiceType.NETWORK_SEGMENTATION,
    oper: ServiceOperation.LIST
  })
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeData))
      ),
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockNsgStatsList))
      ),
      rest.delete(
        NetworkSegmentationUrls.deleteNetworkSegmentationGroup.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should create NetworkSegmentationList successfully', async () => {
    render(
      <Provider>
        <NetworkSegmentationTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /nsg/i })
    expect(row.length).toBe(2)
  })


  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<NetworkSegmentationTable />, {
      wrapper: Provider,
      route: { params, path: tablePath }
    })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<NetworkSegmentationTable />, {
      wrapper: Provider,
      route: { params, path: tablePath }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })
  it('nsg detail page link should be correct', async () => {
    render(
      <Provider>
        <NetworkSegmentationTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const smartEdgeLink = await screen.findByRole('link',
      { name: 'nsg1' }) as HTMLAnchorElement
    expect(smartEdgeLink.href)
      .toContain(`/${params.tenantId}/t/${getServiceDetailsLink({
        type: ServiceType.NETWORK_SEGMENTATION,
        oper: ServiceOperation.DETAIL,
        serviceId: '1'
      })}`)
  })

  it('edge detail page link should be correct', async () => {
    render(
      <Provider>
        <NetworkSegmentationTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const smartEdgeLink = await screen.findByRole('link',
      { name: 'Smart Edge 1' }) as HTMLAnchorElement
    expect(smartEdgeLink.href)
      .toContain(`/${params.tenantId}/t/devices/edge/0000000001/details/overview`)
  })

  it('venue detail page link should be correct', async () => {
    render(
      <Provider>
        <NetworkSegmentationTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const venue1List = await screen.findAllByRole('link', { name: 'Mock Venue 1' })
    const venue1Link = venue1List[0] as HTMLAnchorElement
    expect(venue1Link.href)
      .toContain(`/${params.tenantId}/t/venues/mock_venue_1/venue-details/overview`)
  })

  it('should go edit page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <NetworkSegmentationTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /nsg1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${getServiceDetailsLink({
        type: ServiceType.NETWORK_SEGMENTATION,
        oper: ServiceOperation.EDIT,
        serviceId: '1'
      })}`,
      hash: '',
      search: ''
    }, {
      state: { from: mockUseLocationValue }
    })
  })

  it('edit button will remove when select above 1 row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <NetworkSegmentationTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /nsg/i })
    await user.click(within(row[0]).getByRole('checkbox'))
    await user.click(within(row[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('delete button will remove when select above 1 row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <NetworkSegmentationTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /nsg/i })
    await user.click(within(row[0]).getByRole('checkbox'))
    await user.click(within(row[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
  })

  it('should delete selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <NetworkSegmentationTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /nsg1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "nsg1"?')
    await user.click((await screen.findAllByRole('button', { name: 'Delete' }))[1])
  })
})
