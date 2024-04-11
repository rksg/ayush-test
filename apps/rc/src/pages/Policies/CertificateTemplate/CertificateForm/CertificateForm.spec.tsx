import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CertificateUrls, PolicyOperation, PolicyType, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Path, To, useTenantLink }                                          from '@acx-ui/react-router-dom'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor }                  from '@acx-ui/test-utils'

import { certificateAuthorityList, certificateTemplateList } from '../__test__/fixtures'

import CertificateForm from './CertificateForm'

const mockedUsedNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/t-id',
  search: '',
  hash: ''
}
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

describe('CertificateForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCertificateTemplates.url,
        (req, res, ctx) => res(ctx.json(certificateTemplateList))
      ),
      rest.post(
        CertificateUrls.generateCertificate.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      )
    )
  })

  it('should submit the form correctly', async () => {
    render(<Provider><CertificateForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/create'
      }
    })

    const select = screen.getByRole('combobox', { name: 'Certificate Template' })
    await userEvent.click(select)
    const certificateTemplate = await screen.findByText('certificateTemplate1')
    await userEvent.click(certificateTemplate)
    await userEvent.click(screen.getByRole('combobox', { name: 'CSR Source' }))
    await userEvent.click(await screen.findByText('Copy & Paste CSR'))
    await userEvent.type(screen.getByLabelText('Certificate Signing Request'), 'testCSR')
    await userEvent.type(screen.getByLabelText('Username'), 'testUsername')

    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    await waitFor(() => expect(mockedUsedNavigate).toBeCalled())
  })

  it('should navigate to the Select service page when clicking Cancel button', async () => {

    const { result: selectPath } = renderHook(() => {
      // eslint-disable-next-line max-len
      return useTenantLink(getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.LIST }))
    })
    // eslint-disable-next-line max-len
    const createPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.CREATE })

    render(<Provider><CertificateForm /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: createPath
      }
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toBeCalledWith(selectPath.current)
  })
})
