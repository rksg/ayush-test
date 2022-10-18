import '@testing-library/jest-dom'

import { renderHook } from '@testing-library/react'
import userEvent      from '@testing-library/user-event'

import { ServiceType }             from '@acx-ui/rc/utils'
import { Path, To, useTenantLink } from '@acx-ui/react-router-dom'
import { render, screen }          from '@acx-ui/test-utils'

import { getSelectServiceRoutePath, getServiceListRoutePath, getServiceRoutePath, ServiceOperation } from '../serviceRouteUtils'

import { SelectServiceForm } from '.'

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
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }
  const path = '/:tenantId/' + getSelectServiceRoutePath()

  it('should render form', async () => {
    const { asFragment } = render(
      <SelectServiceForm />, {
        route: { params, path }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to the correct service page', async () => {
    render(
      <SelectServiceForm />, {
        route: { params, path }
      }
    )

    const wifiCallingRadio = screen.getByRole('radio', { name: /Wi-Fi Calling/ })
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
