import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                            from '@acx-ui/msp/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, within, waitFor } from '@acx-ui/test-utils'
import { RolesEnum }                                              from '@acx-ui/types'

import { AssignEcMspAdminsDrawer } from './AssignEcMspAdminsDrawer'

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
  },
  {
    id: '0c96c591260542c188f6a12c62bb3923',
    email: 'guest@guest.com',
    lastName: 'Smith',
    name: 'Jack',
    role: RolesEnum.GUEST_MANAGER
  }
]

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))

describe('AssignEcMspAdminsDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    // services.useGetMspEcDelegatedAdminsQuery = jest.fn().mockImplementation(() => {
    //   return { data: delegatedAdmins }
    // })
    services.useMspAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    jest.spyOn(services, 'useAssignMultiMspEcDelegatedAdminsMutation')
    mockServer.use(
      rest.post(
        MspUrlsInfo.assignMultiMspEcDelegatedAdmins.url,
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
        <AssignEcMspAdminsDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantIds={[params.tenantId]} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/assign' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Assign MSP Administrators')).toBeVisible()
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
        <AssignEcMspAdminsDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantIds={[params.tenantId]} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/assign' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Kenny')).toBeVisible()
    expect(screen.getByText('msp')).toBeVisible()
    expect(screen.getByText('myreadonly@my.com')).toBeVisible()
    expect(screen.getByText('msp.eleu1658@rwbigdog.com')).toBeVisible()
    expect(screen.queryByText('Prime Admin')).toBeVisible()
    expect(screen.queryByText('Read Only')).toBeVisible()
  })
  it('should search correctly', async () => {
    render(
      <Provider>
        <AssignEcMspAdminsDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantIds={[params.tenantId]} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/assign' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(4)
    expect(checkboxes[3]).toBeDisabled()

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
        <AssignEcMspAdminsDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantIds={[params.tenantId]} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(4)
    expect(checkboxes[3]).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Assign' }))

    expect(mockedCloseDialog).not.toHaveBeenCalledWith(false)
  })
  it('should assign correctly', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <AssignEcMspAdminsDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantIds={[params.tenantId]} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/assign' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(4)
    expect(checkboxes[3]).toBeDisabled()
    await userEvent.click(checkboxes[0])
    await userEvent.click(checkboxes[1])
    const dropdowns = screen.getAllByRole('combobox')
    expect(dropdowns).toHaveLength(2)
    // Click dropdown twice for options to become visible
    fireEvent.mouseDown(dropdowns[0])
    fireEvent.mouseDown(dropdowns[0])
    expect(screen.getAllByText('Guest Manager')[0]).toBeVisible()
    expect(screen.getAllByText('Guest Manager')[1]).toBeVisible()
    fireEvent.click(screen.getAllByText('Guest Manager')[1])
    // Click dropdown twice for options to become visible
    fireEvent.mouseDown(dropdowns[1])
    fireEvent.mouseDown(dropdowns[1])
    expect(screen.getAllByText('Prime Admin')[0]).toBeVisible()
    expect(screen.getAllByText('Prime Admin')[1]).toBeVisible()
    fireEvent.click(screen.getAllByText('Prime Admin')[1])
    await userEvent.click(screen.getByRole('button', { name: 'Assign' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitFor(()=>
      expect(services.useAssignMultiMspEcDelegatedAdminsMutation).toHaveLastReturnedWith(value))
    await waitFor(() =>
      expect(mockedCloseDialog).toHaveBeenCalledTimes(3))
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('should not assign if no tenantids given', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <AssignEcMspAdminsDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantIds={[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/assign' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(services.useAssignMultiMspEcDelegatedAdminsMutation).toHaveBeenCalledTimes(1)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(4)
    expect(checkboxes[3]).toBeDisabled()
    await userEvent.click(checkboxes[0])
    await userEvent.click(checkboxes[1])
    const dropdowns = screen.getAllByRole('combobox')
    expect(dropdowns).toHaveLength(2)
    // Click dropdown twice for options to become visible
    fireEvent.mouseDown(dropdowns[0])
    fireEvent.mouseDown(dropdowns[0])
    expect(screen.getAllByText('Guest Manager')[0]).toBeVisible()
    expect(screen.getAllByText('Guest Manager')[1]).toBeVisible()
    fireEvent.click(screen.getAllByText('Guest Manager')[1])
    // Click dropdown twice for options to become visible
    fireEvent.mouseDown(dropdowns[1])
    fireEvent.mouseDown(dropdowns[1])
    expect(screen.getAllByText('Prime Admin')[0]).toBeVisible()
    expect(screen.getAllByText('Prime Admin')[1]).toBeVisible()
    fireEvent.click(screen.getAllByText('Prime Admin')[1])
    await userEvent.click(screen.getByRole('button', { name: 'Assign' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitFor(()=>
      expect(services.useAssignMultiMspEcDelegatedAdminsMutation).not.toHaveLastReturnedWith(value))
    await waitFor(() =>
      expect(mockedCloseDialog).toHaveBeenCalledTimes(3))
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('should close correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AssignEcMspAdminsDrawer visible={true}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn()}
          tenantIds={[params.tenantId]} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/assign' }
      })

    expect(mockedCloseDrawer).not.toHaveBeenCalledWith(false)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockedCloseDrawer).toHaveBeenCalledWith(false)
  })
  it('cancel button should close drawer', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AssignEcMspAdminsDrawer visible={true}
          setVisible={mockedCloseDrawer}
          setSelected={jest.fn()}
          tenantIds={[params.tenantId]} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/assign' }
      })

    expect(mockedCloseDrawer).not.toHaveBeenCalledWith(false)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedCloseDrawer).toHaveBeenCalledWith(false)
  })
})
