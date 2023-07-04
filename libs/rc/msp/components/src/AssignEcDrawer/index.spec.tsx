import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                            from '@acx-ui/msp/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, within, waitFor } from '@acx-ui/test-utils'
import { AccountType }                                            from '@acx-ui/utils'

import { AssignEcDrawer } from '.'


const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '2242a683a7594d7896385cfef1fe4442',
      name: 'Din Tai Fung',
      wifiLicenses: '2',
      switchLicenses: '3',
      status: 'Active'
    },
    {
      id: '350f3089a8e34509a2913c550faffa7e',
      name: 'Eva Airways',
      status: 'Active'
    }
  ]
}
const assigned = {
  delegated_to: '3061bd56e37445a8993ac834c01e2710',
  delegation_type: 'MSP_INTEGRATOR',
  mspec_list: [
    '2242a683a7594d7896385cfef1fe4442'
  ]
}

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const utils = require('@acx-ui/rc/utils')
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils')
}))

describe('AssignEcDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    jest.spyOn(services, 'useAssignMspEcToIntegratorMutation')
    mockServer.use(
      rest.post(
        MspUrlsInfo.assignMspEcToIntegrator.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  it('should render table correctly', async () => {
    render(
      <Provider>
        <AssignEcDrawer visible={true}
          setSelected={jest.fn()}
          setVisible={jest.fn()}/>
      </Provider>, {
        route: { params,
          path: '/:tenantId/integrators/edit/MSP_INSTALLER/3061bd56e37445a8993ac834c01e2710' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage Customers Assigned')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    //eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    expect(screen.getByText('Din Tai Fung')).toBeVisible()
    expect(screen.getByText('Eva Airways')).toBeVisible()

  })
  it('should search correctly', async () => {
    services.useGetAssignedMspEcToIntegratorQuery = jest.fn().mockImplementation(() => {
      return {}
    })
    render(
      <Provider>
        <AssignEcDrawer visible={true}
          setSelected={jest.fn()}
          setVisible={jest.fn()}/>
      </Provider>, {
        route: { params,
          path: '/:tenantId/integrators/edit/MSP_INSTALLER/3061bd56e37445a8993ac834c01e2710' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    /* eslint-disable max-len */
    expect(screen.getByText('Select customer accounts to assign to this tech partner:')).toBeVisible()

    const input = screen.getByPlaceholderText('Search Customer')

    fireEvent.change(input, { target: { value: 'di' } })
    expect(await screen.findByText('Di')).toBeVisible()
    expect(await screen.findByText('n Tai Fung')).toBeVisible()
    expect(screen.queryByText('Eva Airways')).toBeNull()

    fireEvent.change(input, { target: { value: 'did' } })
    expect(screen.queryByText('did')).toBeNull()
    expect(screen.queryByText('Din Tai Fung')).toBeNull()
    expect(screen.queryByText('Eva Airways')).toBeNull()
  })
  it('should load data correctly for integrator', async () => {
    services.useGetAssignedMspEcToIntegratorQuery = jest.fn().mockImplementation(() => {
      return { data: assigned }
    })
    render(
      <Provider>
        <AssignEcDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          tenantType={AccountType.MSP_INTEGRATOR} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/integrators/edit/MSP_INSTALLER/3061bd56e37445a8993ac834c01e2710' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()

    // Assert Access Periods are correct
    expect(screen.getByText('Not Limited')).toBeVisible()

    // Assert Header Fields are correct
    expect(screen.getAllByRole('columnheader', { name: 'Customer caret-up' })).toHaveLength(1)
    expect(screen.getAllByRole('columnheader', { name: 'Status' })).toHaveLength(1)
    expect(screen.getAllByRole('columnheader', { name: 'Address' })).toHaveLength(1)
    expect(screen.getAllByRole('columnheader', { name: 'Wi-Fi Licenses' })).toHaveLength(1)
    expect(screen.getAllByRole('columnheader', { name: 'Switch Licenses' })).toHaveLength(1)

    // Assert rows of data are correct
    expect(screen.getByText('Din Tai Fung')).toBeVisible()
    expect(screen.getByText('Eva Airways')).toBeVisible()
    expect(screen.getByText('1 selected')).toBeVisible()
  })
  it('should load data correctly for installer', async () => {
    services.useGetAssignedMspEcToIntegratorQuery = jest.fn().mockImplementation(() => {
      return { data: assigned }
    })
    render(
      <Provider>
        <AssignEcDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          tenantType={AccountType.MSP_INSTALLER} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/integrators/edit/MSP_INSTALLER/3061bd56e37445a8993ac834c01e2710' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()

    // Assert Access Periods are correct
    expect(screen.getByText('Limited To')).toBeVisible()
    // expect(screen.getByRole('spinbutton')).toHaveValue(7)

    // Assert Header Fields are correct
    expect(screen.getAllByRole('columnheader', { name: 'Customer caret-up' })).toHaveLength(1)
    expect(screen.getAllByRole('columnheader', { name: 'Status' })).toHaveLength(1)
    expect(screen.getAllByRole('columnheader', { name: 'Address' })).toHaveLength(1)
    expect(screen.getAllByRole('columnheader', { name: 'Wi-Fi Licenses' })).toHaveLength(1)
    expect(screen.getAllByRole('columnheader', { name: 'Switch Licenses' })).toHaveLength(1)

    // Assert rows of data are correct
    expect(screen.getByText('Din Tai Fung')).toBeVisible()
    expect(screen.getByText('Eva Airways')).toBeVisible()
    expect(screen.getByText('1 selected')).toBeVisible()
  })
  it('should show error message for invalid access period input', async () => {
    services.useGetAssignedMspEcToIntegratorQuery = jest.fn().mockImplementation(() => {
      return { data: assigned }
    })
    render(
      <Provider>
        <AssignEcDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          tenantType={AccountType.MSP_INSTALLER} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/integrators/edit/MSP_INSTALLER/3061bd56e37445a8993ac834c01e2710' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()

    expect(screen.getByText('Limited To')).toBeVisible()
    await userEvent.clear(screen.getByRole('spinbutton'))
    await userEvent.type(screen.getByRole('spinbutton'), '61')

    expect(await screen.findByText('Value must be between 1 and 60 days' )).toBeVisible()

  })
  it('should save correctly when additional selected', async () => {
    services.useGetAssignedMspEcToIntegratorQuery = jest.fn().mockImplementation(() => {
      return { data: assigned }
    })
    const mockedCloseDialog = jest.fn().mockImplementation(() => {})
    render(
      <Provider>
        <AssignEcDrawer visible={true}
          setSelected={jest.fn()}
          setVisible={mockedCloseDialog}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/integrators/edit/MSP_INSTALLER/3061bd56e37445a8993ac834c01e2710' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    await userEvent.click(checkboxes.at(2)!)
    expect(screen.getByText('2 selected')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitFor(()=>
      expect(services.useAssignMspEcToIntegratorMutation).toHaveLastReturnedWith(value))
    await waitFor(() =>
      expect(mockedCloseDialog).toHaveBeenCalledTimes(3))
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('should save correctly when deselected', async () => {
    services.useGetAssignedMspEcToIntegratorQuery = jest.fn().mockImplementation(() => {
      return { data: assigned }
    })
    const mockedCloseDialog = jest.fn().mockImplementation(() => {})
    render(
      <Provider>
        <AssignEcDrawer visible={true}
          setSelected={jest.fn()}
          setVisible={mockedCloseDialog}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/integrators/edit/MSP_INSTALLER/3061bd56e37445a8993ac834c01e2710' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    await userEvent.click(checkboxes.at(1)!)
    expect(screen.queryByText('1 selected')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitFor(()=>
      expect(services.useAssignMspEcToIntegratorMutation).toHaveLastReturnedWith(value))
    await waitFor(() =>
      expect(mockedCloseDialog).toHaveBeenCalledTimes(3))
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('cancel button should close dialog', async () => {
    const mockedCloseDialog = jest.fn().mockImplementation(() => {})
    render(
      <Provider>
        <AssignEcDrawer visible={true}
          setSelected={jest.fn()}
          setVisible={mockedCloseDialog}/>
      </Provider>, {
        route: { params,
          path: '/:tenantId/integrators/edit/MSP_INSTALLER/3061bd56e37445a8993ac834c01e2710' }
      })

    expect(await screen.findByRole('dialog')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
})
