import { rest } from 'msw'

import {
  CommonUrlsInfo,
  ConnectionMeteringUrls,
  getPolicyRoutePath, NewTablePageable,
  NewTableResult,
  Persona,
  PersonaGroup,
  PersonaUrls,
  PolicyOperation,
  PolicyType, PropertyUnit, PropertyUrlsInfo, QosStats, TableResult, Venue
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { ConnectionMeteringInstanceTable } from './ConnectionMeteringInstanceTable'

const mockPersonas: Persona[] = [
  {
    id: 'persona-id-1',
    name: 'persona-name-1',
    groupId: 'persona-group-id',
    identityId: 'unit-id-1',
    revoked: false
  },
  {
    id: 'persona-id-2',
    name: 'persona-name-2',
    groupId: 'persona-group-id',
    identityId: 'unit-id-1',
    revoked: false
  }
]

const mockQosStats: QosStats[] = [
  {
    personaId: 'persona-id-1',
    vni: 1,
    nsgId: 'nsgId',
    uploadPackets: 100,
    downloadPackets: 20,
    uploadBytes: 200,
    downloadBytes: 1000
  },
  {
    personaId: 'persona-id-2',
    vni: 1,
    nsgId: 'nsgId',
    uploadPackets: 200,
    downloadPackets: 10,
    uploadBytes: 200,
    downloadBytes: 10
  }
]

const defaultPageable: NewTablePageable = {
  offset: 0,
  pageNumber: 0,
  pageSize: 10,
  paged: true,
  sort: {
    unsorted: true,
    sorted: false,
    empty: false
  },
  unpaged: false
}

const mockPersonaGroupList: NewTableResult<PersonaGroup> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  content: [
    {
      id: 'persona-group-id',
      name: 'persona-group-name',
      propertyId: 'venue-id-1'
    }
  ]
}

const mockVenueList: TableResult<Pick<Venue, 'id' | 'name'>> = {
  page: 1,
  totalCount: 1,
  data: [
    {
      id: 'venue-id-1',
      name: 'venue-name-1'
    }
  ]
}

const mockPropertyUnit: Pick<PropertyUnit, 'id' | 'name'> = {
  id: 'unit-id-1',
  name: 'unit-name-1'
}



describe('ConnectionMeteringInstanceTable', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    policyId: '4b76b1952c80401b8500b00d68106576'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.DETAIL })

  it('should render the data usage metering instance table view', async () => {
    mockServer.use(
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.replace('?size=:pageSize&page=:page&sort=:sort', ''),
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueList))
      ),
      rest.get(
        PropertyUrlsInfo.getUnitById.url,
        (req, res, ctx) => res(ctx.json(mockPropertyUnit))
      ),
      rest.post(
        ConnectionMeteringUrls.getQosStats.url,
        (req, res, ctx) => res(ctx.json({ data: mockQosStats }))
      )
    )

    render(
      <Provider>
        <ConnectionMeteringInstanceTable data={mockPersonas}/>
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    await screen.findByText(/Instances/i)
    await screen.findByRole('link', { name: /unit-name-1/i })
    await screen.findByText('Up Packets')
    await screen.findByText('Down Packets')
    await screen.findByText('Up Bytes')
    await screen.findByText('Down Bytes')
    await screen.findByText('Total Bytes')
    await screen.findByRole('row', { name: /unit-name-1/ })
  })
})
