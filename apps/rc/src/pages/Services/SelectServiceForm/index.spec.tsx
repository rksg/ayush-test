import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Features, useIsBetaEnabled, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                      from '@acx-ui/rc/components'
import {
  getSelectServiceRoutePath,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink }    from '@acx-ui/react-router-dom'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import SelectServiceForm from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(),
  useIsTierAllowed: jest.fn(),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
}))

describe('Select Service Form', () => {

  jest.mocked(useIsSplitOn).mockReturnValue(true)

  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }
  const path = '/:tenantId/' + getSelectServiceRoutePath()

  it('should navigate to the correct service page', async () => {
    render(
      <SelectServiceForm />, {
        route: { params, path }
      }
    )

    const wifiCallingRadio = screen.getByDisplayValue(/Wi-Fi Calling/)
    const submitButton = screen.getByRole('button', { name: 'Next' })

    await userEvent.click(wifiCallingRadio)
    await userEvent.click(submitButton)

    const serviceCreatePath = getServiceRoutePath({
      type: ServiceType.WIFI_CALLING,
      oper: ServiceOperation.CREATE
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${serviceCreatePath}`
    })
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <SelectServiceForm />, {
        route: { params, path }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })

  it('should navigate to the service list when cancel the form', async () => {
    const { result } = renderHook(() => useTenantLink(getServiceListRoutePath(true)))

    render(
      <SelectServiceForm />, {
        route: { params, path }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith(result.current)
  })

  it('should not render edge-dhcp with the HA-FF ON and dhcp-HA-FF OFF', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff => ff === Features.EDGE_HA_TOGGLE
              || ff !== Features.EDGE_DHCP_HA_TOGGLE)

    render(<SelectServiceForm />, {
      route: { params, path }
    })

    expect(screen.queryByText('DHCP for SmartEdge')).toBeNull()
  })

  it('should not render edge-pin with the HA-FF ON and pin-HA-FF OFF', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff => ff === Features.EDGE_HA_TOGGLE
              || ff !== Features.EDGE_PIN_HA_TOGGLE)

    render(<SelectServiceForm />, {
      route: { params, path }
    })

    expect(screen.queryByText('Personal Identity Network')).toBeNull()
  })

  it('should not render features bound with FF when FF OFF', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)

    render(<SelectServiceForm />, {
      route: { params, path }
    })

    expect(screen.queryByText('mDNS Proxy for RUCKUS Edge')).toBeNull()
    expect(screen.queryByText('Personal Identity Network')).toBeNull()
    expect(screen.queryByText('Thirdparty Network Management')).toBeNull()
  })

  it('should display Edge mDNS service when its FF ON', async () => {
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff => ff === Features.EDGE_MDNS_PROXY_TOGGLE
              || ff === Features.EDGES_TOGGLE)
    jest.mocked(useIsBetaEnabled).mockReturnValue(true)
    render(<SelectServiceForm />, {
      route: { params, path }
    })

    expect(screen.getByText('mDNS Proxy for RUCKUS Edge')).toBeVisible()
    expect(await screen.findByTestId('RocketOutlined')).toBeVisible()
  })

  it('should display Edge TNM service when its FF ON', async () => {
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff => ff === Features.EDGE_THIRDPARTY_MGMT_TOGGLE
        || ff === Features.EDGES_TOGGLE)
    render(<SelectServiceForm />, {
      route: { params, path }
    })

    expect(screen.getByText('Thirdparty Network Management')).toBeVisible()
  })

  describe('Edge OLT', () => {
    it('should render Edge OLT when FF is ON', async () => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_NOKIA_OLT_MGMT_TOGGLE)

      render(<SelectServiceForm />, {
        route: { params, path }
      })

      await screen.findByText('NOKIA GPON Services')
    })

    it('should not render Edge OLT when FF is OFF', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)

      render(<SelectServiceForm />, {
        route: { params, path }
      })

      expect(screen.queryByText('NOKIA GPON Services')).toBeNull()
    })
  })
})