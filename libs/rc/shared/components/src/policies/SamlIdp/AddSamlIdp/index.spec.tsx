import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CertificateUrls,
  PolicyOperation,
  PolicyType,
  SamlIdpProfileUrls,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { certList, mockCertId2, mockCertId3, mockCertName2, mockCertName3, mockedMetadata, mockSamlIdpProfileId, mockSamlIdpProfileName } from '../__tests__/fixtures'

import { AddSamlIdp } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

// Add mock for ImportFileDrawer
jest.mock('../../../ImportFileDrawer', () => ({
  ImportFileDrawer: ({
    importRequest
  }: {
    importRequest: (
      formData: FormData,
      values: object,
      content?: string
    ) => void
  }) => (
    <button
      onClick={() => importRequest(
        {} as FormData, // Mocked since we don't use it
        {}, // Mocked since we don't use it
        mockedMetadata
      )}
      data-testid='mock-import-drawer'
    >
      Mock Import
    </button>
  ),
  ImportFileDrawerType: { DPSK: 'DPSK' },
  CsvSize: { '5MB': 5242880 }
}))

// Add mock for CertificateDrawer
jest.mock('../../CertificateUtil/CertificateDrawer', () => ({
  __esModule: true,
  default: ({
    handleSave
  }: {
    handleSave: (createdCertId?: string) => void
  }) => (
    <button
      onClick={() => handleSave(mockCertId2)}
      data-testid='mock-certificate-drawer'
    >
      Mock Certificate
    </button>
  )
}))

let params: { tenantId: string }
const createViewPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.SAML_IDP,
  oper: PolicyOperation.CREATE
})

const mockedMainSamlIdpProfile = jest.fn()
const mockedActivateEncryptionCertificate = jest.fn()
const mockedActivateSigningCertificate = jest.fn()

describe('Add SAML IDP Profile', () => {
  beforeEach(() => {

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockedMainSamlIdpProfile.mockClear()
    mockedActivateEncryptionCertificate.mockClear()
    mockedActivateSigningCertificate.mockClear()

    mockServer.use(
      rest.post(
        SamlIdpProfileUrls.createSamlIdpProfile.url,
        (req, res, ctx) => {
          mockedMainSamlIdpProfile(req.body)
          return res(ctx.json({
            response: {
              id: mockSamlIdpProfileId
            }
          }))
        }
      ),

      rest.put(
        SamlIdpProfileUrls.activateEncryptionCertificate.url,
        (req, res, ctx) => {
          mockedActivateEncryptionCertificate()
          return res(ctx.status(202))
        }
      ),

      rest.put(
        SamlIdpProfileUrls.activateSigningCertificate.url,
        (req, res, ctx) => {
          mockedActivateSigningCertificate()
          return res(ctx.status(202))
        }
      ),

      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json(certList))
      )

    )
  })

  it('should create SAML IdP profile successful', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddSamlIdp />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, mockSamlIdpProfileName)

    // Find metadata textarea and input
    const metadataField = screen.getByTestId('metadata-textarea')
    await user.type(metadataField, 'xmlContent')

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    await user.type(metadataField, 'xmlContent2')

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/samlIdp/list`,
      hash: '',
      search: ''
    }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <AddSamlIdp />
      </Provider>
      , { route: { path: createViewPath, params } }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Identity Provider'
    })).toBeVisible()
  })

  it('Click cancel button and go back to list page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddSamlIdp />
      </Provider>
      , { route: { path: createViewPath, params } }
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/samlIdp/list`,
      hash: '',
      search: ''
    })
  })

  it('If enable certificate and select certificate will call certificate api', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddSamlIdp />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, mockSamlIdpProfileName)

    // Find metadata textarea and input
    const metadataField = screen.getByTestId('metadata-textarea')
    await user.type(metadataField, 'xmlContent')

    await user.click(screen.getByRole('switch', { name: 'Enable SAML Response Encryption' }))

    const certCombo = screen.getByRole('combobox', { name: 'Select Encryption Certificate' })
    await user.click(certCombo)
    await user.click(await screen.findByText(mockCertName2))

    await user.click(screen.getByRole('switch', { name: 'Enable SAML Request Signature' }))

    const signingCertCombo = screen.getByRole('combobox', { name: 'Select Signing Certificate' })
    await user.click(signingCertCombo)
    await user.click((await screen.findAllByText(mockCertName3))[1])

    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockedMainSamlIdpProfile).toBeCalledWith({
      metadata: Buffer.from('xmlContent').toString('base64'),
      name: mockSamlIdpProfileName,
      encryptionCertificateEnabled: true,
      encryptionCertificateId: mockCertId2,
      signingCertificateEnabled: true,
      signingCertificateId: mockCertId3
    }))

    await waitFor(() => expect(mockedActivateEncryptionCertificate).toBeCalledTimes(1))

    await waitFor(() => expect(mockedActivateSigningCertificate).toBeCalledTimes(1))
  })


  it('should handle import function correctly', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddSamlIdp />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    // Fill in the profile name
    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, mockSamlIdpProfileName)

    // Click import XML button to show drawer
    await user.click(screen.getByTestId('import-xml-button'))

    // Click the mocked import button which will trigger handleImportRequest
    await user.click(screen.getByTestId('mock-import-drawer'))

    // Verify the metadata textarea is updated with the imported content
    const metadataField = screen.getByTestId('metadata-textarea')
    expect(metadataField).toHaveValue(mockedMetadata)
  })

  it('should add certificate successfully and call back to form', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddSamlIdp />
      </Provider>
      , { route: { path: createViewPath, params } }
    )
    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, mockSamlIdpProfileName)

    // Enable encryption certificate
    await user.click(screen.getByRole('switch', { name: 'Enable SAML Response Encryption' }))

    // Click Generate Encryption Certificate button
    await user.click(
      screen.getByRole('button', { name: 'Generate an encryption certificate' })
    )

    // Click the mocked certificate drawer button which will trigger handleSave
    await user.click((await screen.findAllByTestId('mock-certificate-drawer'))[0])
    expect(await screen.findByText(mockCertName2)).toBeInTheDocument()


    // Enable signing certificate
    await user.click(screen.getByRole('switch', { name: 'Enable SAML Request Signature' }))

    // Click Generate Signing Certificate button
    await user.click(
      screen.getByRole('button', { name: 'Generate a signing certificate' })
    )

    // Click the mocked certificate drawer button which will trigger handleSave
    await user.click((await screen.findAllByTestId('mock-certificate-drawer'))[1])
    expect((await screen.findAllByText(mockCertName2))[1]).toBeInTheDocument()
  })
})