import { rest } from 'msw'

import {  MacRegListUrlsInfo }                                                      from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { MacRegistrationsTab } from './index'

const list = {
  content: [
    {
      id: '6177e8a5-9cb4-40c6-bed4-74e9d104dfd8',
      expirationDate: '2065-12-08T18:40:01Z',
      revoked: false,
      macAddress: '11-22-33-44-55-66',
      username: 'testUser',
      email: 'testUser@commscope.com',
      location: 'ipsum eiusmod sunt veniam'
    },
    {
      id: '7d3a416c-6e73-4dde-8242-299649a16a9c',
      revoked: true,
      macAddress: '3A-B8-A9-29-35-D5',
      username: 'ex proident',
      email: 'dolore pariatur adipisicing esse Excepteur',
      location: 'ipsum eiusmod sunt veniam'
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
  totalElements: 2,
  last: true,
  sort: { unsorted: true, sorted: false, empty: true },
  numberOfElements: 2,
  first: true,
  size: 10,
  number: 0,
  empty: false
}

describe('MacRegistrationsTab', () => {
  mockServer.use(
    rest.get(
      MacRegListUrlsInfo.getMacRegistrations.url,
      (req, res, ctx) => res(ctx.json(list))
    )
  )

  it('should render correctly', async () => {
    render(<Provider><MacRegistrationsTab /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        macRegistrationListId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3',
        activeTab: 'mac_registrations'
      }, path: '/:tenantId/:macRegistrationListId/:activeTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row1 = await screen.findByRole('row', { name: /11-22-33-44-55-66/ })
    expect(row1).toHaveTextContent('Active')
    expect(row1).toHaveTextContent('testUser')
    expect(row1).toHaveTextContent('testUser@commscope.com')
    expect(row1).toHaveTextContent('12/08/2065 18:40 PM')

    const row2 = await screen.findByRole('row', { name: /3A-B8-A9-29-35-D5/ })
    expect(row2).toHaveTextContent('Revoked')
    expect(row2).toHaveTextContent('ex proident')
    expect(row2).toHaveTextContent('dolore pariatur adipisicing esse Excepteur')

    fireEvent.click(within(row1).getByRole('radio'))
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    fireEvent.click(within(row2).getByRole('radio'))
    const revokeButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(revokeButton)

    fireEvent.click(within(row2).getByRole('radio'))
    const unrevokeButton = screen.getByRole('button', { name: /unrevoke/i })
    fireEvent.click(unrevokeButton)

    fireEvent.click(within(row2).getByRole('radio'))
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    const addButton = await screen.findByRole('button', { name: /add mac address/i })
    fireEvent.click(addButton)
  })
})
