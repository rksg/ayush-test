import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CertificateUrls,
  CommonUrlsInfo,
  PolicyOperation,
  PolicyType,
  SamlIdpProfileUrls,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { certList, mockSamlIdpProfileId, mockSamlIdpProfileName, mockedSamlIdpProfile, mockedsamlIpdProfileList, samlNetworkList } from '../__tests__/fixtures'

import {  SamlIdpDetail } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

let params: { tenantId: string, policyId: string }
const detailViewPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.SAML_IDP,
  oper: PolicyOperation.DETAIL
})

const mockedMainSamlIdpProfile = jest.fn()
const mockedViewDataList = jest.fn()
const mockedDownloadMetadata = jest.fn()

describe('SSO/SAML Detail', () => {
  beforeEach(() => {

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: mockSamlIdpProfileId
    }

    mockedMainSamlIdpProfile.mockClear()
    mockedViewDataList.mockClear()
    mockedDownloadMetadata.mockClear()

    mockServer.use(
      rest.get(
        SamlIdpProfileUrls.getSamlIdpProfile.url,
        (req, res, ctx) => {
          mockedMainSamlIdpProfile()
          return res(ctx.json(mockedSamlIdpProfile))
        }
      ),

      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (req, res, ctx) => {
          mockedViewDataList()
          return res(ctx.json(mockedsamlIpdProfileList))
        }
      ),

      rest.post(
        CommonUrlsInfo.getWifiNetworksList.url,
        (req, res, ctx) => res(ctx.json(samlNetworkList))
      ),

      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json(certList))
      ),

      rest.get(
        SamlIdpProfileUrls.downloadSamlServiceProviderMetadata.url,
        (req, res, ctx) => {
          mockedDownloadMetadata()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should render SAML IdP detail successful', async () => {
    render(
      <Provider>
        <SamlIdpDetail />
      </Provider>
      , { route: { path: detailViewPath, params } }
    )

    expect(await screen.findByText(mockSamlIdpProfileName)).toBeInTheDocument()
  })

  it('should call download api when click download button', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SamlIdpDetail />
      </Provider>
      , { route: { path: detailViewPath, params } }
    )

    await waitFor(() => expect(mockedViewDataList).toBeCalled())

    expect(await screen.findByText(mockSamlIdpProfileName)).toBeInTheDocument()
    const downloadButton = screen.getByRole('button', { name: 'Download SAML Metadata' })
    await user.click(downloadButton)
    await waitFor(() => expect(mockedDownloadMetadata).toBeCalled())
  })

})