import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CsvSize }                                                                                                            from '@acx-ui/rc/components'
import { AdministrationUrlsInfo, ApplicationAuthenticationStatus, CertificateUrls, CommonUrlsInfo, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { Provider }                                                                                                           from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { SetupAzureDrawer } from './SetupAzureDrawer'

const tenantAuthenticationData =
{
  id: '1',
  name: 'test123.xml',
  authenticationType: TenantAuthenticationType.saml,
  clientID: '123',
  clientIDStatus: ApplicationAuthenticationStatus.ACTIVE,
  clientSecret: 'secret123'
}

// eslint-disable-next-line max-len
const metadataText = '<note><to>Me</to><from>You</from><heading>Reminder</heading><body></body></note>'

const services = require('@acx-ui/rc/services')

describe('Setup Azure Drawer', () => {
  const params = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  beforeEach(async () => {
    jest.spyOn(services, 'useGetUploadURLMutation')
    jest.spyOn(services, 'useAddTenantAuthenticationsMutation')
    jest.spyOn(services, 'useUpdateTenantAuthenticationsMutation')
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getUploadURL.url,
        (req, res, ctx) => res(ctx.json({
          fileId: 'f1-001/xml',
          signedUrl: 'https://example.com/image.png'
        }))
      ),
      rest.post(
        AdministrationUrlsInfo.addTenantAuthentications.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.put(
        AdministrationUrlsInfo.updateTenantAuthentications.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      ),
      // Mocked exact fetch call instead of mocking global.fetch = jest.fn()
      // since CommonUrlsInfo.getUploadURL seems to use global.fetch too
      rest.put(
        'https://example.com/image.png',
        (req, res, ctx) => res(ctx.json({ requestId: 'fetch' }))
      ),
      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'certificates' }))
      )
    )
    global.URL.createObjectURL = jest.fn().mockReturnValue('url')
    jest.spyOn(global.URL, 'createObjectURL')
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render add layout correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Set Up SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={false}
          setEditMode={jest.fn()}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Set Up SSO with 3rd Party Provider')).toBeVisible()
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    expect(screen.getByText('IdP Metadata')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Upload file instead' }))
    expect(await screen.findByRole('button', { name: 'Browse' })).toBeVisible()
    await userEvent.click(screen.getByRole('button',
      { name: 'Paste IdP Metadata code or link instead' }))
    expect(screen.getByText('IdP Metadata')).toBeVisible()
  })
  it('should render edit layout correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Edit SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit SSO with 3rd Party Provider')).toBeVisible()
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Change File' })).toBeVisible()
    fireEvent.click(screen.getByRole('button',
      { name: 'Paste IdP Metadata code or link instead' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Upload file instead' }))
    expect(await screen.findByRole('button', { name: 'Change File' })).toBeVisible()
  })
  it('should change file correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Edit SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit SSO with 3rd Party Provider')).toBeVisible()
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.getByText('test123.xml')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Change File' })).toBeVisible()

    // Upload xml file
    const xmlFile = new File(['(⌐□_□)'], 'saml.xml', { type: 'text/xml' })
    await userEvent.click(screen.getByRole('button', { name: 'Change File' }))
    // eslint-disable-next-line testing-library/no-node-access
    const fileInput = document.querySelector('input[type=file]')! as Element
    fireEvent.change(fileInput, { target: { files: [xmlFile] } })

    // Assert file added to be uploaded
    expect(await screen.findByText('saml.xml' )).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  })
  it('should validate file type correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Edit SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit SSO with 3rd Party Provider')).toBeVisible()
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.getByText('test123.xml')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Change File' })).toBeVisible()

    // Upload jpeg file
    const jpegFile = new File(['(⌐□_□)'], 'image.jpeg', { type: 'image/jpeg' })
    await userEvent.click(screen.getByRole('button', { name: 'Change File' }))
    // eslint-disable-next-line testing-library/no-node-access
    const fileInput = document.querySelector('input[type=file]')! as Element
    fireEvent.change(fileInput, { target: { files: [jpegFile] } })

    // Assert error message is shown
    expect(screen.getByText('Invalid file type.')).toBeVisible()

    // Assert jpeg file is not added to be uploaded
    expect(screen.queryByText('image.jpeg')).toBeNull()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()

    // Upload normal file (to prevent errors from updated state for apply button)
    const xmlFile = new File(['(⌐□_□)'], 'saml.xml', { type: 'text/xml' })
    // eslint-disable-next-line testing-library/no-node-access
    const fileInput2 = document.querySelector('input[type=file]')! as Element
    fireEvent.change(fileInput2, { target: { files: [xmlFile] } })
    // Assert file added to be uploaded
    expect(await screen.findByText('saml.xml' )).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })
  })
  it('should validate file size correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Edit SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit SSO with 3rd Party Provider')).toBeVisible()
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.getByText('test123.xml')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Change File' })).toBeVisible()

    // Upload xml file over max size
    await userEvent.click(screen.getByRole('button', { name: 'Change File' }))
    // eslint-disable-next-line testing-library/no-node-access
    const fileInput = document.querySelector('input[type=file]')! as Element
    // eslint-disable-next-line max-len
    fireEvent.change(fileInput, { target: { files: [{ file: 'saml.xml', type: 'text/xml', size: 8000000 }] } })

    // Assert error message is shown
    expect(screen.getByText('File size (7.63 MB) is too big.')).toBeVisible()

    // Assert xml file is not added to be uploaded
    expect(screen.queryByText('saml.xml')).toBeNull()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()

    // Upload normal file (to prevent errors from updated state for apply button)
    const xmlFile = new File(['(⌐□_□)'], 'saml.xml', { type: 'text/xml' })
    // eslint-disable-next-line testing-library/no-node-access
    const fileInput2 = document.querySelector('input[type=file]')! as Element
    fireEvent.change(fileInput2, { target: { files: [xmlFile] } })
    // Assert file added to be uploaded
    expect(await screen.findByText('saml.xml' )).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })
  })
  it('should close drawer when cancel button clicked', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Edit SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedCloseDrawer).toHaveBeenCalledWith(false)
  })
  it('should save file correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Edit SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit SSO with 3rd Party Provider')).toBeVisible()
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.getByText('test123.xml')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Change File' })).toBeVisible()

    // Upload xml file
    const xmlFile = new File(['(⌐□_□)'], 'saml.xml', { type: 'text/xml' })
    await userEvent.click(screen.getByRole('button', { name: 'Change File' }))
    // eslint-disable-next-line testing-library/no-node-access
    const fileInput = document.querySelector('input[type=file]')! as Element
    fireEvent.change(fileInput, { target: { files: [xmlFile] } })

    // Assert file added to be uploaded
    expect(await screen.findByText('saml.xml' )).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })
  })
  it('should save metadata correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Set Up SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={false}
          setEditMode={jest.fn()}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('IdP Metadata')).toBeVisible()
    const button = screen.getByRole('button', { name: 'Apply' })
    expect(button).toBeDisabled()
    const metadataInput = screen.getByRole('textbox')
    fireEvent.change(metadataInput, { target: { value: metadataText } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })
    await waitFor(() => {
      expect(services.useAddTenantAuthenticationsMutation).toHaveLastReturnedWith(value)
    })
  })
  it('should save new metadata url correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Set Up SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={false}
          setEditMode={jest.fn()}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('IdP Metadata')).toBeVisible()
    const button = screen.getByRole('button', { name: 'Apply' })
    expect(button).toBeDisabled()
    const metadataInput = screen.getByRole('textbox')
    fireEvent.change(metadataInput, { target: { value: 'https://test.com' } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })
    await waitFor(() => {
      expect(services.useAddTenantAuthenticationsMutation).toHaveLastReturnedWith(value)
    })
  })
  it('should save edited metadata url correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Set Up SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('IdP Metadata')).toBeVisible()
    const button = screen.getByRole('button', { name: 'Apply' })
    expect(button).toBeDisabled()
    await userEvent.click(screen.getByRole('button',
      { name: 'Paste IdP Metadata code or link instead' }))
    const metadataInput = screen.getByRole('textbox')
    fireEvent.change(metadataInput, { target: { value: 'https://test.com' } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '456' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })
    await waitFor(() => {
      expect(services.useUpdateTenantAuthenticationsMutation).toHaveLastReturnedWith(value)
    })
  })
  it('should validate domain correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Edit SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']}
          isGroupBasedLoginEnabled={true} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit SSO with 3rd Party Provider')).toBeVisible()
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.getByText('test123.xml')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Change File' })).toBeVisible()
    expect(screen.getByText('Allowed Domains')).toBeVisible()

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'commscope.c' } } )
    expect(await screen.findByText('Please enter domains separated by comma')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'commscope.com' } } )
    await waitFor(() => {
      expect(screen.queryByText('Please enter domains separated by comma')).toBeNull()
    })
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
  })
  it('should not save when error uploading file', async () => {
    const mockedCloseDrawer = jest.fn()
    // Mocking global.fetch will cause error in uploading file
    const originalFetch = global.fetch
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      json: () => ({}),
      text: () => ({}),
      clone: () => ({})
    }))
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Set Up SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('IdP Metadata')).toBeVisible()
    const button = screen.getByRole('button', { name: 'Apply' })
    expect(button).toBeDisabled()
    fireEvent.click(screen.getByRole('button',
      { name: 'Paste IdP Metadata code or link instead' }))
    const metadataInput = await screen.findByRole('textbox')
    fireEvent.change(metadataInput, { target: { value: metadataText } })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      isUninitialized: true
    })]

    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })
    await waitFor(() => {
      expect(services.useUpdateTenantAuthenticationsMutation).toHaveLastReturnedWith(value)
    })
    global.fetch = originalFetch
  })
  it('should render correctly for selected auth type', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Set Up SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={false}
          setEditMode={jest.fn()}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']}
          isGroupBasedLoginEnabled={true}
          isGoogleWorkspaceEnabled={true} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Set Up SSO with 3rd Party Provider')).toBeVisible()
    expect(screen.getByText('SAML')).toBeVisible()
    expect(screen.getByText('Google Workspace')).toBeVisible()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.queryByText('Client ID')).toBeNull()
    expect(screen.queryByText('Client secret')).toBeNull()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByText('Allowed Domains')).toBeVisible()

    await userEvent.click(screen.getAllByRole('radio')[1])
    expect(screen.getByText('Client ID')).toBeVisible()
    expect(screen.getByText('Client secret')).toBeVisible()
    expect(screen.queryByText('IdP Metadata')).toBeNull()

    await userEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.queryByText('Client ID')).toBeNull()
    expect(screen.queryByText('Client secret')).toBeNull()
  })
  it('should not allow edit for auth type', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Edit SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']}
          isGroupBasedLoginEnabled={true}
          isGoogleWorkspaceEnabled={true} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit SSO with 3rd Party Provider')).toBeVisible()
    expect(screen.getByText('SAML')).toBeVisible()
    expect(screen.queryByText('Google Workspace')).toBeNull()
    expect(screen.queryByRole('radio')).toBeNull()
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.queryByText('Client ID')).toBeNull()
    expect(screen.queryByText('Client secret')).toBeNull()
    expect(screen.getByText('test123.xml')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Change File' })).toBeVisible()
    expect(screen.getByText('Allowed Domains')).toBeVisible()
    expect(screen.queryByText('Please enter domains separated by comma')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

  })
})
