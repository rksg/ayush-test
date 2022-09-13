import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { ServiceType }    from '@acx-ui/rc/utils'
import { Path }           from '@acx-ui/react-router-dom'
import { render, screen } from '@acx-ui/test-utils'

import { getServiceRoutePath, ServiceOperation } from '../serviceRouteUtils'

import { SelectServiceForm } from '.'

const mockedUsedNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('Select Service Form', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render form', async () => {
    const { asFragment } = render(
      <SelectServiceForm />, {
        route: { params, path: '/:tenantId/services/select' }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to the correct service page', async () => {
    render(
      <SelectServiceForm />, {
        route: { params, path: '/:tenantId/services/select' }
      }
    )

    const wifiCallingRadio = screen.getByRole('radio', { name: /Wi-Fi Calling/ })
    const submitButton = screen.getByRole('button', { name: 'Finish' })

    await userEvent.click(wifiCallingRadio)
    await userEvent.click(submitButton)

    const serviceCreatePath = getServiceRoutePath({
      type: ServiceType.WIFI_CALLING,
      oper: ServiceOperation.CREATE
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${serviceCreatePath}`
    })
  })
})
