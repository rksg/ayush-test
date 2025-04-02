
import { EdgeSdLanFixtures, getPolicyDetailsLink, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { Provider }                                                             from '@acx-ui/store'
import {  render, screen }                                                      from '@acx-ui/test-utils'


import { DmzSdLanDetailContent } from './DmzSdLanDetailContent'

const { mockedMvSdLanDataList, mockApListForApTableTest } = EdgeSdLanFixtures
const mockedSdLanData = mockedMvSdLanDataList[0]
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./SmartEdgesTable', () => ({
  ...jest.requireActual('./SmartEdgesTable'),
  SmartEdgesTable: () => <div data-testid='SmartEdgesTable' />
}))
jest.mock('./VenueTable', () => ({
  ...jest.requireActual('./VenueTable'),
  VenueTable: () => <div data-testid='VenueTable' />
}))
jest.mock('./SdLanApTable', () => ({
  ...jest.requireActual('./SdLanApTable'),
  SdLanApTable: () => <div data-testid='SdLanApTable' />
}))
jest.mock('./index', () => ({
  ...jest.requireActual('./index'),
  useSdlanApListTableQuery: () => ({
    data: mockApListForApTableTest,
    isLoading: false
  })
}))

describe('Edge SD-LAN Detail - DMZ', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <DmzSdLanDetailContent data={mockedSdLanData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeSdLanP2/:serviceId/detail' }
      }
    )

    expect(screen.getByText('Service Health')).toBeVisible()
    expect(screen.getByText('Poor')).toBeVisible()
    expect(screen.getByText('Destination RUCKUS Edge cluster')).toBeVisible()
    // eslint-disable-next-line max-len
    expect((screen.getByRole('link', { name: 'SE_Cluster 0' }) as HTMLAnchorElement).href).toContain(`devices/edge/cluster/${mockedSdLanData.edgeClusterId}/edit/cluster-details`)
    expect(screen.getByText('DMZ Cluster')).toBeVisible()
    // eslint-disable-next-line max-len
    expect((screen.getByRole('link', { name: 'SE_Cluster 3' }) as HTMLAnchorElement).href).toContain(`devices/edge/cluster/${mockedSdLanData.guestEdgeClusterId}/edit/cluster-details`)
    expect(screen.getByText('Tunnel Profile (AP to Cluster)')).toBeVisible()
    // eslint-disable-next-line max-len
    expect((screen.getByRole('link', { name: 'Mocked_tunnel-1' }) as HTMLAnchorElement).href).toContain(getPolicyDetailsLink({
      type: PolicyType.TUNNEL_PROFILE,
      oper: PolicyOperation.DETAIL,
      policyId: mockedSdLanData.tunnelProfileId!
    }))
    expect(screen.getByText('Instances')).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Venues (1)' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'AP (2)' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'RUCKUS Edges (2)' })).toBeVisible()
  })
})
