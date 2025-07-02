import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider, store }                     from '@acx-ui/store'
import { render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import { mockSoftGreTable, mockIpSecTable } from './__tests__/fixtures'
import { NetworkTunnelTypeEnum }            from './types'

jest.resetModules()
jest.doMock('@acx-ui/rc/services', () => ({
  useGetSoftGreOptionsQuery: jest.fn(() => ({
    data: mockSoftGreTable,
    isLoading: false,
    isError: false
  })),
  useLazyGetSoftGreOptionsQuery: jest.fn(() => [jest.fn(), {}]),
  useGetIpsecOptionsQuery: jest.fn(() => ({
    data: mockIpSecTable.data,
    isLoading: false,
    isError: false
  })),
  useLazyGetIpsecOptionsQuery: jest.fn(() => [jest.fn(), {}])
}))

const WifiSoftGreSelectOption = require('./WifiSoftGreSelectOption').default
const viewPath = '/:tenantId/t/venues/:venueId/venue-details/networks'
const tenantId = 'tenantId'

describe('WifiSoftGreSelectOption - jest mock only (safe context)', () => {
  it('renders and selects softGRE profile correctly', async () => {
    const venueId = 'venue-id'
    const networkId = 'network-id'
    const { result: formRef } = renderHook(() => Form.useForm()[0])

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

    await screen.findByRole('combobox')
    await userEvent.selectOptions(screen.getByRole('combobox'), 'softGreProfileName2')

    expect(formRef.current.getFieldsValue().softGre.newProfileId)
      .toBe('75aa5131892d44a6a85a623dd3e524ed')
  })
})
