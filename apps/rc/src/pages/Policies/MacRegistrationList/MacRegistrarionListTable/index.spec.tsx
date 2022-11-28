import { rest } from 'msw'

import {  MacRegListUrlsInfo }                                                      from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import MacRegistrationListsTable from './index'


const list = {
  content: [
    {
      id: 'efce7414-1c78-4312-ad5b-ae03f28dbc68',
      name: 'Registration pool',
      description: '',
      autoCleanup: true,
      priority: 1,
      ssidRegex: 'cecil-mac-auth',
      enabled: true,
      expirationEnabled: false,
      registrationCount: 5
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
  totalElements: 1,
  last: true,
  sort: { unsorted: true, sorted: false, empty: true },
  numberOfElements: 1,
  first: true,
  size: 10,
  number: 0,
  empty: false
}

describe('MacRegistrationListsTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url,
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

    const row1 = await screen.findByRole('row', { name: /Registration pool/ })
    expect(row1).toHaveTextContent('5')

    const row = await screen.findByRole('row', { name: /registration pool/i })
    fireEvent.click(within(row).getByRole('radio'))
  })

  it('should delete selected row', async () => {
    render(<Provider><MacRegistrationListsTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /Registration pool/ })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "Registration pool"?')

    fireEvent.change(screen.getByRole('textbox', { name: /type the word "delete" to confirm:/i }),
      { target: { value: 'Delete' } })

    const deleteListsButton = await screen.findByText('Delete Lists')
    expect(deleteListsButton).toBeEnabled()
    fireEvent.click(deleteListsButton)
  }, 15000)

  it('should edit selected row', async () => {
    render(<Provider><MacRegistrationListsTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /Registration pool/ })
    fireEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)
  }, 15000)

})
