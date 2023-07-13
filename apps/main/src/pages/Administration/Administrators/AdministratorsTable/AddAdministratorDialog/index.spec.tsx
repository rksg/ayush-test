/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo, AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import AddAdministratorDialog from './'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
const mockedMSPCustomers = {
  fields: ['name','id'],
  totalCount: 2,
  page: 1,
  data: [{
    id: '2242a683a7594d7896385cfef1fe1234',
    name: 'Customer1',
    entitlements: [
      {
        expirationDateTs: '1680134399000',
        consumed: '0',
        quantity: '1',
        entitlementDeviceType: 'DVCNWTYPE_SWITCH',
        tenantId: '2242a683a7594d7896385cfef1fe1234',
        type: 'entitlement',
        expirationDate: '2023-03-29T23:59:59Z',
        entitlementDeviceSubType: 'ICX71',
        toBeRemovedQuantity: 0
      },
      { expirationDateTs: '1680134399000',consumed: '2',quantity: '2',entitlementDeviceType: 'DVCNWTYPE_WIFI',
        tenantId: '2242a683a7594d7896385cfef1fe1234',type: 'entitlement',expirationDate: '2023-03-29T23:59:59Z',toBeRemovedQuantity: 2 }
    ],
    wifiLicenses: 2,
    switchLicenses: 1
  },
  { id: '350f3089a8e34509a2913c550faf1234',
    name: 'Customer2',
    entitlements: [
      { expirationDateTs: '1680134399000',consumed: '0',quantity: '2',entitlementDeviceType: 'DVCNWTYPE_WIFI',tenantId: '350f3089a8e34509a2913c550faf1234',type: 'entitlement',expirationDate: '2023-03-29T23:59:59Z',toBeRemovedQuantity: 0 },
      { expirationDateTs: '1680134399000',consumed: '0',quantity: '2',entitlementDeviceType: 'DVCNWTYPE_SWITCH',tenantId: '350f3089a8e34509a2913c550faf1234',type: 'entitlement',expirationDate: '2023-03-29T23:59:59Z',entitlementDeviceSubType: 'ICX71',toBeRemovedQuantity: 0 }
    ],
    wifiLicenses: 2,
    switchLicenses: 2
  }]
}

const mockedRegisteredUsers = [{
  externalId: '0032h00000LUqco111',
  email: 'a123@email.com'
},{
  externalId: '0032h00000LUqco222',
  email: 'b123@email.com'
}]

