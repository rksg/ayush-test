import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  SamlIdpProfileUrls,
  CertificateUrls
}     from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { certList, mockedSamlIdpProfileWithRelations, mockedSamlIdpProfileList, mockedSamlIdpProfileByURL, mockedSamlIdpProfile, mockSamlIdpProfileId } from '../__tests__/fixtures'

import { SAMLDrawer } from './index'


const mockGetSamlIdpApi = jest.fn()
const mockGetSamlIdpProfileViewDataListApi = jest.fn()
const mockedSetVisible = jest.fn()
describe('SAML Drawer', () => {
  const params = {
    networkId: '5c342542bb824a8b981a9bb041a8a2da',
    tenantId: 'tenant-id',
    action: 'edit'
  }
  beforeEach(() => {

    mockGetSamlIdpApi.mockClear()
    mockGetSamlIdpProfileViewDataListApi.mockClear()
    mockedSetVisible.mockClear()
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
      )
    )
  })


  it('SAML Drawer - Add', async () => {
    render(
      <Provider>
        <SAMLDrawer
          visible={true}
          setVisible={() => {}}
          readMode={false}
          callbackFn={() => {}}
        />
      </Provider>
      , { route: { params } }
    )

    expect(screen.getByTestId('saml-profile-name-input')).toBeInTheDocument()
    expect(screen.getByTestId('import-xml-button')).toBeInTheDocument()
  })

  it('SAML Drawer - ReadOnly', async () => {
    render(
      <Provider>
        <SAMLDrawer
          visible={true}
          setVisible={() => {}}
          readMode={true}
          policy={mockedSamlIdpProfileWithRelations}
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
  })

  it('SAML Drawer - should call visible false when click Close button', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SAMLDrawer
          visible={true}
          setVisible={mockedSetVisible}
          readMode={true}
          policy={mockedSamlIdpProfileWithRelations}
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
  })
})
