import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                            from '@acx-ui/msp/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, render, screen, within, waitFor, fireEvent } from '@acx-ui/test-utils'

import { Integrators } from '.'

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      assignedMspEcList: [],
      creationDate: '1659589676020',
      id: '701fe9df5f6b4c17928a29851c07cc04',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 2,
      name: 'integrator 168',
      status: 'Active',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_INTEGRATOR',
      wifiLicenses: 2
    },
    {
      assignedMspEcList: [],
      creationDate: '1659589676020',
      id: 'b5793f93ed3d4483929610a981eeda0c',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'installer 888',
      status: 'Active',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_INSTALLER',
      wifiLicenses: 2
    }
  ]
}

const mspPortal = {
  msp_label: 'eleu1658'
}

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const utils = require('@acx-ui/rc/utils')
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils')
}))
const user = require('@acx-ui/user')
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user')
}))
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Integrators', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspPortal }
    })
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    jest.spyOn(services, 'useDeleteMspEcMutation')
    mockServer.use(
      rest.delete(
        MspUrlsInfo.deleteMspEcAccount.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'f638e92c-9d6f-45b2-a680-20047741ef2c' }))
      )
    )
    services.useGetAssignedMspEcToIntegratorQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    services.useMspAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: [] }
    })
    services.useGetMspEcDelegatedAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: undefined }
    })
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <Integrators />
      </Provider>, { route: { params, path: '/:tenantId/v/integrators' } })
    expect(screen.getByText('Tech Partners')).toBeVisible()
    expect(screen.getByText('Manage My Account')).toBeVisible()
    expect(screen.getByText('Add Tech Partner')).toBeVisible()

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })
  })
  it('should delete selected row', async () => {
    render(
      <Provider>
        <Integrators />
      </Provider>, {
        route: { params, path: '/:tenantId/v/integrators' }
      })

    const row = await screen.findByRole('row', { name: /integrator 168/i })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "integrator 168"?')
    const deleteEcButton = screen.getByRole('button', { name: 'Delete Tech Partner' })
    userEvent.type(screen.getByRole('textbox',
      { name: 'Type the word "Delete" to confirm:' }), 'Delete')
    await waitFor(() =>
      expect(deleteEcButton).not.toBeDisabled())

    fireEvent.click(deleteEcButton)
    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: 'f638e92c-9d6f-45b2-a680-20047741ef2c' },
        status: 'fulfilled'
      })
    ]

    await waitFor(() =>
      expect(services.useDeleteMspEcMutation).toHaveLastReturnedWith(value))
    await waitFor(() =>
      expect(screen.queryByText('Delete "integrator 168"?')).toBeNull())
  })
  it('should resend invite for selected row', async () => {
    render(
      <Provider>
        <Integrators />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/integrators' }
      })

    const row = await screen.findByRole('row', { name: /integrator 168/i })
    fireEvent.click(within(row).getByRole('radio'))

    const resendInviteButton = screen.getByRole('button', { name: 'Resend Invitation Email' })
    fireEvent.click(resendInviteButton)

    expect(screen.getByRole('button', { name: 'Resend Invitation' })).toBeVisible()
  })
  it('should edit for selected row', async () => {
    render(
      <Provider>
        <Integrators />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/integrators' }
      })

    const row = await screen.findByRole('row', { name: /integrator 168/i })
    fireEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: 'Edit' })
    fireEvent.click(editButton)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/v/integrators/edit/${list.data.at(0)?.tenantType}/${list.data.at(0)?.id}`,
      hash: '',
      search: ''
    })
  })
  it('should open dialog when customers assigned link clicked', async () => {
    render(
      <Provider>
        <Integrators />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/integrators' }
      })

    const row = await screen.findByRole('row', { name: /integrator 168/i })
    fireEvent.click(within(row).getByRole('link', { name: '0' }))

    expect(screen.getByRole('dialog')).toBeVisible()
  })
  it('should open dialog when msp admin count link clicked', async () => {
    render(
      <Provider>
        <Integrators />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/integrators' }
      })

    const row = await screen.findByRole('row', { name: /integrator 168/i })
    fireEvent.click(within(row).getByRole('link', { name: '1' }))

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage MSP Administrators')).toBeVisible()
  })
  it('should render table correctly when not admin', async () => {
    user.hasRoles = jest.fn().mockImplementation(() => {
      return false
    })

    render(
      <Provider>
        <Integrators />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/integrators' }
      })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })

    const row = await screen.findByRole('row', { name: /integrator 168/i })
    expect(within(row).queryByRole('link', { name: '1' })).toBeNull()
    expect(within(row).queryByRole('link', { name: '0' })).toBeNull()
  })
})