const mockedCloseDialog = jest.fn()
const mockedAddAdminFn = jest.fn()
describe('Add administrator dialog component', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(mockedMSPCustomers))
      ),
      rest.get(
        AdministrationUrlsInfo.getRegisteredUsersList.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        AdministrationUrlsInfo.addAdmin.url,
        (req, res, ctx) => {
          mockedAddAdminFn(req.body)
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should MSP submit correctly', async () => {
    render(
      <Provider>
        <AddAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          isMspEc={false}
          isOnboardedMsp={true}
          currentUserDetailLevel='debug'
        />
      </Provider>, {
        route: { params }
      })

    const radio = await screen.findByRole('radio', { name: /Invite new user/i })
    await userEvent.click(radio)

    const selector = await screen.findAllByRole('combobox')
    const mailSelector = selector.filter(o => o.id === 'email')[0]
    expect(mailSelector).toBeDisabled()

    const emailInput = await screen.findByPlaceholderText('Enter email address')
    await userEvent.type(emailInput, 'c123@email.com')

    await userEvent.click(await screen.findByRole('combobox', { name: 'Role' }))
    await userEvent.click(await screen.findByText('Administrator'))
    await userEvent.click(await screen.findByText('Send Invitation'))
    await waitFor(() => {
      expect(mockedAddAdminFn).toBeCalledWith({
        email: 'c123@email.com',
        role: 'ADMIN',
        detailLevel: 'debug',
        delegateToAllECs: false
      })
    })
  })

  it('should MSP submit with none customer correctly', async () => {
    render(
      <Provider>
        <AddAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          isMspEc={false}
          isOnboardedMsp={true}
          currentUserDetailLevel='debug'
        />
      </Provider>, {
        route: { params }
      })

    const radio = await screen.findByRole('radio', { name: /Invite new user/i })
    await userEvent.click(radio)

    const selector = await screen.findAllByRole('combobox')
    const mailSelector = selector.filter(o => o.id === 'email')[0]
    expect(mailSelector).toBeDisabled()
    const emailInput = await screen.findByPlaceholderText('Enter email address')
    await userEvent.type(emailInput, 'c123@email.com')
    await userEvent.click(await screen.findByRole('combobox', { name: 'Role' }))
    await userEvent.click(await screen.findByText( 'Administrator' ))
    await userEvent.click(await screen.findByRole('radio', { name: 'None' }))
    await userEvent.click(await screen.findByText('Send Invitation'))
    await waitFor(() => {
      expect(mockedAddAdminFn).toBeCalledWith({
        email: 'c123@email.com',
        role: 'ADMIN',
        detailLevel: 'debug',
        delegateToAllECs: false
      })
    })
  })

  it('should MSP submit with specific customer correctly', async () => {
    render(
      <Provider>
        <AddAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          isMspEc={false}
          isOnboardedMsp={true}
          currentUserDetailLevel='debug'
        />
      </Provider>, {
        route: { params }
      })

    const radio = await screen.findByRole('radio', { name: /Invite new user/i })
    await userEvent.click(radio)

    const selector = await screen.findAllByRole('combobox')
    const mailSelector = selector.filter(o => o.id === 'email')[0]
    expect(mailSelector).toBeDisabled()
    const emailInput = await screen.findByPlaceholderText('Enter email address')
    await userEvent.type(emailInput, 'c123@email.com')
    await userEvent.click(await screen.findByRole('combobox', { name: 'Role' }))
    await userEvent.click(await screen.findByText( 'Administrator' ))
    await userEvent.click(await screen.findByRole('radio', { name: 'Specific Customers' }))
    await userEvent.click((await screen.findAllByRole('combobox')).filter(p => p.id === 'delegatedEcs')[0])
    await userEvent.click(await screen.findByText( 'Customer1' ))
    await userEvent.click(await screen.findByText('Send Invitation'))
    await waitFor(() => {
      expect(mockedAddAdminFn).toBeCalledWith({
        email: 'c123@email.com',
        role: 'ADMIN',
        detailLevel: 'debug',
        delegateToAllECs: false,
        delegatedECs: ['2242a683a7594d7896385cfef1fe1234']
      })
    })
  })

  it('should non MSP EC and non MSP submit correctly', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getRegisteredUsersList.url,
        (req, res, ctx) => res(ctx.json(mockedRegisteredUsers))
      )
    )

    render(
      <Provider>
        <AddAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          isMspEc={false}
          isOnboardedMsp={false}
          currentUserDetailLevel='debug'
        />
      </Provider>, {
        route: { params }
      })

    const radio = await screen.findByRole('radio', { name: /Registered user/i })
    await userEvent.click(radio)

    const selector = await screen.findAllByRole('combobox')
    const mailSelector = selector.filter(o => o.id === 'email')[0]
    await userEvent.click(mailSelector)
    const opts = await screen.findAllByText('b123@email.com')
    const target = opts.filter(o => o.className.includes('ant-select-item-option-content'))
    expect(target.length).toBe(1)
    await userEvent.click(target[0])

    await userEvent.click(await screen.findByRole('combobox', { name: 'Role' }))
    await userEvent.click(await screen.findByText( 'Prime Admin' ))
    await userEvent.click(await screen.findByText('Send Invitation'))
    await waitFor(() => {
      expect(mockedAddAdminFn).toBeCalledWith({
        email: 'b123@email.com',
        externalId: '0032h00000LUqco222',
        role: 'PRIME_ADMIN',
        detailLevel: 'debug'
      })
    })
  })

  it('should check with local data correctly', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getRegisteredUsersList.url,
        (req, res, ctx) => res(ctx.json(mockedRegisteredUsers))
      )
    )

    render(
      <Provider>
        <AddAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          isMspEc={false}
          isOnboardedMsp={false}
          currentUserDetailLevel='debug'
        />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(await screen.findByRole('radio', { name: /Registered user/i }))
    await userEvent.click(await screen.findByRole('radio', { name: /Invite new user/i }))
    const emailInput = await screen.findByPlaceholderText('Enter email address')
    await userEvent.type(emailInput, 'b123@email.com')
    await userEvent.click(await screen.findByRole('combobox', { name: 'Role' }))
    await userEvent.click(await screen.findByText( 'Prime Admin' ))
    await userEvent.click(await screen.findByText('Send Invitation'))
    await waitFor(async () => {
      expect(await screen.findByText(/The email address belongs to a registered user in this account./i)).toBeVisible()
    })
  })


  it('should not MSP EC user be able to create by registered user', async () => {
    render(
      <Provider>
        <AddAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          isMspEc={true}
          isOnboardedMsp={false}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('radio', { name: /Invite new user/i })
    const radioRegisteredUser = screen.queryByRole('radio', { name: /Registered user/i })
    expect(radioRegisteredUser).not.toBeInTheDocument()
  })

  it('should correctly display MSP EC admin invited error message', async () => {
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addAdmin.url,
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({
            errors: [{
              code: 'TNT-10300',
              message: 'Error'
            }],
            requestId: '123456'
          }))
        }
      )
    )
    render(
      <Provider>
        <AddAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          isMspEc={true}
          isOnboardedMsp={false}
        />
      </Provider>, {
        route: { params }
      })


    const emailInput = await screen.findByPlaceholderText('Enter email address')
    await userEvent.type(emailInput, 'c123@email.com')

    await userEvent.click(await screen.findByRole('combobox', { name: 'Role' }))
    await userEvent.click(await screen.findByText( 'Administrator' ))
    await userEvent.click(await screen.findByText('Send Invitation'))
    await waitFor(async () => {
      expect(await screen.findByText('The email address belongs to a user of another Cloud Portal account.')).toBeVisible()
    })
  })

  it('should correctly display admin invited error message', async () => {
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addAdmin.url,
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({
            errors: [{
              code: 'TNT-10300',
              message: 'Error'
            }],
            requestId: '123456'
          }))
        }
      )
    )
    render(
      <Provider>
        <AddAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          isMspEc={false}
          isOnboardedMsp={false}
        />
      </Provider>, {
        route: { params }
      })


    const emailInput = await screen.findByPlaceholderText('Enter email address')
    await userEvent.type(emailInput, 'c123@email.com')

    await userEvent.click(await screen.findByRole('combobox', { name: 'Role' }))
    await userEvent.click(await screen.findByText( 'Administrator' ))
    await userEvent.click(await screen.findByText('Send Invitation'))
    await waitFor(async () => {
      expect(await screen.findByText(/The email address belongs to a user of another RUCKUS One tenant./i)).toBeVisible()
    })
  })

  it('should correctly display admin existing error message', async () => {
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addAdmin.url,
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({
            errors: [{
              code: 'TNT-10000',
              message: 'Error'
            }],
            requestId: '123456'
          }))
        }
      )
    )
    render(
      <Provider>
        <AddAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          isMspEc={true}
          isOnboardedMsp={false}
        />
      </Provider>, {
        route: { params }
      })


    const emailInput = await screen.findByPlaceholderText('Enter email address')
    await userEvent.type(emailInput, 'c123@email.com')

    await userEvent.click(await screen.findByRole('combobox', { name: 'Role' }))
    await userEvent.click(await screen.findByText( 'Administrator' ))
    await userEvent.click(await screen.findByText('Send Invitation'))
    await waitFor(async () => {
      expect(await screen.findByText('The email address belongs to an administrator that already exists.')).toBeVisible()
    })
  })

  it('should correctly display other error message', async () => {
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addAdmin.url,
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({
            errors: [{
              code: '1111',
              message: 'Error'
            }],
            requestId: '123456'
          }))
        }
      )
    )
    render(
      <Provider>
        <AddAdministratorDialog
          visible={true}
          setVisible={mockedCloseDialog}
          isMspEc={true}
          isOnboardedMsp={false}
        />
      </Provider>, {
        route: { params }
      })

    const emailInput = await screen.findByPlaceholderText('Enter email address')
    await userEvent.type(emailInput, 'c123@email.com')
    await userEvent.click(await screen.findByRole('combobox', { name: 'Role' }))
    await userEvent.click(await screen.findByText( 'Administrator' ))
    await userEvent.click(await screen.findByText('Send Invitation'))
    // TODO
    // await waitFor(async () => {
    //   expect(await screen.findByText('Server Error')).toBeVisible()
    // })
  })
})
