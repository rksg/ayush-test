import { rest } from 'msw'

import {
  CommonUrlsInfo,
  getPolicyRoutePath, NewTablePageable,
  NewTableResult,
  Persona,
  PersonaGroup,
  PersonaUrls,
  PolicyOperation,
  PolicyType, PropertyUnit, PropertyUrlsInfo, TableResult, Venue
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { ConnectionMeteringInstanceTable } from './ConnectionMeteringInstanceTable'

const mockPersonas: Persona[] = [
  {
    id: 'persona-id-1',
    name: 'persona-name-1',
    groupId: 'persona-group-id',
    identityId: 'unit-id-1'
  },
  {
    id: 'persona-id-2',
    name: 'persona-name-2',
    groupId: 'persona-group-id',
    identityId: 'unit-id-1'
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

  it('should render the connection metering instance table view', async () => {
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
  })
})
