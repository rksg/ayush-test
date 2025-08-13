import { useEffect } from 'react'

import userEvent       from '@testing-library/user-event'
import { Form, Input } from 'antd'

import { getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                           from '@acx-ui/store'
import { render, screen, waitFor }                            from '@acx-ui/test-utils'

import { EdgeSdLanForm, EdgeSdLanFormProps } from '../../Form'
import { ApplyTo }                           from '../Form/GeneralForm'

import { EditEdgeSdLan } from '.'

const MockMspEdgeSdLanFormContainer = (props: EdgeSdLanFormProps) => {
  const { form, ...rest } = props
  useEffect(() => {
    form.setFieldsValue({ applyTo: [ApplyTo.MY_ACCOUNT, ApplyTo.MY_CUSTOMERS] })
  }, [form])
  return <EdgeSdLanForm form={form} {...rest}/>
}

jest.mock('../Form', () => ({
  MspEdgeSdLanFormContainer: (props: EdgeSdLanFormProps) =>
    <MockMspEdgeSdLanFormContainer {...props}/>
}))

const MockGeneralForm = () => <Form.Item
  name='applyTo'
  children={<Input />}
/>
jest.mock('../Form/GeneralForm', () => ({
  ...jest.requireActual('../Form/GeneralForm'),
  GeneralForm: () => <div data-testid='general-form'>
    <MockGeneralForm />
  </div>
}))

jest.mock('../Form/NetworkSelectionForm', () => ({
  ...jest.requireActual('../Form/NetworkSelectionForm'),
  NetworkSelectionForm: () => <div data-testid='network-selection-form'>NetworkSelectionForm</div>
}))

jest.mock('../Form/CustomerSelectionForm', () => ({
  ...jest.requireActual('../Form/CustomerSelectionForm'),
  // eslint-disable-next-line max-len
  CustomerSelectionForm: () => <div data-testid='customer-selection-form'>CustomerSelectionForm</div>
}))

const mockUpdateEdgeSdLan = jest.fn()
jest.mock('@acx-ui/edge/components', () => ({
  ...jest.requireActual('@acx-ui/edge/components'),
  useEdgeSdLanActions: () => ({
    updateEdgeSdLan: mockUpdateEdgeSdLan
  })
}))

const mockUseGetEdgeMvSdLanViewDataListQuery = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetEdgeMvSdLanViewDataListQuery: () => mockUseGetEdgeMvSdLanViewDataListQuery()
}))

const mockedUsedNavigate = jest.fn()
const mockedUseParams = jest.fn()
const mockedUseTenantLink = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: () => mockedUseParams(),
  useTenantLink: () => mockedUseTenantLink()
}))

describe('EditEdgeSdLan - MSP', () => {
  const params = { tenantId: 'tenant-id', serviceId: 'service-123' }
  const mockLinkToServiceList = {
    pathname: `/${params.tenantId}/t/` + getServiceRoutePath({
      type: ServiceType.EDGE_SD_LAN, oper: ServiceOperation.LIST
    }),
    hash: '',
    search: ''
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseParams.mockReturnValue(params)
    mockedUseTenantLink.mockReturnValue(mockLinkToServiceList)
    mockUpdateEdgeSdLan.mockImplementation((originData, { callback }) => {
      // Simulate successful API call
      callback([{ success: true }])
      return Promise.resolve()
    })
  })

  // eslint-disable-next-line max-len
  it('should render form without customer selection step when tunnelTemplateId does not exist', () => {
    const mockData = {
      id: 'service-123',
      name: 'Test SD-LAN',
      tunnelTemplateId: undefined,
      tunneledWlans: [
        { wlanId: 'wlan-1', isTemplate: false },
        { wlanId: 'wlan-2', isTemplate: false }
      ]
    }

    mockUseGetEdgeMvSdLanViewDataListQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false
    })

    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: { path: '/:tenantId/t/services/:serviceId/edit', params }
    })

    expect(screen.getByTestId('general-form')).toBeVisible()
    // Should not have customer selection step
    expect(screen.queryByTestId('customer-selection-form'))
      .not.toBeInTheDocument()
  })

  it('should render form with customer selection step when tunnelTemplateId exists', () => {
    const mockData = {
      id: 'service-123',
      name: 'Test SD-LAN',
      tunnelTemplateId: 'template-123',
      tunneledWlans: [
        { wlanId: 'wlan-1', isTemplate: true },
        { wlanId: 'wlan-2', isTemplate: false }
      ]
    }

    mockUseGetEdgeMvSdLanViewDataListQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false
    })

    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: { path: '/:tenantId/t/services/:serviceId/edit', params }
    })

    expect(screen.getByTestId('general-form')).toBeVisible()
    // Should have customer selection step in the steps list
    expect(screen.getByText('Select Customers')).toBeInTheDocument()
  })

  it('should call updateEdgeSdLan and navigate when form is submitted', async () => {
    const mockData = {
      id: 'service-123',
      name: 'Test SD-LAN',
      tunnelTemplateId: 'template-123',
      tunneledWlans: [
        { wlanId: 'wlan-1', isTemplate: true },
        { wlanId: 'wlan-2', isTemplate: false }
      ]
    }

    mockUseGetEdgeMvSdLanViewDataListQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false
    })

    render(<Provider>
      <EditEdgeSdLan />
    </Provider>, {
      route: { path: '/:tenantId/t/services/:serviceId/edit', params }
    })

    expect(screen.getByTestId('general-form')).toBeVisible()
    await userEvent.click(screen.getByText('Apply'))

    await waitFor(() => {
      expect(mockUpdateEdgeSdLan).toHaveBeenCalledWith(
        expect.any(Object), // originData
        expect.objectContaining({
          payload: expect.any(Object),
          callback: expect.any(Function)
        }),
        true // isMsp
      )
    })
    expect(mockedUsedNavigate).toHaveBeenCalledWith(mockLinkToServiceList, { replace: true })
  })
})
