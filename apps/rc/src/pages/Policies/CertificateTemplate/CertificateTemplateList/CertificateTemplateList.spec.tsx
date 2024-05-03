import { rest } from 'msw'

import { CertificateCategoryType, CertificateUrls, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                 from '@acx-ui/store'
import { mockServer, render, screen }                               from '@acx-ui/test-utils'

import { certificateAuthorityList, certificateList, certificateTemplateList } from '../__test__/fixtures'

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

    expect(await screen.findByText('Certificate Template (3)')).toBeInTheDocument()
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

    expect(await screen.findByText('Certificate Template (3)')).toBeInTheDocument()
    expect(await screen.findByText('Certificate Authority (3)')).toBeInTheDocument()
    expect(await screen.findByText('Certificate (2)')).toBeInTheDocument()
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
    expect(await screen.findByText('Certificate Template (3)')).toBeInTheDocument()
    expect(await screen.findByText('Certificate Authority (3)')).toBeInTheDocument()
    expect(await screen.findByText('Certificate (2)')).toBeInTheDocument()
    expect(await screen.findByText('Generate Certificate')).toBeInTheDocument()
  })
})
