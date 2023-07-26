import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                                                                                                                     from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, ConnectionMetering, ConnectionMeteringUrls, NewTablePageable, NewTableResult, BillingCycleType, PropertyUrlsInfo, PropertyConfigs, PropertyConfigStatus, Persona } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                                                         from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved, within }                                                                                                from '@acx-ui/test-utils'

import ConnectionMeteringTable from './index'

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

const connectionMeterings = [{
  id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
  name: 'profile1',
  uploadRate: 12,
  downloadRate: 5,
  dataCapacity: 100,
  dataCapacityEnforced: true,
  dataCapacityThreshold: 10,
  billingCycleRepeat: false,
  billingCycleType: 'CYCLE_UNSPECIFIED' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 1,
  unitCount: 2,
  personas: [{
    name: 'unit-persona1',
    identityId: 'identityId',
    primary: true,
    groupId: 'groupId'
  }, {
    name: 'unit-persona2',
    identityId: 'identityId2',
    primary: true,
    groupId: 'groupId'
  }] as Persona[]
}, {
  id: 'efce7414-1c78-4312-ad5b-ae03f28dbc68',
  name: 'profile2',
  uploadRate: 0,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: false,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_MONTHLY' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 0,
  unitCount: 0
},
{
  id: 'afce7414-1c78-4312-ad5b-ae03f28dbc6c',
  name: 'profile3',
  uploadRate: 0,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: true,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_WEEKLY' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 0,
  unitCount: 0
},
{
  id: 'bfde7414-1c78-4312-ad5b-ae03f18dbc68',
  name: 'profile4',
  uploadRate: 10,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: false,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_NUMS_DAY' as BillingCycleType,
  billingCycleDays: 3,
  venueCount: 1,
  unitCount: 1,
  personas: [{
    name: 'unit-persona3',
    identityId: 'identityId3',
    primary: true,
    groupId: 'groupId'
  }] as Persona[]
}
]

const list : NewTableResult<ConnectionMetering> = {
  content: connectionMeterings,
  pageable: defaultPageable,
  totalPages: 1,
  totalElements: 4,
  sort: defaultPageable.sort
}

const venues = [{
  id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
  name: 'venue1',
  country: 'US'
}]

const propertyConfigs: PropertyConfigs[] = [{
  status: PropertyConfigStatus.ENABLED,
  personaGroupId: 'groupId',
  venueName: 'venue1'
}]

const paginationPattern = '?size=:pageSize&page=:page&sort=:sort'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')

describe.skip('ConnectionMeteringTable', () => {
  const searchConnectionMeteringApi = jest.fn()
  const deleteFn = jest.fn()
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        replacePagination(ConnectionMeteringUrls.searchConnectionMeteringList.url),
        (req, res, ctx) => {
          searchConnectionMeteringApi()
          return res(ctx.json(list))
        }
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({ data: venues }))
      ),
      rest.delete(
        ConnectionMeteringUrls.deleteConnectionMetering.url,
        (req, res, ctx) => {
          deleteFn()
          return res(ctx.json({}))
        }
      ),
      rest.post(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => {
          return res(ctx.json({ data: propertyConfigs }))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><ConnectionMeteringTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // // assert link in Table view
    await screen.findByRole('link', { name: connectionMeterings[0].name })
    await screen.findByRole('link', { name: connectionMeterings[1].name })

    // // change search bar and trigger re-fetching mechanism
    const searchBar = await screen.findByRole('textbox')
    await userEvent.type(searchBar, 'search text')

    // // first: table query + second: search bar changed query
    await waitFor(() => expect(searchConnectionMeteringApi).toHaveBeenCalledTimes(2))
  })

  it('should add connection profile', async () => {
    render(<Provider><ConnectionMeteringTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const addButton = await screen.findByRole('button', { name: 'Add Data Usage Metering Profile' })
    fireEvent.click(addButton)
  })

  it('should delete selected row', async () => {
    render(<Provider><ConnectionMeteringTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /profile2/i })
    fireEvent.click(within(row).getByRole('radio'))

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))

    await screen.findByText('Delete "profile2"?')

    const deleteButton = await screen.findByText('Delete Profile')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should show error when tring to delete in used profile', async () => {
    render(<Provider><ConnectionMeteringTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /profile1/i })
    fireEvent.click(within(row).getByRole('radio'))

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))

    await screen.findByText(/You are unable to delete .*/)

    const okButton = screen.getByRole('button', { name: /OK/i })
    fireEvent.click(okButton)
  })

  it('should edit selected row', async () => {
    render(<Provider><ConnectionMeteringTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /profile1/ })
    fireEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)
  })
})
