import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  SamlIdpProfileUrls,
  CertificateUrls
}     from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  certList,
  mockedSamlIdpProfileList,
  mockedSamlIdpProfileByURL,
  mockedSamlIdpProfile,
  mockSamlIdpProfileId,
  mockedNetworkId1
} from '../__tests__/fixtures'

import { SAMLDetailDrawer } from './index'


const mockGetSamlIdpApi = jest.fn()
const mockGetSamlIdpProfileViewDataListApi = jest.fn()
const mockedSetVisible = jest.fn()
const mockedDownloadSamlServiceProviderMetadata = jest.fn()
describe('SAML Detail Drawer', () => {
  const params = {
    networkId: mockedNetworkId1,
    tenantId: 'tenant-id',
    action: 'edit'
  }
  beforeEach(() => {

    mockGetSamlIdpApi.mockClear()
    mockGetSamlIdpProfileViewDataListApi.mockClear()
    mockedSetVisible.mockClear()
    mockedDownloadSamlServiceProviderMetadata.mockClear()

    mockServer.use(
      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json(certList))
      ),
      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (req, res, ctx) => {
          mockGetSamlIdpProfileViewDataListApi()
          return res(ctx.json(mockedSamlIdpProfileList))
        }
      ),
      rest.get(
        SamlIdpProfileUrls.getSamlIdpProfile.url,
        (req, res, ctx) => {
          mockGetSamlIdpApi()
          if (req.params.id === mockSamlIdpProfileId) {
            return res(ctx.json(mockedSamlIdpProfile))
          }
          return res(ctx.json(mockedSamlIdpProfileByURL))
        }
      ),

      rest.get(
        SamlIdpProfileUrls.downloadSamlServiceProviderMetadata.url,
        (req, res, ctx) => {
          mockedDownloadSamlServiceProviderMetadata()
          return res(ctx.json({}))
        }
      )
    )
  })
  it('SAML Detail Drawer - ReadOnly', async () => {
    render(
      <Provider>
        <SAMLDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          samlIdpProfileId={mockSamlIdpProfileId}
        />
      </Provider>
      , { route: { params } }
    )

    await waitFor(() => {
      expect(mockGetSamlIdpProfileViewDataListApi).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockGetSamlIdpApi).toHaveBeenCalled()
    })

    expect(screen.getByTestId('display-metadata-button')).toBeInTheDocument()
    expect(screen.getAllByText('On').length).toEqual(2)

    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download SAML Metadata' })).toBeInTheDocument()
  })

  it('SAML Detail Drawer - should call visible false when click Close button', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SAMLDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          samlIdpProfileId={mockSamlIdpProfileId}
        />
      </Provider>
      , { route: { params } }
    )

    await waitFor(() => {
      expect(mockGetSamlIdpProfileViewDataListApi).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockGetSamlIdpApi).toHaveBeenCalled()
    })

    const cancelButton = screen.getByRole('button', { name: 'Close' })
    user.click(cancelButton)
    await waitFor(() => expect(mockedSetVisible).toBeCalledWith(false))

    const okButton = screen.getByRole('button', { name: 'OK' })
    user.click(okButton)
    await waitFor(() => expect(mockedSetVisible).toBeCalledWith(false))
  })

  it('should call download api when click download button', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SAMLDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          samlIdpProfileId={mockSamlIdpProfileId}
        />
      </Provider>
      , { route: { params } }
    )

    await waitFor(() => {
      expect(mockGetSamlIdpProfileViewDataListApi).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockGetSamlIdpApi).toHaveBeenCalled()
    })

    // expect(await screen.findByText(mockSamlIdpProfileName)).toBeInTheDocument()
    const downloadButton = screen.getByRole('button', { name: 'Download SAML Metadata' })
    await user.click(downloadButton)

    await waitFor(() => expect(mockedDownloadSamlServiceProviderMetadata).toBeCalled())
  })
})
