import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  getPolicyDetailsLink,
  MacRegistrationDetailsTabKey,
  MacRegListUrlsInfo, PolicyOperation, PolicyType
} from '@acx-ui/rc/utils'
import { Provider }                                                                          from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

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

const macReg = {
  id: '61551109-c54d-4516-bc2a-42e9716b00d9',
  name: '12836-mac-pool',
  autoCleanup: true,
  expirationType: 'SPECIFIED_DATE',
  expirationOffset: 2,
  expirationDate: '2023-08-25T15:59:59Z',
  priority: 0,
  enabled: true,
  expirationEnabled: true,
  registrationCount: 1,
  defaultAccess: 'REJECT',
  createdDate: '2023-02-23T03:10:38Z',
  policySetId: 'a3a8449e-a649-4bf4-8798-d772ee1dbd5f',
  associationIds: ['9bfdd123-1851-44f1-8b66-b97aed28ec3f'],
  networkIds: []
}

describe.skip('MacRegistrationsTab', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    policyId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3'
  }

  const tablePath = '/:tenantId/t/' + getPolicyDetailsLink({
    type: PolicyType.MAC_REGISTRATION_LIST,
    oper: PolicyOperation.DETAIL,
    policyId: '/:policyId',
    activeTab: MacRegistrationDetailsTabKey.MAC_REGISTRATIONS })

  beforeEach(() => {
    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrations.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        MacRegListUrlsInfo.searchMacRegistrations.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(macReg))
      )
    )
  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.patch(
        MacRegListUrlsInfo.updateMacRegistration.url.split('?')[0],
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(<Provider><MacRegistrationsTab /></Provider>, {
      route: { params, path: tablePath }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row1 = await screen.findByRole('row', { name: /11-22-33-44-55-66/i })
    expect(row1).toHaveTextContent('Active')
    expect(row1).toHaveTextContent('testUser')
    expect(row1).toHaveTextContent('testUser@commscope.com')
    expect(row1).toHaveTextContent('12/08/2065')
    expect(row1).toHaveTextContent('12/08/2021')

    const row2 = await screen.findByRole('row', { name: /3A-B8-A9-29-35-D5/i })
    expect(row2).toHaveTextContent('Revoked')
    expect(row2).toHaveTextContent('ex proident')
    expect(row2).toHaveTextContent('dolore pariatur adipisicing esse Excepteur')
    expect(row2).toHaveTextContent('12/08/2065')
    expect(row2).toHaveTextContent('12/08/2021')

    fireEvent.click(within(row1).getByRole('checkbox'))
    fireEvent.click(await screen.findByRole('button', { name: 'Revoke' }))
    fireEvent.click(await screen.findByRole('button', { name: /clear selection/i }))

    fireEvent.click(within(row2).getByRole('checkbox'))
    fireEvent.click(await screen.findByRole('button', { name: /unrevoke/i }))
    fireEvent.click(await screen.findByRole('button', { name: /clear selection/i }))

    fireEvent.click(within(row2).getByRole('checkbox'))
    fireEvent.click(await screen.findByRole('button', { name: /edit/i }))

    fireEvent.click(await screen.findByRole('button', { name: /add mac address/i }))
  })

  it('should delete address correctly', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        MacRegListUrlsInfo.deleteMacRegistrations.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><MacRegistrationsTab /></Provider>, {
      route: { params, path: tablePath }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /3A-B8-A9-29-35-D5/ })

    fireEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: /delete/i }))
    await screen.findByText('Delete "3A-B8-A9-29-35-D5"?')
    fireEvent.click(screen.getByText('Delete MAC Address'))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should bulk delete address correctly', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        MacRegListUrlsInfo.deleteMacRegistrations.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><MacRegistrationsTab /></Provider>, {
      route: { params, path: tablePath }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line max-len
    fireEvent.click(within(await screen.findByRole('row', { name: /3A-B8-A9-29-35-D5/i })).getByRole('checkbox'))
    // eslint-disable-next-line max-len
    fireEvent.click(within(await screen.findByRole('row', { name: /11-22-33-44-55-66/i })).getByRole('checkbox'))

    await userEvent.click(await screen.findByRole('button', { name: /delete/i }))
    await screen.findByText('Delete "2 MAC Address"?')
    fireEvent.click(screen.getByText('Delete MAC Address'))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should delete address and show error correctly', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        MacRegListUrlsInfo.deleteMacRegistrations.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.status(500), ctx.json({ }))
        })
    )

    render(<Provider><MacRegistrationsTab /></Provider>, {
      route: { params, path: tablePath }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /3A-B8-A9-29-35-D5/ })

    fireEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: /delete/i }))
    await screen.findByText('Delete "3A-B8-A9-29-35-D5"?')
    fireEvent.click(screen.getByText('Delete MAC Address'))
    // await new Promise((r)=>{setTimeout(r, 1000)})
    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should show "Import from file" correctly', async () => {
    mockServer.use(
      rest.post(
        MacRegListUrlsInfo.uploadMacRegistration.url,
        (req, res, ctx) => res(ctx.status(201), ctx.json({}))
      )
    )

    render(<Provider><MacRegistrationsTab /></Provider>, {
      route: { params, path: tablePath }
    })
    fireEvent.click(await screen.findByRole('button', { name: /import from file/i }))

    const dialog = await screen.findByRole('dialog')
    const csvFile = new File([''], 'mac_registration_import_template.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    fireEvent.click(await within(dialog).findByRole('button', { name: 'Import' }))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  })

  it('should show error toast when "Import from file"', async () => {
    const error = {
      status: 'BAD_REQUEST',
      timestamp: '2023-02-14 07:47:47',
      message: 'Validation error',
      subErrors: [
        {
          object: 'Registration',
          field: 'macAddress',
          rejectedValue: 'FF-7D-A2-5B-6A-AD',
          // eslint-disable-next-line max-len
          message: 'FF-7D-A2-5B-6A-AD already exists in pool (29fe1d03-1bf2-4d5b-bd17-07f362feeab8). In row: 0'
        }
      ]
    }

    mockServer.use(
      rest.post(
        MacRegListUrlsInfo.uploadMacRegistration.url,
        (req, res, ctx) => res(ctx.status(500), ctx.json(error))
      )
    )

    render(<Provider><MacRegistrationsTab /></Provider>, {
      route: { params, path: tablePath }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByRole('button', { name: /import from file/i }))

    const dialog = await screen.findByRole('dialog')
    const csvFile = new File([''], 'mac_registration_import_template.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    fireEvent.click(await within(dialog).findByRole('button', { name: 'Import' }))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  })
})
