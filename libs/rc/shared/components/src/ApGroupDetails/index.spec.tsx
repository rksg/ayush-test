import { rest } from 'msw'

import { apApi, networkApi } from '@acx-ui/rc/services'
import {
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  SwitchRbacUrlsInfo,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { act, mockServer, render, screen } from '@acx-ui/test-utils'
import { AnalyticsFilter }                 from '@acx-ui/utils'

import {
  apGroupMembers,
  apGroupNetworkLinks,
  networkApGroup,
  networkDeepList,
  oneApGroupList,
  vlanPoolProfilesData
} from './__tests__/fixtures'

import { ApGroupDetails } from './index'


jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  IncidentTabContent: (props: { filters: AnalyticsFilter }) => <div
    data-testid='incidents-table'>{JSON.stringify(props.filters)}</div>
}))

jest.mock('./ApGroupNetworksTab', () => {
  const MockedApGroupNetworksTab = () => (
    <div data-testid='ApGroupNetworksTab'>Mocked ApGroupNetworksTab</div>
  )
  return {
    __esModule: true,
    default: MockedApGroupNetworksTab
  }
})

jest.mock('./ApGroupMembersTab', () => {
  const MockedApGroupMembersTab = () => (
    <div data-testid='ApGroupMembersTab'>Mocked ApGroupMembersTab</div>
  )
  return {
    __esModule: true,
    default: MockedApGroupMembersTab
  }
})

const mockvenueNetworkApGroup = jest.fn()

describe('ApGroupDetails', () => {
  beforeEach(() => {
    mockvenueNetworkApGroup.mockClear()
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
      store.dispatch(apApi.util.resetApiState())
    })

    mockServer.use(
      rest.post(
        WifiUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => res(ctx.json(oneApGroupList))
      ),
      rest.post(
        CommonUrlsInfo.getApGroupNetworkList.url,
        (_, res, ctx) => res(ctx.json(apGroupNetworkLinks))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (_, res, ctx) => {
          mockvenueNetworkApGroup()
          return res(ctx.json(networkApGroup))
        }
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => {
          mockvenueNetworkApGroup()
          return res(ctx.json(networkApGroup))
        }
      ),
      rest.get(
        WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepList.response))
      ),
      rest.post(
        WifiUrlsInfo.getVlanPoolViewModelList.url,
        (req, res, ctx) => res(ctx.json(vlanPoolProfilesData))
      ),
      rest.get(
        WifiRbacUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepList.response))
      ),
      rest.get(
        WifiRbacUrlsInfo.getWifiCapabilities.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(apGroupMembers))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      ),
      rest.post(
        WifiRbacUrlsInfo.getApGroupsList.url,
        (_, res, ctx) => res(ctx.json(oneApGroupList))
      )

    )
  })


  it('should render the member tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apGroupId: 'apgroup-id',
      activeTab: 'members'
    }
    render(<Provider><ApGroupDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/apgroups/:apGroupId/details/:activeTab' }
    })

    expect(await screen.findByTestId(/ApGroupMembersTab/)).toBeVisible()
    expect(await screen.findAllByRole('tab')).toHaveLength(3)
  })

  it('should render the networks tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apGroupId: 'apgroup-id',
      activeTab: 'networks'
    }
    render(<Provider><ApGroupDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/apgroups/:apGroupId/details/:activeTab' }
    })

    expect(await screen.findByTestId(/ApGroupNetworksTab/)).toBeVisible()
    expect(await screen.findAllByRole('tab')).toHaveLength(3)
  })

  it('should render the incidents tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      apGroupId: 'apgroup-id',
      activeTab: 'incidents'
    }
    render(<Provider><ApGroupDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/apgroups/:apGroupId/details/:activeTab' }
    })

    expect(await screen.findByText(/Incidents/)).toBeVisible()
    expect(await screen.findByTestId('incidents-table')).toBeVisible()
    expect(await screen.findAllByRole('tab')).toHaveLength(3)
  })
})
