import { rest } from 'msw'

import { policyApi, personaApi }                                 from '@acx-ui/rc/services'
import { CertificateUrls, PersonaUrls }                          from '@acx-ui/rc/utils'
import { store, Provider }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { RolesEnum, WifiScopes }                                 from '@acx-ui/types'
import { getUserProfile, setUserProfile }                        from '@acx-ui/user'

import { certificateAuthority, certificateList, certificateTemplate, scepKeys } from '../__test__/fixtures'

import CertificateTemplateDetail from './CertificateTemplateDetail'


describe('CertificateTemplateDetail', () => {
  beforeEach(() => {
    store.dispatch(policyApi.util.resetApiState())
    store.dispatch(personaApi.util.resetApiState())
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
      ),
      rest.get(
        CertificateUrls.getCertificateTemplateScepKeys.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(scepKeys))
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }), {
      timeout: 20000
    })

    expect(screen.getByText('certificateTemplate1')).toBeInTheDocument()
    expect(screen.getByText('CA Type')).toBeInTheDocument()
    expect(screen.getByText('Onboard')).toBeInTheDocument()
    expect(screen.getByText('Certificate Authority')).toBeInTheDocument()
    expect(screen.getByText('onboard2')).toBeInTheDocument()
    expect(screen.getByText('Adaptive Policy Set')).toBeInTheDocument()
    expect(screen.getByText('Certificate (2)')).toBeInTheDocument()
    expect(screen.getByText('SCEP Keys (1)')).toBeInTheDocument()
    expect(screen.getByText('Chromebook Enrollment')).toBeInTheDocument()
  }, 30000)

  it('should render abac conrrectly with prime admin', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: false,
      profile: { ...getUserProfile().profile, roles: [RolesEnum.PRIME_ADMIN] }
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

  it('should render abac conrrectly with read only permission', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      scopes: [WifiScopes.READ],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
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