import { rest } from 'msw'

import { useIsSplitOn }             from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, DHCPUrls } from '@acx-ui/rc/utils'
import { Provider }                 from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import DHCPServiceDetail from '.'

const list = {
  fields: ['name', 'switches', 'id', 'aggregatedApStatus'],
  totalCount: 3,
  page: 1,
  data: [
    { id: 'e16f5cb9aded49f6acd5891eb8897890', name: 'dfggsrgesr' },
    { id: '57db532207814948aa61b156e1cf2b9e', name: 'RT Nagar' },
    { id: '2725fdb455ec4785b1a633039b70b1aa', name: 'test_UK',
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 } }]
}

const detailResult = {
  usage: [
    {
      venueId: 'e16f5cb9aded49f6acd5891eb8897890',
      totalIpCount: 24,
      usedIpCount: 3
    }],
  dhcpMode: 'EnableOnMultipleAPs',
  dhcpPools: [
    {
      name: 'DhcpServiceProfile#1',
      vlanId: 1001,
      subnetAddress: '192.168.1.0',
      subnetMask: '255.255.255.0',
      startIpAddress: '192.168.1.1',
      endIpAddress: '192.168.1.254',
      leaseTimeHours: 0,
      leaseTimeMinutes: 30,
      id: '14eb1818309c434da928410fa2298ea5',
      description: 'description1'
    }
  ],
  serviceName: 'DhcpConfigServiceProfile1',
  id: '78f92fbf80334e8b83cddd3210db4920'
}

describe('DHCP Detail Page', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'e3d0c24e808d42b1832d47db4c2a7914',
      serviceId: '78f92fbf80334e8b83cddd3210db4920'
    }
    mockServer.use(
      rest.get(
        DHCPUrls.getDHCProfileDetail.url,
        (req, res, ctx) => res(ctx.json(detailResult))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
  })

  it.skip('should render detail page', async () => {
    render(
      <Provider>
        <DHCPServiceDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/:serviceId/detail' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(('Number of Pools'))).toBeInTheDocument()
    expect(await screen.findByText((`Instances (${list.data.length})`))).toBeInTheDocument()
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <DHCPServiceDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/:serviceId/detail' }
      })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('My Services')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'DHCP Services'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <DHCPServiceDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/t/services/dhcp/:serviceId/detail' }
      })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'DHCP'
    })).toBeVisible()

  })
})
