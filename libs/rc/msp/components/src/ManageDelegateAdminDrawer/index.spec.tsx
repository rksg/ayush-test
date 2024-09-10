import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                            from '@acx-ui/msp/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, within, waitFor } from '@acx-ui/test-utils'
import { RolesEnum }                                              from '@acx-ui/types'

import { ManageDelegateAdminDrawer } from '.'

const list =
        [
          {
            id: 'a22618b0701048c9820dfbeb87818252',
            email: 'myreadonly@my.com',
            lastName: 'Chou',
            name: 'Kenny',
            role: RolesEnum.READ_ONLY
          },
          {
            id: '9b85c591260542c188f6a12c62bb3912',
            email: 'msp.eleu1658@rwbigdog.com',
            lastName: 'eleu1658',
            name: 'msp',
            role: RolesEnum.PRIME_ADMIN
          }
        ]
const delegatedAdmins =
[
  {
    msp_admin_id: 'a22618b0701048c9820dfbeb87818252',
    msp_admin_role: RolesEnum.GUEST_MANAGER
  },
  {
    msp_admin_id: '9b85c591260542c188f6a12c62bb3912',
    msp_admin_role: RolesEnum.ADMINISTRATOR
  }
]

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

const services = require('@acx-ui/msp/services')
const rcServices = require('@acx-ui/rc/services')

describe('ManageDelegateAdminDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetMspEcDelegatedAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: delegatedAdmins }
    })
    services.useMspAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    rcServices.useGetMspEcPrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      return { data: fakedPrivilegeGroupList }
    })

    jest.spyOn(services, 'useUpdateMspEcDelegatedAdminsMutation')
    mockServer.use(
      rest.put(
        MspUrlsInfo.updateMspEcDelegatedAdmins.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render table correctly', async () => {
    render(
      <Provider>
        <ManageDelegateAdminDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage MSP Users')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Assign' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.length)

  })
  it('should load data correctly', async () => {
    render(
      <Provider>
        <ManageDelegateAdminDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Kenny')).toBeVisible()
    expect(screen.getByText('msp')).toBeVisible()
    expect(screen.getByText('myreadonly@my.com')).toBeVisible()
    expect(screen.getByText('msp.eleu1658@rwbigdog.com')).toBeVisible()
    expect(screen.getByText('2 selected')).toBeVisible()

    // Assert Role dropdown is populated correctly
    expect(screen.getByText('Guest Manager')).toBeVisible()
    expect(screen.getByText('Administrator')).toBeVisible()
    expect(screen.queryByText('Prime Admin')).toBeNull()
    expect(screen.queryByText('Read Only')).toBeNull()
  })
  it('should search correctly', async () => {
    render(
      <Provider>
        <ManageDelegateAdminDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    await userEvent.click(checkboxes.at(0)!)

    const input = screen.getByPlaceholderText('Search Email')
    await userEvent.type(input, 'ms')
    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(1)
    expect(screen.getByText('p.eleu1658@rwbigdog.com')).toBeVisible()
  })
  it('should validate at least one admin selected', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <ManageDelegateAdminDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    await userEvent.click(checkboxes.at(0)!)

    await userEvent.click(screen.getByRole('button', { name: 'Assign' }))

    expect(mockedCloseDialog).not.toHaveBeenCalledWith(false)
  })
  it('should save correctly', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <ManageDelegateAdminDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    await userEvent.click(checkboxes.at(1)!)
    const dropdowns = screen.getAllByRole('combobox')
    expect(dropdowns).toHaveLength(2)
    fireEvent.mouseDown(dropdowns.at(0)!)
    await userEvent.click(screen.getByText('Prime Admin'))
    await userEvent.click(screen.getByRole('button', { name: 'Assign' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitFor(()=>
      expect(services.useUpdateMspEcDelegatedAdminsMutation).toHaveLastReturnedWith(value))
    await waitFor(() =>
      expect(mockedCloseDialog).toHaveBeenCalledTimes(3))
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('should handle save when no tenantId', async () => {
    const mockedCloseDialog = jest.fn()
    const mockedSetSelected = jest.fn()
    render(
      <Provider>
        <ManageDelegateAdminDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={mockedSetSelected} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    await userEvent.click(checkboxes.at(1)!)
    await userEvent.click(screen.getByRole('button', { name: 'Assign' }))

    expect(mockedSetSelected).toHaveBeenCalledTimes(1)
    expect(mockedCloseDialog).toHaveBeenCalledTimes(1)
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
})
