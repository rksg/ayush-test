import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi, networkApi, nsgApi, switchApi, venueApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  EdgeUrlsInfo,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  NetworkSegmentationUrls,
  ServiceOperation,
  ServiceType,
  SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                             from '@acx-ui/store'
import {
  mockServer, render,
  screen, waitFor, waitForElementToBeRemoved, within
} from '@acx-ui/test-utils'

import { mockEdgeData,
  mockedNetworkOptions,
  mockedSwitchOptions,
  mockNsgStatsList,
  mockVenueData } from '../__tests__/fixtures'

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
  const mockedDeleteNetworkSegmentationGroup = jest.fn()
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(nsgApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(switchApi.util.resetApiState())

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
        (req, res, ctx) => {
          mockedDeleteNetworkSegmentationGroup()
          return res(ctx.status(202))}
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockedNetworkOptions))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (req, res, ctx) => res(ctx.json(mockedSwitchOptions))
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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('row', { name: /nsg/i })
    expect(rows.length).toBe(2)

    expect(rows[0]).toHaveTextContent(/sg1\s*MockVenue1\s*SmartEdge1\s*1\s*0\s*Poor\s*No/)
    expect(rows[1]).toHaveTextContent(/nsg2\s*1\s*0\s*Unknown\s*No/)
  })


  it('should render breadcrumb correctly', async () => {
    render(<NetworkSegmentationTable />, {
      wrapper: Provider,
      route: { params, path: tablePath }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const smartEdgeLink = await screen.findByRole('link',
      { name: 'SmartEdge1' }) as HTMLAnchorElement
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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const venue1List = await screen.findAllByRole('link', { name: 'MockVenue1' })
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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /nsg1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "nsg1"?')
    await user.click((await screen.findAllByRole('button', { name: 'Delete' }))[1])
    await waitFor(() => {
      expect(mockedDeleteNetworkSegmentationGroup).toBeCalled()
    })
  })
})
