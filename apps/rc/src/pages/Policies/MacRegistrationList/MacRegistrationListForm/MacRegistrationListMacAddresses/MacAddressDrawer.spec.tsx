import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MacRegListUrlsInfo }                                    from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { MacAddressDrawer } from './MacAddressDrawer'

const macAddress = {
  id: '7d3a416c-6e73-4dde-8242-299649a16a9c',
  expirationDate: '2065-12-08T18:40:01Z',
  revoked: false,
  macAddress: '3A-B8-A9-29-35-D5',
  username: 'ex proident',
  email: 'test@commscope.com',
  createdDate: '2065-12-08T18:40:01Z'
}

const list = {
  content: [
    {
      id: '6177e8a5-9cb4-40c6-bed4-74e9d104dfd8',
      expirationDate: '2065-12-08T18:40:01Z',
      revoked: false,
      macAddress: '11-22-33-44-55-66',
      username: 'testUser',
      email: 'testUser@commscope.com',
      createdDate: '2065-12-08T18:40:01Z'
    },
    {
      id: '7d3a416c-6e73-4dde-8242-299649a16a9c',
      revoked: true,
      macAddress: '3A-B8-A9-29-35-D5',
      username: 'ex proident',
      email: 'dolore pariatur adipisicing esse Excepteur',
      createdDate: '2065-12-08T18:40:01Z'
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

describe('MacAddressDrawer', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrations.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        MacRegListUrlsInfo.addMacRegistration.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.patch(
        MacRegListUrlsInfo.updateMacRegistration.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should submit the drawer successfully', async () => {
    render(
      <Provider>
        <MacAddressDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={false}
          editData={undefined}
        />
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3'
        }, path: '/:tenantId/:policyId' }
      }
    )
    let saveButton = screen.getByText('Add')
    expect(saveButton).toBeInTheDocument()
    let cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: 'Never expires (Same as list)' }))
    // eslint-disable-next-line max-len
    await userEvent.type(await screen.findByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:77')
    await userEvent.click(saveButton)
  })

  it('should cancel the drawer successfully', async () => {
    render(
      <Provider>
        <MacAddressDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={false}
          editData={undefined}
        />
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3'
        }, path: '/:tenantId/:policyId' }
      }
    )
    const saveButton = screen.getByText('Add')
    expect(saveButton).toBeInTheDocument()
    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
    await userEvent.click(cancelButton)
  })

  it('should render table with the giving data', async () => {
    render(
      <Provider>
        <MacAddressDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={true}
          editData={macAddress}
        />
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3'
        }, path: '/:tenantId/:policyId' }
      }
    )
    let saveButton = screen.getByText('Done')
    expect(saveButton).toBeInTheDocument()
    let cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()

    const macInput = await screen.findByRole('textbox', { name: 'MAC Address' })
    expect(macInput).toHaveValue(macAddress.macAddress)
    expect(macInput).toBeDisabled()

    const usernameInput = await screen.findByRole('textbox', { name: 'Username' })
    expect(usernameInput).toHaveValue(macAddress.username)

    const emailInput = await screen.findByRole('textbox', { name: 'E-mail' })
    expect(emailInput).toHaveValue(macAddress.email)

    await userEvent.click(saveButton)

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  })
})
