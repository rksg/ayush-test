import { rest } from 'msw'

import { useIsSplitOn }                                                          from '@acx-ui/feature-toggle'
import { CertificateCategoryType, CertificateUrls, CommonUrlsInfo, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                                                              from '@acx-ui/store'
import { mockServer, render, screen }                                            from '@acx-ui/test-utils'
import { RolesEnum, WifiScopes }                                                 from '@acx-ui/types'
import { setUserProfile, getUserProfile }                                        from '@acx-ui/user'

import { certificateAuthorityList, certificateList, certificateTemplateList, serverCertificateList } from '../__test__/fixtures'

import CertificateTemplateList from './CertificateTemplateList'



describe('CertificateTemplateList', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      ),
      rest.post(
        CertificateUrls.getCertificateTemplates.url,
        (req, res, ctx) => res(ctx.json(certificateTemplateList))
      ),
      rest.post(
        CertificateUrls.getCertificates.url,
        (req, res, ctx) => res(ctx.json(certificateList))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json({
          data: [
            { name: 'testAAA-ct', id: 'testNetworkId1' },
            { name: 'testAAA-ct2', id: 'testNetworkId2' }]
        }))
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json(serverCertificateList))
      )
    )
  })

  it('should render component with certificate template tab', async () => {
    render(
      <Provider>
        <CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE_TEMPLATE} />
      </Provider>,
      {
        route: {
          params: { tenantId: 't-id' },
          path: '/:tenantId/policies/certificateTemplate/list'
        }
      })

    expect(await screen.findByText('Device Certificates')).toBeInTheDocument()
    expect(await screen.findByText('Certificate Authority (3)')).toBeInTheDocument()
    expect(await screen.findByText('Certificate (2)')).toBeInTheDocument()
    expect(await screen.findByText('Add Certificate Template')).toBeInTheDocument()
  })

  it('should render component with certificate authority tab', async () => {
    render(
      <Provider>
        <CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE_AUTHORITY} />
      </Provider>,
      {
        route: {
          params: { tenantId: 't-id' },
          path: '/:tenantId/policies/certificateAuthority/list'
        }
      })

    expect(await screen.findByText('Device Certificates')).toBeInTheDocument()
    expect(await screen.findByText('Certificate Authority (3)')).toBeInTheDocument()
    expect(await screen.findByText('Add Certificate Authority')).toBeInTheDocument()
  })

  it('should render component with certificate tab', async () => {
    render(
      <Provider>
        <CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE} />
      </Provider>,
      {
        route: {
          params: { tenantId: 't-id' },
          path: '/:tenantId/policies/certificate/list'
        }
      })
    expect(await screen.findByText('Device Certificates')).toBeInTheDocument()
    expect(await screen.findByText('Certificate Authority (3)')).toBeInTheDocument()
    expect(await screen.findByText('Generate Certificate')).toBeInTheDocument()
  })

  it('should render component correctly with prime admin', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: false,
      profile: { ...getUserProfile().profile, roles: [RolesEnum.PRIME_ADMIN] }
    })

    render(
      <Provider>
        <CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE_TEMPLATE} />
      </Provider>,
      {
        route: {
          params: { tenantId: 't-id' },
          path: '/:tenantId/policies/certificateTemplate/list'
        }
      })

    expect(await screen.findByText('Add Certificate Template')).toBeInTheDocument()
  })

  it('should render component correctly with read only permission', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      scopes: [WifiScopes.READ],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })

    render(
      <Provider>
        <CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE_TEMPLATE} />
      </Provider>,
      {
        route: {
          params: { tenantId: 't-id' },
          path: '/:tenantId/policies/certificateTemplate/list'
        }
      })

    expect(screen.queryByText('Add Certificate Template')).not.toBeInTheDocument()
  })

  it('should render component with server certificates tab', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <CertificateTemplateList tabKey={CertificateCategoryType.SERVER_CERTIFICATES} />
      </Provider>,
      {
        route: {
          params: { tenantId: 't-id' },
          path: '/:tenantId/serverCertificates/list'
        }
      })
    expect(await screen.findByText('Device Certificates')).toBeInTheDocument()
    expect(await screen.findByText('Certificate Authority (3)')).toBeInTheDocument()
    expect(await screen.findByText('Server & Client Certificates (2)')).toBeInTheDocument()
    expect(await screen.findByText('Generate Certificate')).toBeInTheDocument()
  })
})

