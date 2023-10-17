import '@testing-library/jest-dom'
import { Path, rest } from 'msw'

import { MspUrlsInfo }                                                                       from '@acx-ui/msp/utils'
import { Provider }                                                                          from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, within, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { SelectRecCustomerDrawer } from './SelectRecCustomer'

const list = {
  totalElements: 124,
  totalPages: 7,
  number: 0,
  content: [
    {
      account_name: 'Courtyard By Marriott Austin Dripping Springs',
      account_id: '0012J00002ZKO4HQAX',
      email_id: 'msprec1@email.com'
    },
    {
      account_name: 'Aloft Lexington',
      account_id: '0012J00002ZKO5FQAX',
      email_id: 'msprec2@email.com'
    },
    {
      account_name: 'Springhill Suites Las Vegas North Speedway',
      account_id: '0012J00002ZKO68QAH',
      email_id: 'msprec3@email.com'
    },
    {
      account_name: 'Renaissance Asheville Downtown Hotel',
      account_id: '0012J00002ZKG5GQAX',
      email_id: 'msprec4@email.com'
    },
    {
      account_name: 'TownePlace Suite Salt Lake City',
      account_id: '0012J00002ZKFpwQAH',
      email_id: 'msprec5@email.com'
    }
  ]
}

const assignedEc = {
  delegated_to: '',
  delegation_type: '',
  mspec_list: ['6a0d92dee47942dda28d29770696c6a0','3061bd56e37445a8993ac834c01e2710']
}

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))

describe('SelectRecCustomerDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetAvailableMspRecCustomersQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })
    jest.spyOn(services, 'useAssignMspEcToIntegratorMutation')
    mockServer.use(
      rest.patch(
        MspUrlsInfo.assignMspEcToIntegrator.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
    mockServer.use(
      rest.get(
        MspUrlsInfo.getAssignedMspEcToIntegrator.url.split('?')[0] as Path,
        (req, res, ctx) => res(ctx.json(assignedEc))
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
        <SelectRecCustomerDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    await screen.findByText('Aloft Lexington')

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.content.length)
  })
  xit('should search correctly', async () => {
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}/>
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    const input = await screen.findByPlaceholderText('Search Name')

    fireEvent.change(input, { target: { value: 'a' } })
    expect(await screen.findAllByText('Aloft Lexington')).toBeVisible()
    // expect(await screen.findByText('Aloft Lexington')).toBeVisible()

    fireEvent.change(input, { target: { value: 'al' } })
    expect(await screen.findByText('Aloft Lexington')).toBeVisible()
    // expect(await screen.findByText('other int')).toBeVisible()

    fireEvent.change(input, { target: { value: 'aa' } })
    expect(screen.queryByText('aa')).toBeNull()
  })
  it('cancel should close drawer', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    await screen.findByText('Aloft Lexington')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  xit('should handle save without selected rows', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
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
        <SelectRecCustomerDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
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
    const mockedSetSelected = jest.fn()
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={mockedSetSelected}
          tenantId={params.tenantId} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios.at(0)!)
    expect(screen.getByText('1 selected')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    const integrator = [expect.objectContaining({
      id: 'b1c3860e3cb644c5913b75d5a391e914'
    })]
    expect(services.useAssignMspEcToIntegratorMutation).toHaveBeenCalledTimes(2)
    await waitFor(() => {
      expect(mockedSetSelected).toHaveBeenLastCalledWith(undefined, integrator)
    })
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: /loading/ }))
  })
  xit('should handle save when tenantId not given', async () => {
    const mockedCloseDialog = jest.fn()
    const mockedSetSelected = jest.fn()
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={mockedSetSelected} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    expect(services.useAssignMspEcToIntegratorMutation).toHaveBeenCalledTimes(2)
    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios.at(0)!)
    expect(screen.getByText('1 selected')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    const integrator = [expect.objectContaining({
      id: 'b1c3860e3cb644c5913b75d5a391e914'
    })]
    expect(services.useAssignMspEcToIntegratorMutation).toHaveBeenCalledTimes(2)
    await waitFor(() => {
      expect(mockedSetSelected).toHaveBeenLastCalledWith(undefined, integrator)
    })
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: /loading/ }))
  })
})
