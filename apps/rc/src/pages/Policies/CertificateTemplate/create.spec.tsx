/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { render, screen }                                  from '@acx-ui/test-utils'

import CreateCertificateProfile from './create'

const mockedUseNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: () => jest.fn().mockImplementation(path => path)
}))

describe('CreateCertificateProfile', () => {
  const params = { tenantId: 'tenant-id' }

  const createPath = '/:tenantId/t/' + getPolicyRoutePath({
    type: PolicyType.CERTIFICATE_PROFILE,
    oper: PolicyOperation.CREATE
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the form with device certificate selected by default', async () => {
    render(
      <Provider>
        <CreateCertificateProfile />
      </Provider>, {
        route: { params, path: createPath }
      }
    )
    expect(screen.getByText('Add Certificate Instance')).toBeInTheDocument()
    expect(screen.getByText('Template Instance Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Device Certificate')).toBeChecked()
    expect(screen.getByText('Certificate Authorities (CA)')).toBeInTheDocument()
    expect(screen.getByText('Server & Client Certificate')).toBeInTheDocument()

    expect(screen.getByText('Device Certificate Type')).toBeInTheDocument()
    expect(screen.getByText('Template')).toBeInTheDocument()
    expect(screen.getByText('Certificate')).toBeInTheDocument()
  })

  it('should navigate to certificate path when certificate is selected', async () => {
    render(
      <Provider>
        <CreateCertificateProfile />
      </Provider>, {
        route: { params, path: createPath }
      }
    )
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUseNavigate).toHaveBeenCalled()
  })

  it('should navigate to template path when template is selected', async () => {
    render(
      <Provider>
        <CreateCertificateProfile />
      </Provider>, {
        route: { params, path: createPath }
      }
    )
    await userEvent.click(screen.getByRole('radio', { name: /Template/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUseNavigate).toHaveBeenCalled()
  })

  it('should navigate to ca path when ca is selected', async () => {
    render(
      <Provider>
        <CreateCertificateProfile />
      </Provider>, {
        route: { params, path: createPath }
      }
    )
    await userEvent.click(screen.getByRole('radio', { name: /Certificate Authorities/i }))
    expect(screen.queryByText('Certificate')).not.toBeInTheDocument()
    expect(screen.queryByText('Template')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUseNavigate).toHaveBeenCalled()
  })

  it('should navigate to server cert path when server cert is selected', async () => {
    render(
      <Provider>
        <CreateCertificateProfile />
      </Provider>, {
        route: { params, path: createPath }
      }
    )
    await userEvent.click(screen.getByRole('radio', { name: /Server & Client Certificate/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockedUseNavigate).toHaveBeenCalled()
  })
})
