import userEvent from '@testing-library/user-event'

import { CertificateCategoryType } from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import { render, screen }          from '@acx-ui/test-utils'

import { serverCertificate } from '../__test__/fixtures'

import { ServerCertificateDetailDrawer } from './ServerCertificateDetailDrawer'

describe('ServerCertificatesDetailDrawer', () => {

  it('should render certificate correctly', async () => {
    render(
      <Provider>
        <ServerCertificateDetailDrawer
          open={true}
          setOpen={() => { }}
          data={serverCertificate}
          type={CertificateCategoryType.CERTIFICATE} />
      </Provider>, {
        route: {
          params: { tenantId: 't-id' },
          path: '/:tenantId/serverCertificate/list'
        }
      })
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
    expect(await screen.findByText('Adaptive Policy Set')).toBeVisible()
  })
})
