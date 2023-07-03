import userEvent from '@testing-library/user-event'

import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ViewXmlModal } from './ViewXmlModal'

/* eslint-disable max-len */
const sampleXml= '<?xml version=\'1.0\' encoding=\'UTF-8\'?> <md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" validUntil="2026-11-11T08:54:12.552223" entityID="https://sso.rkusbu.com/idp/saml2/metadata"> <md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"> <md:KeyDescriptor use="signing"> <ds:KeyInfo> <ds:X509Data> <ds:X509Certificate>MIIDKTCCAhGgAwIBAgIJAIypbYzOQmTIMA0GCSqGSIb3DQEBCwUAMCsxKTAnBgNV BAMMIHNzby5pbnQuY2xvdWQucnVja3Vzd2lyZWxlc3MuY29tMB4XDTE5MDExODE5 MDAxMFoXDTI0MDExNzE5MDAxMFowKzEpMCcGA1UEAwwgc3NvLmludC5jbG91ZC5y dWNrdXN3aXJlbGVzcy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB AQDRGfxbJ2dT8Z1cPugQQ1LYkszanluv97fsNUYIOWPEnlZ+jGJIi5A2aIeewamm Wa/10BmIBkW5vrV/iWKec4u+EaFfdtfpf8B/weFHZPel+BxKPXDmp/KgfSaYtw6L fdOGI8DLp6xpM8INrI2IZyvlIi75ewdAKCKoH17kmojzkBObSwiFTdv6HH3tGyMK BSa6PyGBOfjt04YhEBxY+fHjE4Ax1JdybYLdX5ozjWrp0jPPHgg52q6Yl0ti4XLa pGssaccIbNAx50c5BwmeOZfUZkmhcPo6nzRyVHsDY9inl+CkV5MaYSx9ghqdMfXx 8cM5Hh2ko5RHEBKZtlk8OapXAgMBAAGjUDBOMB0GA1UdDgQWBBTMuBJHn0RBemv8 XKQsJiDKvPP2mzAfBgNVHSMEGDAWgBTMuBJHn0RBemv8XKQsJiDKvPP2mzAMBgNV HRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCDPf9I4DL7sSO/MI0Pt8cx4Dp0 XiUzRTxcEn+IaAQ4TY5VPLWRSdSkVVf8/LF7pWUQIn14XU8oAkG/SpAg1vTjTTt3 v7BztNTBZBeKDA/uEWx1PHYT46F/Wnq8MzSlABQiIk1ekmCni03h6wUnOFtKmpzF 47zYnL5RVRzNtdo3IVmJaRXOciU0/xSputLSqGw1BAegZapH3NZcEA7fFpS4SSj/ cl9JrVnw4abttPaxZNs9mhEcv/6elKg88GA5lQTLa/ttKYrvfvQlrltRLHR4xivH lVPQ88zmqoOpe7rfEU4ewnPZI1s8YMXywYlaKZhSNun6Oyq9putdOLfQuNTN </ds:X509Certificate> </ds:X509Data> </ds:KeyInfo> </md:KeyDescriptor> <md:KeyDescriptor use="encryption"> <ds:KeyInfo> <ds:X509Data> <ds:X509Certificate>MIIDKTCCAhGgAwIBAgIJAIypbYzOQmTIMA0GCSqGSIb3DQEBCwUAMCsxKTAnBgNV BAMMIHNzby5pbnQuY2xvdWQucnVja3Vzd2lyZWxlc3MuY29tMB4XDTE5MDExODE5 MDAxMFoXDTI0MDExNzE5MDAxMFowKzEpMCcGA1UEAwwgc3NvLmludC5jbG91ZC5y dWNrdXN3aXJlbGVzcy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB AQDRGfxbJ2dT8Z1cPugQQ1LYkszanluv97fsNUYIOWPEnlZ+jGJIi5A2aIeewamm Wa/10BmIBkW5vrV/iWKec4u+EaFfdtfpf8B/weFHZPel+BxKPXDmp/KgfSaYtw6L fdOGI8DLp6xpM8INrI2IZyvlIi75ewdAKCKoH17kmojzkBObSwiFTdv6HH3tGyMK BSa6PyGBOfjt04YhEBxY+fHjE4Ax1JdybYLdX5ozjWrp0jPPHgg52q6Yl0ti4XLa pGssaccIbNAx50c5BwmeOZfUZkmhcPo6nzRyVHsDY9inl+CkV5MaYSx9ghqdMfXx 8cM5Hh2ko5RHEBKZtlk8OapXAgMBAAGjUDBOMB0GA1UdDgQWBBTMuBJHn0RBemv8 XKQsJiDKvPP2mzAfBgNVHSMEGDAWgBTMuBJHn0RBemv8XKQsJiDKvPP2mzAMBgNV HRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCDPf9I4DL7sSO/MI0Pt8cx4Dp0 XiUzRTxcEn+IaAQ4TY5VPLWRSdSkVVf8/LF7pWUQIn14XU8oAkG/SpAg1vTjTTt3 v7BztNTBZBeKDA/uEWx1PHYT46F/Wnq8MzSlABQiIk1ekmCni03h6wUnOFtKmpzF 47zYnL5RVRzNtdo3IVmJaRXOciU0/xSputLSqGw1BAegZapH3NZcEA7fFpS4SSj/ cl9JrVnw4abttPaxZNs9mhEcv/6elKg88GA5lQTLa/ttKYrvfvQlrltRLHR4xivH lVPQ88zmqoOpe7rfEU4ewnPZI1s8YMXywYlaKZhSNun6Oyq9putdOLfQuNTN </ds:X509Certificate> </ds:X509Data> </ds:KeyInfo> </md:KeyDescriptor> <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://sso.rkusbu.com/idp/saml2/SSO/POST"/> <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://sso.rkusbu.com/idp/saml2/SSO/Redirect"/> <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:SOAP" Location="https://sso.rkusbu.com/idp/saml2/SSO/SOAP"/> <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://sso.rkusbu.com/idp/saml2/SLO/Redirect"/> <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</md:NameIDFormat> <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:transient</md:NameIDFormat> <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat> </md:IDPSSODescriptor> </md:EntityDescriptor>'

describe('Setup Azure Drawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render correctly', async () => {
    const mockedCloseModal = jest.fn()
    render(
      <Provider>
        <ViewXmlModal
          visible={true}
          viewText={sampleXml}
          setVisible={mockedCloseModal} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Ok' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Ok' })).toBeEnabled()
  })
  it('should close modal when ok button clicked', async () => {
    const mockedCloseModal = jest.fn()
    render(
      <Provider>
        <ViewXmlModal
          visible={true}
          viewText={sampleXml}
          setVisible={mockedCloseModal} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('IdP Metadata')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Ok' }))
    expect(mockedCloseModal).toHaveBeenCalledWith(false)
  })
})
