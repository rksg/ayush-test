import '@testing-library/jest-dom'
import { rest } from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }      from '@acx-ui/feature-toggle'
import { MspRbacUrlsInfo, MspUrlsInfo }                  from '@acx-ui/msp/utils'
import { Provider }                                      from '@acx-ui/store'
import { render, screen, fireEvent, within, mockServer } from '@acx-ui/test-utils'

import { SelectRecCustomerDrawer } from './SelectRecCustomer'

const list = {
  totalElements: 24,
  totalPages: 1,
  number: 0,
  parent_account_name: 'arsene.var',
  child_accounts: [
    {
      account_name: 'Aloft Lexington',
      account_id: '0012J00002ZKO5FQAX',
      billing_city: 'Miami',
      billing_country: 'United States',
      billing_postal_code: '33172',
      billing_state: 'FL',
      billing_street: '11275 Northwest 12th Street,',
      is_tenant_onboarded: true
    },
    {
      account_name: 'Springhill Suites Las Vegas',
      account_id: '0012J00002ZKO68QAH',
      billing_city: 'Milpitas',
      billing_country: 'United States',
      billing_postal_code: '95035',
      billing_state: 'CA',
      billing_street: '1480 Falcon Drive',
      is_tenant_onboarded: true
    },
    {
      account_name: 'Hillton Max Mumbai',
      account_id: '0012J00002ZKO68QWE',
      billing_city: 'Mumbai',
      billing_country: 'India',
      billing_postal_code: '00001',
      billing_state: 'MH',
      billing_street: '1480 Falcon Drive',
      is_tenant_onboarded: false
    }
  ]
}

describe('SelectRecCustomerDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
    mockServer.use(
      rest.get(MspRbacUrlsInfo.getAvailableMspRecCustomers.url, (req, res, ctx) => {
        return res(ctx.json(list))
      }),
      rest.get(MspUrlsInfo.getAvailableMspRecCustomers.url, (req, res, ctx) => {
        return res(ctx.json(list))
      })
    )
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
          tenantId={params.tenantId}
          multiSelectionEnabled={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    await screen.findByText('Aloft Lexington')

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.child_accounts.length)
  })
  it('should search correctly', async () => {
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          multiSelectionEnabled={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    const input = await screen.findByPlaceholderText('Search Property Name')

    fireEvent.change(input, { target: { value: 'l' } })
    expect(await screen.findByText('Aloft Lexington')).toBeVisible()
    expect(await screen.findByText('Springhill Suites Las Vegas')).toBeVisible()

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
          tenantId={params.tenantId}
          multiSelectionEnabled={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    await screen.findByText('Aloft Lexington')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('close button should close drawer', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          multiSelectionEnabled={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    await screen.findByText('Aloft Lexington')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('should not save without selected rows', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          multiSelectionEnabled={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(mockedCloseDialog).not.toHaveBeenCalled()
  })
  it('should handle save with selected rows', async () => {
    const mockedCloseDialog = jest.fn()
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={mockedCloseDialog}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          multiSelectionEnabled={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios.at(0)!)
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('should render multi selection correctly', async () => {
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          multiSelectionEnabled={true} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    await screen.findByText('Aloft Lexington')

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.child_accounts.length)
  })

  it('should highlight non onborded rec customers with *', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.DURGA_TENANT_CONVERSION_REC_TO_MSP_REC
    )
    render(
      <Provider>
        <SelectRecCustomerDrawer visible={true}
          setVisible={jest.fn()}
          setSelected={jest.fn()}
          tenantId={params.tenantId}
          multiSelectionEnabled={true} />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    await screen.findByRole('cell',{ name: '* Hillton Max Mumbai' })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.child_accounts.length)
  })
})
