import userEvent from '@testing-library/user-event'

import { ApplicationAuthenticationStatus, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { Provider }                                                  from '@acx-ui/store'
import {
  render,
  screen,
  within,
  waitFor
} from '@acx-ui/test-utils'

import { AppTokenFormItem } from '.'

const tenantAuthenticationData = [
  {
    id: '1',
    name: 'test123',
    authenticationType: TenantAuthenticationType.ldap,
    clientID: '123',
    clientIDStatus: ApplicationAuthenticationStatus.ACTIVE,
    clientSecret: 'secret123'
  },
  {
    id: '2',
    name: 'test456',
    authenticationType: TenantAuthenticationType.ldap,
    clientID: '456',
    clientIDStatus: ApplicationAuthenticationStatus.REVOKE,
    clientSecret: 'secret456'
  }
]

describe('App Token Form Item', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
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
    expect(screen.getByText('123')).toBeVisible()
    expect(screen.getByText('test456')).toBeVisible()
    expect(screen.getByText('REVOKE')).toBeVisible()
    expect(screen.getByText('456')).toBeVisible()
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
    // TODO: uncomment when revoke functionality implemented
    // expect(screen.queryByText('ACTIVE')).toBeNull()
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
    // TODO: uncomment when activate functionality implemented
    // expect(screen.queryByText('REVOKE')).toBeNull()
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
    // TODO: uncomment and correct text when delete functionality implemented
    // expect(await screen.findByText('Delete Application?')).toBeVisible()
    // const deleteButtons = screen.getAllByRole('button', { name: 'Delete' })
    // await userEvent.click(deleteButtons[1])
    // waitFor(() => {
    //   expect(screen.queryByText('delete modal text')).toBeNull()
    // })
    // expect(screen.queryByText('test123')).toBeNull()
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
