import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { StepsForm }                  from '@acx-ui/components'
import { Provider }                   from '@acx-ui/store'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { CustomerSelectionForm } from '.'

// Mock the MSP services
const mockUseMspCustomerListQuery = jest.fn()
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services'),
  useMspCustomerListQuery: () => mockUseMspCustomerListQuery()
}))

// Mock the EC filters
const mockUseEcFilters = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useEcFilters: () => mockUseEcFilters()
}))

// Mock the table query hook
const mockUseTableQuery = jest.fn()
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useTableQuery: (config: unknown) => {
    mockUseTableQuery(config)
    return mockUseTableQuery()
  }
}))

// Mock the styled components
jest.mock('../../../styledComponents', () => ({
  DescriptionWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='description-wrapper'>{children}</div>
  )
}))

describe('CustomerSelectionForm - MSP', () => {
  const mockCustomers = [
    {
      id: 'customer-1',
      name: 'Customer A',
      status: 'active',
      streetAddress: '123 Main St',
      tenantType: 'customer'
    },
    {
      id: 'customer-2',
      name: 'Customer B',
      status: 'active',
      streetAddress: '456 Oak Ave',
      tenantType: 'customer'
    }
  ]

  const mockTableQuery = {
    data: { data: mockCustomers },
    pagination: { current: 1, pageSize: 10, total: 2 },
    handleTableChange: jest.fn(),
    handleFilterChange: jest.fn(),
    isLoading: false,
    isFetching: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEcFilters.mockReturnValue({ region: 'us-west' })
    mockUseTableQuery.mockReturnValue(mockTableQuery)
  })

  it('should render correctly', () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <CustomerSelectionForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )

    expect(screen.getByText('Select Customers')).toBeVisible()
    expect(screen.getByText('Select the customers this service will be applied to')).toBeVisible()
    expect(screen.getByTestId('description-wrapper')).toBeVisible()
  })

  it('should render table with correct columns', () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <CustomerSelectionForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )

    expect(screen.getByText('Customer Name')).toBeVisible()
    expect(screen.getByText('Address')).toBeVisible()
  })

  it('should display customer data in table', () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <CustomerSelectionForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )

    expect(screen.getByText('Customer A')).toBeVisible()
    expect(screen.getByText('Customer B')).toBeVisible()
    expect(screen.getByText('123 Main St')).toBeVisible()
    expect(screen.getByText('456 Oak Ave')).toBeVisible()
  })

  it('should call useTableQuery with correct parameters', () => {
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <CustomerSelectionForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )

    // Verify useTableQuery was called with the expected parameters
    expect(mockUseTableQuery).toHaveBeenCalledWith({
      useQuery: expect.any(Function),
      defaultPayload: {
        filters: { region: 'us-west' },
        mustNotMatchField: [{ field: 'accountTier', value: 'Silver' }],
        fields: ['id', 'name', 'status', 'streetAddress', 'tenantType']
      },
      search: {
        searchTargetFields: ['name'],
        searchString: ''
      }
    })
  })

  it('should handle form value changes', async () => {
    const { result } = renderHook(() => Form.useForm()[0])
    render(
      <Provider>
        <StepsForm form={result.current}>
          <StepsForm.StepForm>
            <CustomerSelectionForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>
    )

    const customerA = await screen.findByRole('row', { name: /Customer A/i })
    await userEvent.click(customerA)
    expect(result.current.getFieldValue('ecTenantIds')).toEqual(['customer-1'])
  })
})
