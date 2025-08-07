import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { ipSecApi, softGreApi, useLazyGetSoftGreOptionsQuery } from '@acx-ui/rc/services'
import { IpsecUrls, SoftGreUrls }                              from '@acx-ui/rc/utils'
import { Provider, store }                                     from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor }     from '@acx-ui/test-utils'

import { mockSoftGreTable, mockIpSecTable } from './__tests__/fixtures'
import { NetworkTunnelTypeEnum }            from './types'
import WifiSoftGreSelectOption              from './WifiSoftGreSelectOption'


const viewPath = '/:tenantId/t/venues/:venueId/venue-details/networks'
jest.mock('../policies/SoftGre/SoftGreForm/SoftGreDrawer', () => ({
  ...jest.requireActual('../policies/SoftGre/SoftGreForm/SoftGreDrawer'),
  default: () => <div data-testid={'rc-SoftGreDrawer'} title='SoftGreDrawer' />
}))

jest.mock('../policies/Ipsec/IpsecForm/IpsecAddDrawer', () => ({
  ...jest.requireActual('../policies/Ipsec/IpsecForm/IpsecAddDrawer'),
  default: () => <div data-testid={'rc-IpsecDrawer'} title='IpsecDrawer' />
}))

jest.mock('../policies/Ipsec/IpsecForm/IpsecDetailsDrawer', () => ({
  ...jest.requireActual('../policies/Ipsec/IpsecForm/IpsecDetailsDrawer'),
  // eslint-disable-next-line max-len
  IpsecDetailsDrawer: () => <div data-testid={'rc-IpsecDetailsDrawer'} title='IpsecDetailsDrawercDrawer' />
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown, disabled: boolean }>
  loading?: boolean
  dropdownClassName?: string
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {options?.map((option, index) => (
        <option key={`option-${index}`}
          value={option.value as string}
          disabled={option.disabled}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useLazyGetIpsecOptionsQuery: jest.fn().mockReturnValue([
    () => ({ unwrap: jest.fn().mockResolvedValue({ options: mockIpSecTable.data.data }) })
  ]),
  useLazyGetSoftGreOptionsQuery: jest.fn().mockReturnValue([
    () => ({ unwrap: jest.fn().mockResolvedValue({
      options: mockSoftGreTable.data,
      id: '',
      gatewayIps: [],
      activationProfiles: []
    }) })
  ])
}))

const tenantId = 'tenantId'
describe('WifiSoftGreSelectOption', () => {
  const mockedSoftGreFn = jest.fn()
  const mockedIpSecFn = jest.fn()

  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())
    store.dispatch(ipSecApi.util.resetApiState())
    mockedSoftGreFn.mockClear()
    mockedIpSecFn.mockClear()

    mockServer.use(
      rest.post(
        SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => {
          mockedSoftGreFn()
          return res(ctx.json(mockSoftGreTable))
        }),
      rest.post(
        IpsecUrls.getIpsecViewDataList.url,
        (_, res, ctx) => {
          mockedIpSecFn()
          return res(ctx.json(mockIpSecTable.data))
        })
    )
  })

  it('should correctly render softGRE tunneling', async () => {
    const venueId = 'venueId-2'
    const networkId = 'network_0'
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <WifiSoftGreSelectOption
            currentTunnelType={NetworkTunnelTypeEnum.SoftGre}
            venueId={venueId}
            networkId={networkId}
            cachedSoftGre={[]}
          />
        </Form>
      </Provider>,
      { route: { path: viewPath, params: { venueId, tenantId } } }
    )

    await waitFor(() => expect(mockedSoftGreFn).toBeCalled())
    expect(await screen.findByRole('button', { name: /Add/i })).toBeEnabled()
    expect(await screen.findByRole('button', { name: /Profile details/i })).not.toBeEnabled()

    await userEvent.selectOptions(await screen.findByRole('combobox'),
      await screen.findByRole('option', { name: 'softGreProfileName1' }))

    expect(await screen.findByRole('button', { name: /Profile details/i })).toBeEnabled()
    expect(formRef.current.getFieldsValue()).toEqual({
      ipsec: {
        enableIpsec: false
      },
      softGre: {
        newProfileId: '0d89c0f5596c4689900fb7f5f53a0859'
      }
    })

    await waitFor(() => expect(mockedSoftGreFn).toBeCalledTimes(4))
    expect(mockedIpSecFn).toBeCalledTimes(4)
  })

  it('should correctly render softGRE tunneling selected', async () => {
    const venueId = 'venueId-1'
    const networkId = 'network_1'
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <WifiSoftGreSelectOption
            currentTunnelType={NetworkTunnelTypeEnum.SoftGre}
            venueId={venueId}
            networkId={networkId}
            cachedSoftGre={[]}
          />
        </Form>
      </Provider>,
      { route: { path: viewPath, params: { venueId, tenantId } } }
    )
    await waitFor(() => expect(mockedSoftGreFn).toBeCalled())
    await waitFor(async () => expect(await screen.findByRole('button',
      { name: /Profile details/i }
    )).toBeEnabled())
    expect(formRef.current.getFieldsValue()).toEqual({
      ipsec: {
        enableIpsec: false
      },
      softGre: {
        newProfileId: '0d89c0f5596c4689900fb7f5f53a0859'
      }
    })
    await userEvent.selectOptions(await screen.findByRole('combobox'),'softGreProfileName2')
    expect(await screen.findByRole('button', { name: /Profile details/i })).toBeEnabled()
    expect(formRef.current.getFieldsValue()).toEqual({
      ipsec: {
        enableIpsec: false
      },
      softGre: {
        newProfileId: '75aa5131892d44a6a85a623dd3e524ed'
      }
    })
    expect(await screen.findByRole('option', { name: 'softGreProfileName4' })).toBeDisabled()
    await waitFor(() => expect(mockedSoftGreFn).toBeCalledTimes(5))
    expect(mockedIpSecFn).toBeCalledTimes(5)
  })

  it('should show error render softGRE tunneling selected(Non-profile)', async () => {
    const venueId = 'venueId-2'
    // a networkId that not exist in any activation
    const networkId = 'network_9'
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <WifiSoftGreSelectOption
            currentTunnelType={NetworkTunnelTypeEnum.SoftGre}
            venueId={venueId}
            networkId={networkId}
            cachedSoftGre={[]}
          />
        </Form>
      </Provider>,
      { route: { path: viewPath, params: { venueId, tenantId } } }
    )

    expect(await screen.findByRole('button', { name: /Add/i })).toBeEnabled()
    expect(await screen.findByRole('button', { name: /Profile details/i })).not.toBeEnabled()
    await userEvent.selectOptions(await screen.findByRole('combobox'),
      await screen.findByRole('option', { name: 'softGreProfileName3' }))
    expect(await screen.findByRole('button', { name: /Profile details/i })).toBeEnabled()
    expect(await screen.findByText(/Please choose a different one./)).toBeVisible()
    await userEvent.selectOptions(await screen.findByRole('combobox'),
      await screen.findByRole('option', { name: 'softGreProfileName4' }))
    await waitFor(() => expect(screen.queryByText(/Please choose a different one./)).toBeNull())

    await waitFor(() => expect(mockedSoftGreFn).toBeCalledTimes(5))
    expect(mockedIpSecFn).toBeCalledTimes(5)
  })

  it('should show error render softGRE tunneling selected(Exist-profile)', async () => {
    const venueId = 'venueId-2'
    const networkId = 'network_7'
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })

    const mockData = mockSoftGreTable.data.filter(d =>
      d.activations.find(a => a.venueId === venueId && a.wifiNetworkIds.includes(networkId)))

    jest.mocked(useLazyGetSoftGreOptionsQuery).mockImplementation(jest.fn().mockReturnValue([
      () => ({ unwrap: jest.fn().mockResolvedValue({
        options: mockSoftGreTable.data,
        id: mockSoftGreTable.data[0].id,
        // eslint-disable-next-line max-len
        gatewayIps: mockData.flatMap((item) => [item.primaryGatewayAddress, item.secondaryGatewayAddress ?? '']),
        activationProfiles: mockData.map(d => d.id)
      }) })
    ]))

    render(
      <Provider>
        <Form form={formRef.current}>
          <WifiSoftGreSelectOption
            currentTunnelType={NetworkTunnelTypeEnum.SoftGre}
            venueId={venueId}
            networkId={networkId}
            cachedSoftGre={[]}
          />
        </Form>
      </Provider>,
      { route: { path: viewPath, params: { venueId, tenantId } } }
    )

    expect(await screen.findByRole('button', { name: /Add/i })).toBeEnabled()
    expect(await screen.findByRole('button', { name: /Profile details/i })).not.toBeEnabled()
    await waitFor(() => expect(mockedSoftGreFn).toBeCalled())
    await waitFor(async () => expect(await screen.findByRole('button',
      { name: /Profile details/i }
    )).toBeEnabled())
    expect(formRef.current.getFieldsValue()).toEqual({
      ipsec: {
        enableIpsec: false
      },
      softGre: {
        newProfileId: 'softGreProfileName4-id'
      }
    })
    expect(screen.queryByText(/Please choose a different one./)).toBeNull()
    await userEvent.selectOptions(await screen.findByRole('combobox'),'softGreProfileName3')
    expect(await screen.findByRole('button', { name: /Profile details/i })).toBeEnabled()
    expect(await screen.findByText(/Please choose a different one./)).toBeVisible()
    await userEvent.selectOptions(await screen.findByRole('combobox'),'softGreProfileName2')
    expect(formRef.current.getFieldsValue()).toEqual({
      ipsec: {
        enableIpsec: false
      },
      softGre: {
        newProfileId: '75aa5131892d44a6a85a623dd3e524ed'
      }
    })
    await waitFor(() => expect(screen.queryByText(/Please choose a different one./)).toBeNull())

    await waitFor(() => expect(mockedSoftGreFn).toBeCalledTimes(6))
    expect(mockedIpSecFn).toBeCalledTimes(6)
  })

  it(`should all profiles can be selected
    since only one network is used`, async () => {
    const venueId = 'venueId-1'
    const networkId = 'network_6'
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <WifiSoftGreSelectOption
            currentTunnelType={NetworkTunnelTypeEnum.SoftGre}
            venueId={venueId}
            networkId={networkId}
            cachedSoftGre={[]}
          />
        </Form>
      </Provider>,
      { route: { path: viewPath, params: { venueId, tenantId } } }
    )

    expect(await screen.findByRole('option', { name: 'softGreProfileName1' })).toBeEnabled()
    expect(await screen.findByRole('option', { name: 'softGreProfileName2' })).toBeEnabled()
    expect(await screen.findByRole('option', { name: 'softGreProfileName3' })).toBeEnabled()
    expect(await screen.findByRole('option', { name: 'softGreProfileName4' })).toBeEnabled()

    await waitFor(() => expect(mockedSoftGreFn).toBeCalledTimes(4))
    expect(mockedIpSecFn).toBeCalledTimes(4)
  })


  it(`should only 3 profiles are selected,
    since the Venue/Map/Network activations reached the maximum 3`, async () => {
    const venueId = 'venueId-3'
    const networkId = 'network_13'
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <WifiSoftGreSelectOption
            currentTunnelType={NetworkTunnelTypeEnum.SoftGre}
            venueId={venueId}
            networkId={networkId}
            cachedSoftGre={[]}
          />
        </Form>
      </Provider>,
      { route: { path: viewPath, params: { venueId, tenantId } } }
    )

    expect(await screen.findByRole('option', { name: 'softGreProfileName1' })).toBeDisabled()
    expect(await screen.findByRole('option', { name: 'softGreProfileName2' })).toBeDisabled()
    expect(await screen.findByRole('option', { name: 'softGreProfileName3' })).toBeDisabled()
    expect(await screen.findByRole('option', { name: 'softGreProfileName4' })).toBeDisabled()
    expect(await screen.findByRole('option', { name: 'softGreProfileName5' })).toBeEnabled()
    expect(await screen.findByRole('option', { name: 'softGreProfileName6' })).toBeEnabled()
    expect(await screen.findByRole('option', { name: 'softGreProfileName7' })).toBeEnabled()

    await waitFor(() => expect(mockedSoftGreFn).toBeCalledTimes(3))
    expect(mockedIpSecFn).toBeCalledTimes(3)
  })
})
