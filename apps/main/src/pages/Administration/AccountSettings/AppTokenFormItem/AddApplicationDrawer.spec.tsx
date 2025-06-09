import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo, ApplicationAuthenticationStatus, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { Provider }                                                                          from '@acx-ui/store'
import {
  render,
  screen,
  waitFor,
  fireEvent,
  mockServer,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { RolesEnum } from '@acx-ui/types'

import { AddApplicationDrawer } from './AddApplicationDrawer'

const tenantAuthenticationData =
{
  id: '1',
  name: 'test123',
  authenticationType: TenantAuthenticationType.ldap,
  clientID: '123',
  clientIDStatus: ApplicationAuthenticationStatus.ACTIVE,
  clientSecret: 'secret123',
  scopes: RolesEnum.PRIME_ADMIN
}

const fakedPrivilegeGroupList =
  [
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8911',
      name: 'ADMIN',
      description: 'Admin Role',
      roleName: 'ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8912',
      name: 'PRIME_ADMIN',
      description: 'Prime Admin Role',
      roleName: 'PRIME_ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8913',
      name: 'READ_ONLY',
      description: 'Read only Role',
      roleName: 'READ_ONLY',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8914',
      name: 'OFFICE_ADMIN',
      description: 'Guest Manager',
      roleName: 'OFFICE_ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8915',
      name: 'DPSK_ADMIN',
      description: 'DPSK Manager',
      roleName: 'DPSK_ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '99bb7b958a5544898cd0b938fa800a5a',
      name: 'wi-fi privilege group',
      description: 'privilege group for wi-fi',
      roleName: 'new wi-fi custom role',
      type: 'Custom',
      delegation: false,
      allCustomers: false
    },
    {
      name: 'PG_DEV_CR_01_MSP_DG',
      description: 'This is PG creatig for MSP with delegations',
      roleName: 'ADMIN',
      policies: [
        {
          entityInstanceId: '2fe159728aa34c1abb94f3877d2f1d98',
          objectType: 'com.ruckus.cloud.venue.model.venue'
        },
        {
          entityInstanceId: '9e32160be86b4c4797c0fb106c4f3615',
          objectType: 'com.ruckus.cloud.venue.model.venue'
        }
      ],
      delegation: true,
      policyEntityDTOS: [
        {
          tenantId: 'fd62264fb63f482283cd70fbcdbe9cb9',
          objectList: {
            'com.ruckus.cloud.venue.model.venue': [
              'a3dfc1c8b6b14af897eef44c0ccf035b'
            ]
          }
        },
        {
          tenantId: '5f404592c5b94ebcbaf674ebe5888645',
          objectList: {
            'com.ruckus.cloud.venue.model.venue': [
              'ff6db356a17948719f7f5d9df0d05104'
            ]
          }
        }
      ]
    }
  ]

const services = require('@acx-ui/rc/services')

describe('Add Application Drawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.spyOn(services, 'useAddTenantAuthenticationsMutation')
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addTenantAuthentications.url,
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
    services.useGetPrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      return { data: fakedPrivilegeGroupList }
    })

  })
  it('should render add layout correctly', async () => {
    render(
      <Provider>
        <AddApplicationDrawer
          visible={true}
          isEditMode={false}
          setVisible={jest.fn()} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add API Token')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should render edit layout correctly', async () => {
    render(
      <Provider>
        <AddApplicationDrawer
          visible={true}
          isEditMode={true}
          setVisible={jest.fn()} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit API Token')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should close correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AddApplicationDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add API Token')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedCloseDrawer).toHaveBeenCalledWith(false)
  })
  it('should validate application name correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AddApplicationDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add API Token')).toBeVisible()
    const input = screen.getByLabelText('Application Name')
    fireEvent.change(input, { target: { value: 'n' } })
    expect(await screen.findByText('Application Name must be at least 2 characters')).toBeVisible()
    fireEvent.change(input, { target: { value: 'name' } })
    await waitFor(() => {
      expect(screen.queryByText('Application Name must be at least 2 characters')).toBeNull()
    })
    fireEvent.change(input, { target: { value: '' } })
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Please enter Application Name')).toBeVisible()
    expect(mockedCloseDrawer).not.toHaveBeenCalledWith(false)
  })
  it('should validate client secret correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AddApplicationDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add API Token')).toBeVisible()
    const input = screen.getByLabelText('Client secret')
    fireEvent.change(input, { target: { value: '1' } })
    /* eslint-disable max-len */
    expect(await screen.findByText('Secret must include letters or special characters; numbers alone are not accepted.')).toBeVisible()
    fireEvent.change(input, { target: { value: '1A' } })
    await waitFor(() => {
      expect(screen.queryByText('Secret must include letters or special characters; numbers alone are not accepted.')).toBeNull()
    })
    fireEvent.change(input, { target: { value: '1A ' } })
    expect(await screen.findByText('Cannot contain space')).toBeVisible()
    fireEvent.change(input, { target: { value: '' } })
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(await screen.findByText('Please enter Client secret')).toBeVisible()
    expect(mockedCloseDrawer).not.toHaveBeenCalledWith(false)
  })
  it('should validate scope correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AddApplicationDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add API Token')).toBeVisible()
    const input = screen.getByLabelText('Application Name')
    fireEvent.change(input, { target: { value: 'test' } })
    await userEvent.click(screen.getByRole('button', { name: 'Generate Secret' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    /* eslint-disable max-len */
    expect( await screen.findByText('Please select the scope (role) to apply to this application')).toBeVisible()
    expect(mockedCloseDrawer).not.toHaveBeenCalledWith(false)
  })
  it('should generate client secret correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AddApplicationDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add API Token')).toBeVisible()
    const button = screen.getByRole('button', { name: 'Generate Secret' })
    await userEvent.click(button)
    expect(screen.queryByText('Please enter Client secret')).toBeNull()
    expect(screen.queryByText('Cannot be composed of ALL digits, e.g., 12345')).toBeNull()
    expect(screen.queryByText('Cannot contain space')).toBeNull()
  })
  it('should save correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    const writeText = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText
      }
    })

    render(
      <Provider>
        <AddApplicationDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add API Token')).toBeVisible()
    const input = screen.getByLabelText('Application Name')
    fireEvent.change(input, { target: { value: 'testname' } })
    await userEvent.click(screen.getByRole('button', { name: 'Generate Secret' }))
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Scope' }))
    await userEvent.click(screen.getByText('Prime Admin'))
    const copyButtons = screen.getAllByRole('button', { name: 'Copy' })
    await userEvent.click(copyButtons[0])
    await userEvent.click(copyButtons[1])
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loading' }))
    await waitFor(()=>
      expect(services.useAddTenantAuthenticationsMutation).toHaveLastReturnedWith(value))
    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })
  })
  it('should save edited token correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AddApplicationDrawer
          visible={true}
          isEditMode={true}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit API Token')).toBeVisible()
    expect(screen.getByDisplayValue('test123')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Generate Secret' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '456' },
      status: 'fulfilled'
    })]
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loading' }))
    await waitFor(()=>
      expect(services.useUpdateTenantAuthenticationsMutation).toHaveLastReturnedWith(value))
    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })
  })
  it('should render add layout correctly for ABAC/RBAC enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <AddApplicationDrawer
          visible={true}
          isEditMode={false}
          setVisible={jest.fn()} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add API Token')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
})
