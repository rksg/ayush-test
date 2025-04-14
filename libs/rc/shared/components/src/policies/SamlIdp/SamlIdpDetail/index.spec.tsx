import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CertificateUrls,
  CommonUrlsInfo,
  PolicyOperation,
  PolicyType,
  SamlIdpProfileUrls,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  certList,
  mockSamlIdpProfileId,
  mockSamlIdpProfileId2,
  mockSamlIdpProfileName,
  mockSamlIdpProfileName2,
  mockedSamlIdpProfile,
  mockedSamlIdpProfileByURL,
  mockedSamlIdpProfileList,
  samlNetworkList
} from '../__tests__/fixtures'

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

const mockedGetSamlIdpProfile = jest.fn()
const mockedQueryViewDataList = jest.fn()
const mockedSyncMetadata = jest.fn()
const mockedDownloadSamlServiceProviderMetadata = jest.fn()

describe('SAML IdP Detail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: mockSamlIdpProfileId
    }

    jest.clearAllMocks()

    mockServer.use(
      rest.get(
        SamlIdpProfileUrls.getSamlIdpProfile.url,
        (req, res, ctx) => {
          mockedGetSamlIdpProfile()
          if (req.params.id === mockSamlIdpProfileId) {
            return res(ctx.json(mockedSamlIdpProfile))
          }
          return res(ctx.json(mockedSamlIdpProfileByURL))
        }
      ),

      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (req, res, ctx) => {
          mockedQueryViewDataList()
          return res(ctx.json(mockedSamlIdpProfileList))
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
          mockedDownloadSamlServiceProviderMetadata()
          return res(ctx.json({}))
        }
      ),

      rest.patch(
        SamlIdpProfileUrls.refreshSamlServiceProviderMetadata.url,
        (req, res, ctx) => {
          mockedSyncMetadata()
          return res(ctx.json({
            action: 'REFRESH_METADATA'
          }))
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

    await waitFor(() => expect(mockedQueryViewDataList).toBeCalled())
    await waitFor(() => expect(mockedGetSamlIdpProfile).toBeCalled())

    expect(await screen.findByText(mockSamlIdpProfileName)).toBeInTheDocument()
    const downloadButton = screen.getByRole('button', { name: 'Download SAML Metadata' })
    await user.click(downloadButton)

    await waitFor(() => expect(mockedDownloadSamlServiceProviderMetadata).toBeCalled())
  })

  it('Should call sync metadata api when click sync metadata button', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SamlIdpDetail />
      </Provider>
      , { route: {
        path: detailViewPath,
        params: { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', policyId: mockSamlIdpProfileId2 }
      } }
    )

    await waitFor(() => expect(mockedQueryViewDataList).toBeCalled())

    expect(await screen.findByText(mockSamlIdpProfileName2)).toBeInTheDocument()
    const syncMetadataButton = screen.getByTestId('sync-metadata-button')
    await user.click(syncMetadataButton)
    await waitFor(() => expect(mockedSyncMetadata).toBeCalled())

    await waitFor(() => expect(mockedQueryViewDataList).toBeCalledTimes(2))
    await waitFor(() => expect(mockedGetSamlIdpProfile).toBeCalledTimes(2))
  })
})