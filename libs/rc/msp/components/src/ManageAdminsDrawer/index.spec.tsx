import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                            from '@acx-ui/msp/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, within, waitFor } from '@acx-ui/test-utils'
import { RolesEnum }                                              from '@acx-ui/types'

import { ManageAdminsDrawer } from '.'

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

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))

describe('ManageAdminsDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetMspEcDelegatedAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: delegatedAdmins }
    })
    services.useMspAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: list }
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
        <ManageAdminsDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage MSP Administrators')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
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
        <ManageAdminsDrawer visible={true}
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
        <ManageAdminsDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    await userEvent.click(checkboxes.at(1)!)
    await userEvent.click(checkboxes.at(2)!)

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
        <ManageAdminsDrawer visible={true}
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
    await userEvent.click(checkboxes.at(2)!)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockedCloseDialog).not.toHaveBeenCalledWith(false)
  })
  it('should save correctly', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <ManageAdminsDrawer visible={true}
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
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

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
        <ManageAdminsDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={mockedSetSelected} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    await userEvent.click(checkboxes.at(1)!)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockedSetSelected).toHaveBeenCalledTimes(1)
    expect(mockedCloseDialog).toHaveBeenCalledTimes(1)
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
})
