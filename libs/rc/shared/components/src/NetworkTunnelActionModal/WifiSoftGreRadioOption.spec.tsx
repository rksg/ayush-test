import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { softGreApi }                                      from '@acx-ui/rc/services'
import { SoftGreUrls }                                     from '@acx-ui/rc/utils'
import { Provider, store }                                 from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import { mockSoftGreTable }      from './__tests__/fixtures'
import { NetworkTunnelTypeEnum } from './types'
import WifiSoftGreRadioOption    from './WifiSoftGreRadioOption'


const viewPath = '/:tenantId/t/venues/:venueId/venue-details/networks'
jest.mock('../policies/SoftGre/SoftGreForm/SoftGreDrawer', () => ({
  ...jest.requireActual('../policies/SoftGre/SoftGreForm/SoftGreDrawer'),
  default: () => <div data-testid={'rc-SoftGreDrawer'} title='SoftGreDrawer' />
}))
const tenantId = 'tenantId'
describe('WifiSoftGreRadioOption', () => {
  const mockedGetFn = jest.fn()
  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())
    mockedGetFn.mockClear()
    mockServer.use(
      rest.post(
        SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => {
          mockedGetFn()
          return res(ctx.json(mockSoftGreTable))
        })
    )}
  )

  it('should correctly render softGRE tunneling', async () => {
    const venueId = 'venueId-2'
    const networkId = 'network_0'
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <WifiSoftGreRadioOption
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
    await waitFor(() => expect(mockedGetFn).toBeCalled())
    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(await screen.findByText('softGreProfileName1'))
    expect(await screen.findByRole('button', { name: /Profile details/i })).toBeEnabled()
    expect(formRef.current.getFieldsValue()).toEqual({
      softGre: {
        newProfileId: '0d89c0f5596c4689900fb7f5f53a0859'
      }
    })
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
          <WifiSoftGreRadioOption
            currentTunnelType={NetworkTunnelTypeEnum.SoftGre}
            venueId={venueId}
            networkId={networkId}
            cachedSoftGre={[]}
          />
        </Form>
      </Provider>,
      { route: { path: viewPath, params: { venueId, tenantId } } }
    )
    await waitFor(() => expect(mockedGetFn).toBeCalled())
    await waitFor(async () => expect(await screen.findByRole('button',
      { name: /Profile details/i }
    )).toBeEnabled())
    expect(formRef.current.getFieldsValue()).toEqual({
      softGre: {
        newProfileId: '0d89c0f5596c4689900fb7f5f53a0859'
      }
    })
    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(await screen.findByText('softGreProfileName2'))
    expect(await screen.findByRole('button', { name: /Profile details/i })).toBeEnabled()
    expect(formRef.current.getFieldsValue()).toEqual({
      softGre: {
        newProfileId: '75aa5131892d44a6a85a623dd3e524ed'
      }
    })
  })

  it('should show error render softGRE tunneling selected', async () => {
    const venueId = 'venueId-2'
    const networkId = 'network_7'
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <WifiSoftGreRadioOption
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
    await waitFor(() => expect(mockedGetFn).toBeCalled())
    await waitFor(async () => expect(await screen.findByRole('button',
      { name: /Profile details/i }
    )).toBeEnabled())
    expect(formRef.current.getFieldsValue()).toEqual({
      softGre: {
        newProfileId: 'softGreProfileName4-id'
      }
    })
    await userEvent.click(await screen.findByRole('combobox'))
    await userEvent.click(await screen.findByText('softGreProfileName3'))
    expect(await screen.findByRole('button', { name: /Profile details/i })).toBeEnabled()
    expect(await screen.findByText(/Please choose a different one./)).toBeVisible()
  })
})