import '@testing-library/jest-dom'

import { Form } from 'antd'

import { getConfigTemplatePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { handlers }  from './__tests__/fixtures'
import VenueDHCPForm from './VenueDHCPForm'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

const mockedResolveTenantTypeFromPath = jest.fn()
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  resolveTenantTypeFromPath: () => mockedResolveTenantTypeFromPath()
}))

describe('Venue DHCP Form', () => {

  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    mockedResolveTenantTypeFromPath.mockReturnValue('t')
  })

  it('should render DHCP Form instance correctly', async () => {
    mockServer.use(...handlers)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    const params = { tenantId: 'tenant-id', venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b' }
    // eslint-disable-next-line max-len
    const addDhcpPath = getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE })
    // eslint-disable-next-line react/jsx-no-undef
    render(<Provider><VenueDHCPForm form={formRef.current} /></Provider>, {
      route: { params }
    })

    expect(await screen.findByText('DHCP service')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Add DHCP for Wi-Fi Service' }))
      .toHaveAttribute('href', `/${params.tenantId}/t/${addDhcpPath}`)
  })

  it('should render DHCP Form instance for Config Template correctly', async () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    mockedResolveTenantTypeFromPath.mockReturnValue('v')

    mockServer.use(...handlers)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    const params = { tenantId: 'tenant-id', venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b' }
    // eslint-disable-next-line max-len
    const addDhcpConfigTemplatePath = getConfigTemplatePath(getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE }))
    // eslint-disable-next-line react/jsx-no-undef
    render(<Provider><VenueDHCPForm form={formRef.current} /></Provider>, {
      route: { params }
    })

    expect(screen.getByRole('link', { name: 'Add DHCP for Wi-Fi Service' }))
      .toHaveAttribute('href', `/${params.tenantId}/v/${addDhcpConfigTemplatePath}`)
  })
})
