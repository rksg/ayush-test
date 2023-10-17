import '@testing-library/jest-dom'
import { Provider }                                                              from '@acx-ui/store'
import { render, screen, fireEvent, within, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { SelectRecCustomerDrawer } from './SelectRecCustomer'

const list = {
  totalElements: 24,
  totalPages: 1,
  number: 0,
  content: [
    {
      account_name: 'Aloft Lexington',
      account_id: '0012J00002ZKO5FQAX',
      email_id: 'msprec2@email.com'
    },
    {
      account_name: 'Springhill Suites Las Vegas',
      account_id: '0012J00002ZKO68QAH',
      email_id: 'msprec3@email.com'
    }
  ]
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
  it('should search correctly', async () => {
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}/>
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    const input = await screen.findByPlaceholderText('Search Name')

    fireEvent.change(input, { target: { value: 'l' } })
    expect(await screen.findByText('Aloft Lexington')).toBeVisible()
    expect(await screen.findByText('Springhill Suites Las Vegas')).toBeVisible()

    fireEvent.change(input, { target: { value: 'al' } })
    expect(await screen.findByText('Al')).toBeVisible()
    expect(await screen.findByText('oft Lexington')).toBeVisible()

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

    // expect(services.useAssignMspEcToIntegratorMutation).toHaveBeenCalledTimes(2)
    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios.at(0)!)
    expect(screen.getByText('1 selected')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    const integrator = [expect.objectContaining({
      id: 'b1c3860e3cb644c5913b75d5a391e914'
    })]
    // expect(services.useAssignMspEcToIntegratorMutation).toHaveBeenCalledTimes(2)
    await waitFor(() => {
      expect(mockedSetSelected).toHaveBeenLastCalledWith(undefined, integrator)
    })
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: /loading/ }))
  })
})
