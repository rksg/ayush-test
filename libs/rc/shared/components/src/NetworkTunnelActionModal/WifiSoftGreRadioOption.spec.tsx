import { Form } from 'antd'
import { rest } from 'msw'

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
    const venueId = 'venueId-1'
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
          />
        </Form>
      </Provider>,
      { route: { path: viewPath, params: { venueId, tenantId } } }
    )

    await waitFor(() => expect(mockedGetFn).toBeCalled())
    expect(await screen.findByRole('button', { name: /Add/i })).toBeEnabled()
    expect(await screen.findByRole('button', { name: /Profile details/i })).not.toBeEnabled()
    // const selector = await screen.findByRole('combobox')
    // await userEvent.click(selector)
    // await userEvent.selectOptions(selector, 'softGreProfileName1')
    // await userEvent.selectOptions(
    //   await screen.findByRole('combobox'),
    //   await screen.findByRole('option', { name: 'softGreProfileName1' }))
    // { value: '0d89c0f5596c4689900fb7f5f53a0859', label: 'softGreProfileName1' })

    // expect(await screen.findByRole('button', { name: /Profile details/i })).toBeEnabled()
    // expect(formRef.current.getFieldsValue()).toEqual({})
  })

})