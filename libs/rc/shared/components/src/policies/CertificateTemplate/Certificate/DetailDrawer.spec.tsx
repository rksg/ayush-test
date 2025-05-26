import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CertificateCategoryType, CertificateUrls } from '@acx-ui/rc/utils'
import { Provider }                                 from '@acx-ui/store'
import { mockServer, render, screen }               from '@acx-ui/test-utils'

import { certificate, certificateAuthority, certificateAuthorityList, certificateTemplate } from '../__test__/fixtures'

import { DetailDrawer } from './DetailDrawer'




describe('DetailDrawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CertificateUrls.getCertificateTemplate.url,
        (req, res, ctx) => res(ctx.json(certificateTemplate))
      ),
      rest.post(
        CertificateUrls.getSubCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      )
    )
  })

  it('should render certificate correctly', async () => {
    render(
      <Provider>
        <DetailDrawer
          open={true}
          setOpen={() => { }}
          data={certificate}
          type={CertificateCategoryType.CERTIFICATE} />
      </Provider>, {
        route: {
          params: { tenantId: 't-id' },
          path: '/:tenantId/policies/certificate/list'
        }
      })
    expect(await screen.findByText('Certificate Details')).toBeVisible()
    await userEvent.click(screen.getByText('Certificate Information'))
    expect(await screen.findByText('Common Name')).toBeVisible()
    expect(await screen.findByText('Status')).toBeVisible()
    expect(await screen.findByText('Valid Not Before')).toBeVisible()
    expect(await screen.findByText('Valid Not After')).toBeVisible()
    expect(await screen.findByText('Organization')).toBeVisible()
    expect(await screen.findByText('Organization Unit')).toBeVisible()
    expect(await screen.findByText('Locality')).toBeVisible()
    expect(await screen.findByText('State')).toBeVisible()
    expect(await screen.findByText('Country')).toBeVisible()
    expect(await screen.findByText('Serial Number')).toBeVisible()
    expect(await screen.findByText('Key Length')).toBeVisible()
    expect(await screen.findByText('Key Usage')).toBeVisible()
    expect(await screen.findByText('SHA Fingerprint')).toBeVisible()
    expect(await screen.findByText('Certificate Template')).toBeVisible()
    expect(await screen.findByText('Certificate Authority')).toBeVisible()
    expect(await screen.findByText('Identity')).toBeVisible()
    expect(await screen.findByText('Description')).toBeVisible()

    await userEvent.click(screen.getByText('Download'))
    expect(await screen.findByText('View Public Key')).toBeVisible()
    expect(await screen.findByText('View Chain')).toBeVisible()
    expect(await screen.findByText('Download DER')).toBeVisible()
    expect(await screen.findByText('Download PKCS7')).toBeVisible()

    await userEvent.click(screen.getByText('Usage'))
    expect(await screen.findByText('Issued')).toBeVisible()
    expect(await screen.findByText('Last RADIUS Policy')).toBeVisible()
  })

  it('should render certificate authority correctly', async () => {
    render(
      <Provider>
        <DetailDrawer
          open={true}
          setOpen={() => { }}
          data={certificateAuthority}
          type={CertificateCategoryType.CERTIFICATE_AUTHORITY} />
      </Provider>)
    expect(await screen.findByText('Certificate Authority Details')).toBeVisible()
    await userEvent.click(screen.getByText('Certificate Authority Information'))
    expect(await screen.findByText('Parent CA')).toBeVisible()
    expect(await screen.findByText('SHA Fingerprint')).toBeVisible()
    expect(await screen.findByText('Organization')).toBeVisible()
    expect(await screen.findByText('Email Address')).toBeVisible()
    expect(await screen.findByText('Locality')).toBeVisible()
    expect(await screen.findByText('State')).toBeVisible()
    expect(await screen.findByText('Country')).toBeVisible()
    expect(await screen.findByText('Usages')).toBeVisible()
    expect(await screen.findByText('Start Date')).toBeVisible()
    expect(await screen.findByText('Expires')).toBeVisible()
    expect(await screen.findByText('Key Length')).toBeVisible()
    expect(await screen.findByText('Key Usage')).toBeVisible()
    expect(await screen.findByText('Algorithm')).toBeVisible()
    expect(await screen.findByText('Serial Number')).toBeVisible()
    expect(await screen.findByText('Description')).toBeVisible()
    expect(await screen.findByText('View & Upload')).toBeVisible()
    expect(await screen.findByText('Sub CAs (3)')).toBeVisible()
    expect(await screen.findByText('Certificate Templates (3)')).toBeVisible()
  })
})
