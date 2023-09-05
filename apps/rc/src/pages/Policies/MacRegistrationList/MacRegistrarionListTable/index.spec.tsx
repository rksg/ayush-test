import { rest } from 'msw'

import { useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, ExpirationType, MacRegListUrlsInfo, RulesManagementUrlsInfo }       from '@acx-ui/rc/utils'
import { Provider }                                                                          from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import MacRegistrationListsTable from './index'

const networkList = {
  fields: ['venues', 'id', 'venues.id'],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'a22e0192e090459ab04cdc161bf6285f',
      venues: {
        count: 2,
        names: ['My-Venue', 'My-V2']
      }
    }
  ]
}


const policySet = {
  id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
  name: 'testPolicySet1',
  description: 'for test'
}

const list = {
  content: [
    {
      id: 'efce7414-1c78-4312-ad5b-ae03f28dbc68',
      name: 'Registration pool-1',
      autoCleanup: true,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 5,
      policySetId: policySet.id,
      associationIds: [],
      networkIds: ['a22e0192e090459ab04cdc161bf6285f']
    },
    {
      id: 'efce7414-1c78-4312-ad5b-ae03f28dbc67',
      name: 'Registration pool-2',
      autoCleanup: true,
      enabled: true,
      expirationEnabled: true,
      expirationDate: '2022-11-02T06:59:59Z',
      registrationCount: 6,
      expirationType: ExpirationType.SPECIFIED_DATE
    },
    {
      id: 'efce7414-1c78-4312-ad5b-ae03f28dbc69',
      name: 'Registration pool-3',
      description: '',
      autoCleanup: true,
      enabled: true,
      expirationEnabled: true,
      expirationType: ExpirationType.DAYS_AFTER_TIME,
      expirationOffset: 5,
      registrationCount: 6
    }
  ],
  pageable: {
    sort: { unsorted: true, sorted: false, empty: true },
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 3,
  last: true,
  sort: { unsorted: true, sorted: false, empty: true },
  numberOfElements: 3,
  first: true,
  size: 10,
  number: 0,
  empty: false
}

describe.skip('MacRegistrationListsTable', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySet.url,
        (req, res, ctx) => res(ctx.json(policySet))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(networkList))
      ),
      rest.post(
        MacRegListUrlsInfo.searchMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(list))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><MacRegistrationListsTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row1 = await screen.findByRole('row', { name: /Registration pool-1/ })
    expect(row1).toHaveTextContent('5')

    const row = await screen.findByRole('row', { name: /registration pool-1/i })
    fireEvent.click(within(row).getByRole('radio'))
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><MacRegistrationListsTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        MacRegListUrlsInfo.deleteMacRegistrationPool.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><MacRegistrationListsTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        policyId: '79c439e1e5474f68acc9da38fa08a37b'
      }, path: '/:tenantId/t/:policyId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /Registration pool-2/i })
    fireEvent.click(within(row).getByRole('radio'))

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    await screen.findByText('Delete "Registration pool-2"?')

    const deleteListButton = screen.getByRole('button', { name: 'Delete List' })
    await waitFor(() => expect(deleteListButton).toBeEnabled())
    fireEvent.click(deleteListButton)

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should edit selected row', async () => {
    render(<Provider><MacRegistrationListsTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /Registration pool-1/ })
    fireEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)
  })

})
