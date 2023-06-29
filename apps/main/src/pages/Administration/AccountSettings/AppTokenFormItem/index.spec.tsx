import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AdministrationUrlsInfo, ApplicationAuthenticationStatus, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { Provider }                                                                          from '@acx-ui/store'
import {
  render,
  screen,
  within,
  waitFor,
  mockServer
} from '@acx-ui/test-utils'
import { RolesEnum } from '@acx-ui/types'

import { AppTokenFormItem } from '.'

const tenantAuthenticationData = [
  {
    id: '1',
    name: 'test123',
    authenticationType: TenantAuthenticationType.ldap,
    clientID: '123',
    clientIDStatus: ApplicationAuthenticationStatus.ACTIVE,
    clientSecret: 'secret123',
    scopes: RolesEnum.PRIME_ADMIN
  },
  {
    id: '2',
    name: 'test456',
    authenticationType: TenantAuthenticationType.ldap,
    clientID: '456',
    clientIDStatus: ApplicationAuthenticationStatus.REVOKED,
    clientSecret: 'secret456'
  }
  ,
  {
    id: '3',
    name: 'test789',
    authenticationType: TenantAuthenticationType.ldap,
    clientIDStatus: ApplicationAuthenticationStatus.REVOKED
  }
]

const services = require('@acx-ui/rc/services')
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services')
}))

describe('App Token Form Item', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.spyOn(services, 'useDeleteTenantAuthenticationsMutation')
    mockServer.use(
      rest.delete(
        AdministrationUrlsInfo.deleteTenantAuthentications.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
    jest.spyOn(services, 'useUpdateTenantAuthenticationsMutation')
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.updateTenantAuthentications.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render layout', async () => {
    render(
      <Provider>
        <AppTokenFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Application Tokens')).toBeVisible()
    expect(screen.getByText('Add Token')).toBeVisible()
  })
  it('should show drawer when add token button clicked', async () => {
    render(
      <Provider>
        <AppTokenFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByText('Add Token'))
    expect(await screen.findByText('Add API Token')).toBeVisible()
  })
  it('should render table when data exists', async () => {
    render(
      <Provider>
        <AppTokenFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/accountSettings' }
      })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(tenantAuthenticationData.length)
    expect(screen.getByText('test123')).toBeVisible()
    expect(screen.getByText('ACTIVE')).toBeVisible()
    // TODO: update back to getByDisplayValue when URL value is implemented
    expect(screen.getAllByDisplayValue('123')[0]).toBeVisible()
    expect(screen.getByText('Prime Admin')).toBeVisible()
    expect(screen.getByText('test456')).toBeVisible()
    const revoked = screen.getAllByText('REVOKED')
    expect(revoked[0]).toBeVisible()
    expect(revoked[1]).toBeVisible()
    // TODO: update back to getByDisplayValue when URL value is implemented
    expect(screen.getAllByDisplayValue('456')[0]).toBeVisible()
  })
  it('copy buttons should work correctly', async () => {
    const writeText = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText
      }
    })
    render(
      <Provider>
        <AppTokenFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/accountSettings' }
      })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(tenantAuthenticationData.length)
    const buttons = screen.getAllByTestId('copy')
    expect(buttons).toHaveLength(tenantAuthenticationData.length * 3)
    await userEvent.click(buttons[0])
    expect(writeText).toHaveBeenLastCalledWith('123')
    await userEvent.click(buttons[1])
    expect(writeText).toHaveBeenLastCalledWith('secret123')
    await userEvent.click(buttons[2])
    expect(writeText).toHaveBeenLastCalledWith('')
    await userEvent.click(buttons[3])
    expect(writeText).toHaveBeenLastCalledWith('456')
    await userEvent.click(buttons[4])
    expect(writeText).toHaveBeenLastCalledWith('secret456')
    await userEvent.click(buttons[5])
    expect(writeText).toHaveBeenLastCalledWith('')
    await userEvent.click(buttons[6])
    expect(writeText).toHaveBeenLastCalledWith('')
    await userEvent.click(buttons[7])
    expect(writeText).toHaveBeenLastCalledWith('')
    await userEvent.click(buttons[8])
    expect(writeText).toHaveBeenLastCalledWith('')

  })
  it('should revoke active token correctly', async () => {
    render(
      <Provider>
        <AppTokenFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/accountSettings' }
      })

    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    const button = await screen.findByText('Revoke')
    expect(button).toBeVisible()
    await userEvent.click(button)
    expect(await screen.findByText('Revoke application "test123"?')).toBeVisible()
    const revokeButtons = screen.getAllByRole('button', { name: 'Revoke' })
    await userEvent.click(revokeButtons[1])
    await waitFor(() => {
      expect(screen.queryByText('Revoke application "test123"?')).toBeNull()
    })

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '456' },
      status: 'fulfilled'
    })]
    await waitFor(()=> {
      expect(services.useUpdateTenantAuthenticationsMutation).toHaveLastReturnedWith(value)
    })
    await waitFor(() => {
      expect(screen.queryByText('Revoke application "test123"?')).toBeNull()
    })
  })
  it('should activate revoked token correctly', async () => {
    render(
      <Provider>
        <AppTokenFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/accountSettings' }
      })

    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[1])
    const button = await screen.findByText('Activate')
    expect(button).toBeVisible()
    await userEvent.click(button)
    expect(await screen.findByText('Activate application "test456"?')).toBeVisible()
    const activateButtons = screen.getAllByRole('button', { name: 'Activate' })
    await userEvent.click(activateButtons[1])
    await waitFor(() => {
      expect(screen.queryByText('Activate application "test456"?')).toBeNull()
    })

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '456' },
      status: 'fulfilled'
    })]
    await waitFor(()=> {
      expect(services.useUpdateTenantAuthenticationsMutation).toHaveLastReturnedWith(value)
    })
    await waitFor(() => {
      expect(screen.queryByText('Activate application "test456"?')).toBeNull()
    })
  })
  it('should show drawer when edit button clicked', async () => {
    render(
      <Provider>
        <AppTokenFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/accountSettings' }
      })

    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    const button = await screen.findByText('Edit')
    expect(button).toBeVisible()
    await userEvent.click(button)
    expect(await screen.findByText('Edit API Token')).toBeVisible()
  })
  it('should delete token correctly', async () => {
    render(
      <Provider>
        <AppTokenFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/accountSettings' }
      })

    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    const button = await screen.findByText('Delete')
    expect(button).toBeVisible()
    await userEvent.click(button)
    expect(await screen.findByText('Delete "test123"?')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Delete Application' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitFor(()=> {
      expect(services.useDeleteTenantAuthenticationsMutation).toHaveLastReturnedWith(value)
    })
    await waitFor(() => {
      expect(screen.queryByText('Delete "test123"?')).toBeNull()
    })
  })
  it('should show secret when share secret button clicked', async () => {
    render(
      <Provider>
        <AppTokenFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/accountSettings' }
      })

    expect(screen.queryByText('secret123')).toBeNull()
    const buttons = await screen.findAllByTestId('EyeOpenSolid')
    await userEvent.click(buttons[0])
    expect(await screen.findByDisplayValue('secret123')).toBeVisible()
  })
  it('should render correctly when no data', async () => {
    render(
      <Provider>
        <AppTokenFormItem />
      </Provider>, {
        route: { params, path: '/:tenantId/deviceinventory' }
      })

    const table = screen.queryByRole('table')
    expect(table).toBeNull()
    const button = screen.getByRole('button', { name: 'Add Application Token' })
    await userEvent.click(button)
    expect(await screen.findByText('Add API Token')).toBeVisible()
  })
})
