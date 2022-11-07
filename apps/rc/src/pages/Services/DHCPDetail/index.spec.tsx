import { rest } from 'msw'

import { CommonUrlsInfo, DHCPConfigTypeEnum, ServiceTechnology } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import DHCPServiceDetail from '.'

const list = {
  fields: [
    'id',
    'venueName',
    'aps',
    'switches',
    'health',
    'successfulAllocations',
    'unsuccessfulAllocations',
    'droppedPackets',
    'capacity'
  ],
  totalCount: 20,
  page: 1,
  data: [
    {
      id: '1',
      venue: {
        id: '7ae27179b7b84de89eb7e56d9b15943d',
        name: 'Aparna-Venue'
      },
      aps: 45,
      switches: 8,
      health: 0.7,
      successfulAllocations: 80,
      unsuccessfulAllocations: 23,
      droppedPackets: 93,
      capacity: 69
    },
    {
      id: 2,
      venue: {
        id: '3b11bcaffd6f4f4f9b2805b6fe24bf8b',
        name: 'bdcPerformanceVenue'
      },
      aps: 13,
      switches: 8,
      health: 0.95,
      successfulAllocations: 90,
      unsuccessfulAllocations: 30,
      droppedPackets: 90,
      capacity: 68
    },
    {
      id: 3,
      venue: {
        id: 'aac17720c83e475f83ef626d159be9ea',
        name: 'Govind'
      },
      aps: 13,
      switches: 8,
      health: 0.3,
      successfulAllocations: 77,
      unsuccessfulAllocations: 20,
      droppedPackets: 55,
      capacity: 63
    },
    {
      id: 4,
      venue: {
        id: 'ecfab902ac80448c9b6cf1e2e80cc035',
        name: 'Jimmy-Venue'
      },
      aps: 13,
      switches: 8,
      health: 0.1,
      successfulAllocations: 77,
      unsuccessfulAllocations: 20,
      droppedPackets: 55,
      capacity: 63
    }
  ]
}
const detailResult = {
  id: 1,
  name: 'test',
  dhcpPools: [1,2,3,4],
  tags: [],
  createType: ServiceTechnology.WIFI,
  dhcpConfig: DHCPConfigTypeEnum.SIMPLE,
  venues: []
}


describe('DHCP Detail Page', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1',
      serviceId: '373377b0cb6e46ea8982b1c80aabe1fa'
    }
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDHCPVenueInstances.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        CommonUrlsInfo.getDHCProfileDetail.url,
        (req, res, ctx) => res(ctx.json(detailResult))
      )
    )
  })

  it('should render detail page', async () => {

    render(
      <Provider>
        <DHCPServiceDetail />
      </Provider>, {
        route: { params, path: '/:tenantId/services/dhcp/:serviceId/detail' }
      })


    expect(await screen.findByText((`Instances (${list.data.length})`))).toBeInTheDocument()
    expect(await screen.findByText(('Number of Pools'))).toBeInTheDocument()
  })

})
