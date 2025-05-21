import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                                      from '@acx-ui/feature-toggle'
import { softGreApi }                                                        from '@acx-ui/rc/services'
import { SoftGreUrls }                                                       from '@acx-ui/rc/utils'
import { Path }                                                              from '@acx-ui/react-router-dom'
import { Provider, store }                                                   from '@acx-ui/store'
import { mockServer, render, screen, renderHook, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockSoftGreTable }   from './__tests__/fixtures'
import { SoftGreSettingForm } from './SoftGreSettingForm'


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: ():Path => mockedTenantPath
}))

const editViewPath = '/:tenantId/t/policies/SoftGre/:policyId/edit'
const createViewPath = '/:tenantId/t/policies/SoftGre/create'

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  policyId: '0d89c0f5596c4689900fb7f5f53a0859'
}

const user = userEvent.setup()

describe('SoftGreSettingForm', () => {
  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())

    mockServer.use(
      rest.post(
        SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockSoftGreTable.data))
      )
    )
  })

  it('should show error message while SoftGre Name is duplicated', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })

    render(
      <Provider>
        <Form form={formRef.current}><SoftGreSettingForm /></Form>
      </Provider>,
      { route: { path: editViewPath, params } }
    )

    const policyNameField = await screen.findByLabelText(/Profile Name/i)
    await user.clear(policyNameField)
    await user.type(policyNameField, 'softGreProfileName2')
    await user.tab()

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    expect(await screen.findByText('SoftGRE with that name already exists')).toBeVisible()
  })

  it('should validate gateway address successfully', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current}><SoftGreSettingForm /></Form>
      </Provider>,
      { route: { path: createViewPath, params } }
    )
    const profileNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(profileNameField, '123')
    // eslint-disable-next-line max-len
    const primaryGatewayField = screen.getByRole('textbox', { name: /Primary Gateway/i })
    await user.type(primaryGatewayField,'128.0.0')
    const errMsg = await screen.findByText('Please enter a valid IP address or FQDN')
    expect(errMsg).toBeVisible()

    await user.clear(primaryGatewayField)
    await user.type(primaryGatewayField,'128.0.0.1')
    expect(errMsg).not.toBeInTheDocument()
  })


  it('should primary and secondary gateway address different', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}><SoftGreSettingForm /></Form>
      </Provider>,
      { route: { path: createViewPath, params } }
    )
    const profileNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(profileNameField, 'Test-validation gateways different')
    // eslint-disable-next-line max-len
    const primaryGatewayField = screen.getByRole('textbox', { name: /Primary Gateway/i })
    await user.type(primaryGatewayField,'128.0.0.0')
    // eslint-disable-next-line max-len
    const secondaryGatewayField = screen.getByRole('textbox', { name: /Secondary Gateway/i })
    await user.type(secondaryGatewayField,'128.0.0.0')
    // eslint-disable-next-line max-len
    const errMsg = await screen.findByText('Primary and secondary gateways must be different. Please enter a new gateway IP address or FQDN.')
    expect(errMsg).toBeVisible()

    await user.clear(secondaryGatewayField)
    await user.type(secondaryGatewayField,'128.0.0.1')
    expect(errMsg).not.toBeInTheDocument()
  })

  it('renders the Fallback to Primary Gateway toggle', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}><SoftGreSettingForm /></Form>
      </Provider>,
      { route: { path: createViewPath, params } }
    )
    expect(screen.getByText(/Fallback to Primary Gateway/i)).toBeInTheDocument()
    expect(screen.getByTestId('gateway-failback-toggle')).toBeInTheDocument()
  })

  it('shows Primary Availability Check Interval input when fallback is enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}><SoftGreSettingForm /></Form>
      </Provider>,
      { route: { path: createViewPath, params } }
    )
    const toggle = screen.getByTestId('gateway-failback-toggle')
    await user.click(toggle)
    expect(screen.getByTestId('primary-availability-check-input')).toBeEnabled()
  })

  it('hides Primary Availability Check Interval input when fallback is disabled', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}><SoftGreSettingForm /></Form>
      </Provider>,
      { route: { path: createViewPath, params } }
    )
    expect(screen.queryByText(/Primary Availability Check Interval/i)).not.toBeInTheDocument()
    const toggle = screen.getByTestId('gateway-failback-toggle')
    user.click(toggle) // enable
    user.click(toggle) // disable
    expect(screen.queryByText(/Primary Availability Check Interval/i)).not.toBeInTheDocument()
  })

  it('validates Primary Availability Check Interval is between 60 and 1440', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}><SoftGreSettingForm /></Form>
      </Provider>,
      { route: { path: createViewPath, params } }
    )
    const toggle = screen.getByTestId('gateway-failback-toggle')
    await user.click(toggle)

    // Find the interval input
    const input = screen.getByTestId('primary-availability-check-input')

    // Try a value below the minimum
    await user.clear(input)
    await user.type(input, '30')
    input.blur()
    expect(await screen.findByText(/must be between 60 and 1440/i)).toBeInTheDocument()

    // Try a value above the maximum
    await user.clear(input)
    await user.type(input, '2000')
    input.blur()
    expect(await screen.findByText(/must be between 60 and 1440/i)).toBeInTheDocument()

    // Try a valid value
    await user.clear(input)
    await user.type(input, '120')
    input.blur()
    expect(screen.queryByText(/must be between 60 and 1440/i)).not.toBeInTheDocument()
  })
})
