import { rest } from 'msw'

import { CertificateUrls }                                       from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { WifiScopes }                                            from '@acx-ui/types'
import { getUserProfile, setUserProfile }                        from '@acx-ui/user'

import { certificateAuthority, certificateList, certificateTemplate } from '../__test__/fixtures'

import CertificateTemplateDetail from './CertificateTemplateDetail'


describe('CertificateTemplateDetail', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CertificateUrls.getCertificateTemplate.url,
        (req, res, ctx) => res(ctx.json(certificateTemplate))
      ),
      rest.post(
        CertificateUrls.getSpecificTemplateCertificates.url,
        (req, res, ctx) => res(ctx.json(certificateList))
      ),
      rest.get(
        CertificateUrls.getCA.url,
        (req, res, ctx) => res(ctx.json(certificateAuthority))
      )
    )
  })

  it('should render certificate template detail', async () => {
    render(
      <Provider>
        <CertificateTemplateDetail />
      </Provider>
      , {
        route: {
          params: { tenantId: 't-id', policyId: 'p-id' },
          path: '/:tenantId/policies/certificateTemplate/:policyId/detail'
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(screen.getByText('certificateTemplate1')).toBeInTheDocument()
    expect(screen.getByText('CA Type')).toBeInTheDocument()
    expect(screen.getByText('Onboard')).toBeInTheDocument()
    expect(screen.getByText('Certificate Authority')).toBeInTheDocument()
    expect(screen.getByText('onboard2')).toBeInTheDocument()
    expect(screen.getByText('Adaptive Policy Set')).toBeInTheDocument()
    expect(screen.getByText('Certificate (2)')).toBeInTheDocument()
    expect(screen.getByText('Chromebook Enrollment')).toBeInTheDocument()
  })

  it('should render abac conrrectly with wifi-u permission', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      scopes: [WifiScopes.READ, WifiScopes.UPDATE]
    })

    render(
      <Provider>
        <CertificateTemplateDetail />
      </Provider>
      , {
        route: {
          params: { tenantId: 't-id', policyId: 'p-id' },
          path: '/:tenantId/policies/certificateTemplate/:policyId/detail'
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByRole('button', { name: 'Configure' })).toBeInTheDocument()
  })

  it('should render abac conrrectly with wifi-r permission', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      scopes: [WifiScopes.READ]
    })

    render(
      <Provider>
        <CertificateTemplateDetail />
      </Provider>
      , {
        route: {
          params: { tenantId: 't-id', policyId: 'p-id' },
          path: '/:tenantId/policies/certificateTemplate/:policyId/detail'
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.queryByRole('button', { name: 'Configure' })).not.toBeInTheDocument()
  })
})