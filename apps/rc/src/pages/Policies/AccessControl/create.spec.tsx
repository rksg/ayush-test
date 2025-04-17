/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { render, screen }                                  from '@acx-ui/test-utils'

import CreateAccessControl from './create'

const mockedUseNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: () => jest.fn().mockImplementation(path => path)
}))

describe('CreateAccessControl', () => {
  const params = { tenantId: 'tenant-id' }

  const createPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the form with Wi-Fi selected by default', async () => {
    render(
      <Provider>
        <CreateAccessControl />
      </Provider>, {
        route: { params, path: createPath }
      }
    )

    expect(screen.getByText('Add Access Control')).toBeInTheDocument()
    expect(screen.getByText('Access Control Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Wi-Fi')).toBeChecked()
    expect(screen.getByLabelText('Switch')).not.toBeChecked()
  })

  it('should navigate to Wi-Fi access control path when Wi-Fi is selected', async () => {
    render(
      <Provider>
        <CreateAccessControl />
      </Provider>, {
        route: { params, path: createPath }
      }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(mockedUseNavigate).toHaveBeenCalled()
  })

  it('should navigate to Switch access control path when Switch is selected', async () => {
    render(
      <Provider>
        <CreateAccessControl />
      </Provider>, {
        route: { params, path: createPath }
      }
    )

    await userEvent.click(screen.getByLabelText('Switch'))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(mockedUseNavigate).toHaveBeenCalled()
  })
})