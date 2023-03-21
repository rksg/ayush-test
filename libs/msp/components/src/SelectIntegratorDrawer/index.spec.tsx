import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspUrlsInfo }                                            from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, within, waitFor } from '@acx-ui/test-utils'
import { AccountType }                                            from '@acx-ui/utils'

import { SelectIntegratorDrawer } from '.'

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      assignedMspEcList: [],
      id: 'b1c3860e3cb644c5913b75d5a391e914',
      name: 'another int',
      status: 'Active',
      tenantType: 'MSP_INTEGRATOR'
    },
    {
      assignedMspEcList: [
        '6a0d92dee47942dda28d29770696c6a0',
        '45a1214beeee4c098289cd6446c89e44'
      ],
      id: 'b1c3860e3cb644c5913b75d5a391e915',
      name: 'installer',
      status: 'Active',
      tenantType: 'MSP_INSTALLER'
    }
  ]
}

const services = require('@acx-ui/rc/services')
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services')
}))

describe('SelectIntegratorDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useMspCustomerListQuery = jest.fn().mockImplementation(() => {
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
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render table correctly', async () => {
    render(
      <Provider>
        <SelectIntegratorDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          tenantType={AccountType.MSP_INTEGRATOR} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    await screen.findByText('another int')

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
  })
  it('should search correctly', async () => {
    render(
      <Provider>
        <SelectIntegratorDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}/>
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    const input = await screen.findByPlaceholderText('Search Name')

    fireEvent.change(input, { target: { value: 'a' } })
    expect(await screen.findByText('another int')).toBeVisible()
    expect(await screen.findByText('installer')).toBeVisible()

    fireEvent.change(input, { target: { value: 'an' } })
    expect(await screen.findByText('an')).toBeVisible()
    expect(await screen.findByText('other int')).toBeVisible()

    fireEvent.change(input, { target: { value: 'aa' } })
    expect(screen.queryByText('aa')).toBeNull()
  })
  it('cancel should close drawer', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <SelectIntegratorDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          tenantType={AccountType.MSP_INTEGRATOR} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    await screen.findByText('another int')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  xit('should handle save', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <SelectIntegratorDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          tenantType={AccountType.MSP_INTEGRATOR} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: '123' },
        status: 'fulfilled'
      })
    ]

    await waitFor(() => {
      expect(services.useAssignMspEcToIntegratorMutation).toHaveLastReturnedWith(value)
    })
    await waitFor(() => {
      expect(mockedCloseDialog).toHaveBeenCalledTimes(3)
    })
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  xit('should handle save with selected rows', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <SelectIntegratorDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          tenantType={AccountType.MSP_INTEGRATOR} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios.at(0)!)
    expect(screen.getByText('1 selected')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: '123' },
        status: 'fulfilled'
      })
    ]

    await waitFor(() => {
      expect(services.useAssignMspEcToIntegratorMutation).toHaveLastReturnedWith(value)
    })
    await waitFor(() => {
      expect(mockedCloseDialog).toHaveBeenCalledTimes(3)
    })
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  xit('should handle save when tenantType not given', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <SelectIntegratorDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios.at(0)!)
    expect(screen.getByText('1 selected')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: '123' },
        status: 'fulfilled'
      })
    ]

    await waitFor(() => {
      expect(services.useAssignMspEcToIntegratorMutation).toHaveLastReturnedWith(value)
    })
    await waitFor(() => {
      expect(mockedCloseDialog).toHaveBeenCalledTimes(3)
    })
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('should handle save when tenantId not given', async () => {
    const mockedCloseDialog = jest.fn()
    const mockedSetSelected = jest.fn()
    render(
      <Provider>
        <SelectIntegratorDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={mockedSetSelected} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(services.useAssignMspEcToIntegratorMutation).toHaveBeenCalledTimes(1)
    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios.at(0)!)
    expect(screen.getByText('1 selected')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    const integrator = [expect.objectContaining({
      id: 'b1c3860e3cb644c5913b75d5a391e914'
    })]
    expect(services.useAssignMspEcToIntegratorMutation).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(mockedSetSelected).toHaveBeenLastCalledWith(undefined, integrator)
    })
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
})
