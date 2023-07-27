import '@testing-library/jest-dom'

import { renderHook } from '@testing-library/react'
import userEvent      from '@testing-library/user-event'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ServiceType,
  getSelectServiceRoutePath,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { Path, To, useTenantLink } from '@acx-ui/react-router-dom'
import { render, screen }          from '@acx-ui/test-utils'

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

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <SelectServiceForm />, {
        route: { params, path }
      }
    )
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Services'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
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
})
