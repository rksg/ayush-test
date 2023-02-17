import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MacRegListUrlsInfo }                                                       from '@acx-ui/rc/utils'
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
      createdDate: '2021-12-08T18:40:01Z'
    },
    {
      id: '7d3a416c-6e73-4dde-8242-299649a16a9c',
      revoked: true,
      macAddress: '3A-B8-A9-29-35-D5',
      username: 'ex proident',
      email: 'dolore pariatur adipisicing esse Excepteur',
      createdDate: '2021-12-08T18:40:01Z',
      expirationDate: '2065-12-08T18:40:01Z'
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

  beforeEach(() => {
    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrations.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><MacRegistrationsTab /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        policyId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3',
        activeTab: 'macRegistrations',
        pageSize: '10',
        page: '1',
        sort: 'macAddress'
      }, path: '/:tenantId/:policyId/:activeTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row1 = await screen.findByRole('row', { name: /11-22-33-44-55-66/ })
    expect(row1).toHaveTextContent('Active')
    expect(row1).toHaveTextContent('testUser')
    expect(row1).toHaveTextContent('testUser@commscope.com')
    expect(row1).toHaveTextContent('12/08/2065')
    expect(row1).toHaveTextContent('12/08/2021')

    const row2 = await screen.findByRole('row', { name: /3A-B8-A9-29-35-D5/ })
    expect(row2).toHaveTextContent('Revoked')
    expect(row2).toHaveTextContent('ex proident')
    expect(row2).toHaveTextContent('dolore pariatur adipisicing esse Excepteur')
    expect(row2).toHaveTextContent('12/08/2065')
    expect(row2).toHaveTextContent('12/08/2021')

    fireEvent.click(within(row1).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: /delete/i }))
    await screen.findByText('Delete "11-22-33-44-55-66"?')
    fireEvent.click(screen.getByText('Delete MAC Address'))

    fireEvent.click(within(row2).getByRole('radio'))
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))

    fireEvent.click(within(row2).getByRole('radio'))
    fireEvent.click(screen.getByRole('button', { name: /unrevoke/i }))

    fireEvent.click(within(row2).getByRole('radio'))
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }))

    fireEvent.click(within(row2).getByRole('radio'))
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))

    fireEvent.click(await screen.findByRole('button', { name: /add mac address/i }))
  })

  it('should show "Import from file" correctly', async () => {
    mockServer.use(
      rest.post(
        MacRegListUrlsInfo.uploadMacRegistration.url,
        (req, res, ctx) => res(ctx.status(201), ctx.json({}))
      )
    )

    render(<Provider><MacRegistrationsTab /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        policyId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3',
        activeTab: 'macRegistrations'
      }, path: '/:tenantId/:policyId/:activeTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // const importBtn = await screen.findByRole('button', { name: 'Import From File' })
    fireEvent.click(await screen.findByRole('button', { name: /import from file/i }))
    //
    // fireEvent.click(importBtn)
    const dialog = await screen.findByRole('dialog')
    const csvFile = new File([''], 'mac_registration_import_template.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    fireEvent.click(await within(dialog).findByRole('button', { name: 'Import' }))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  })
})
