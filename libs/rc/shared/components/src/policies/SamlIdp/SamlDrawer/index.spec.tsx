
import { rest } from 'msw'

import { SamlIdpProfileViewData }     from '@acx-ui/rc/utils'
import { CertificateUrls }            from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { serverCertificateList } from '../../CertificateTemplate/__test__/fixtures'

import { SAMLDrawer } from './index'

describe('SAML Drawer - Add', () => {


  const mockSAMLProfile = {
    id: 'c55f0a3bc2e44db5b3e55641dcbb0bfc',
    name: 'SAML-A4',
    signingCertificateEnabled: false,
    encryptionCertificateEnabled: false,
    encryptionCertificateId: '',
    wifiNetworkIds: []
  } as SamlIdpProfileViewData

  const params = {
    networkId: '5c342542bb824a8b981a9bb041a8a2da',
    tenantId: 'tenant-id',
    action: 'edit'
  }
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json(serverCertificateList))
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
          policy={mockSAMLProfile}
        />
      </Provider>
      , { route: { params } }
    )
    expect(screen.getByTestId('display-metadata-button')).toBeInTheDocument()
    expect(screen.getAllByText('OFF').length).toEqual(2)
  })
})
