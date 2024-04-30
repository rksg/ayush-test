import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  ServiceType,
  getSelectServiceRoutePath,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink }   from '@acx-ui/react-router-dom'
import { render,renderHook, screen } from '@acx-ui/test-utils'

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
    jest.mocked(useIsSplitOn).mockImplementation(featureFlag => {
      return featureFlag === Features.EDGE_HA_TOGGLE
        || featureFlag !== Features.EDGE_DHCP_HA_TOGGLE
    })

    render(
      <SelectServiceForm />, {
        route: { params, path }
      }
    )

    expect(screen.queryByText('DHCP for SmartEdge')).toBeNull()
  })

  it('should not render edge-pin with the HA-FF ON and pin-HA-FF OFF', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation(featureFlag => {
      return featureFlag === Features.EDGE_HA_TOGGLE
        || featureFlag !== Features.EDGE_PIN_HA_TOGGLE
    })

    render(
      <SelectServiceForm />, {
        route: { params, path }
      }
    )

    expect(screen.queryByText('Personal Identity Network')).toBeNull()
  })
})
