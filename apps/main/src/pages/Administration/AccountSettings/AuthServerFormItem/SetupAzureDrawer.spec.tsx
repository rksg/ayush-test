import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CsvSize }                                                                                           from '@acx-ui/rc/components'
import { AdministrationUrlsInfo, ApplicationAuthenticationStatus, CommonUrlsInfo, TenantAuthenticationType } from '@acx-ui/rc/utils'
// import {
//   UploadUrlResponse
// } from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
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

// const response: UploadUrlResponse = {
//   fileId: 'f1-001.xml',
//   // eslint-disable-next-line max-len
//   signedUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/tenant/ecc2d7cf9d2342fdb31ae0e24958fcac/f1-001.xml'
// }
// const uploadUrlResponse = {
//   data: {
//     fileId: 'f1-001.xml',
//     signedUrl: 'www.storage.com'
//   }
// }

const services = require('@acx-ui/rc/services')
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services')
}))

describe('Setup Azure Drawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.spyOn(services, 'useGetUploadURLMutation')
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getUploadURL.url,
        (req, res, ctx) => res(ctx.json({ fileId: 'f1-001/xml', signedUrl: 'www.storage.com' }))
      )
    )
    // TODO: mock response.clone for getUploadURL
    // services.useGetUploadURLMutation.clone = jest.fn().mockReturnValue(uploadUrlResponse)
    // services.useGetUploadURLMutation = jest.fn().mockImplementation(() =>
    //   Promise.resolve({
    //     json: () => Promise.resolve(uploadUrlResponse),
    //     text: () => Promise.resolve({}),
    //     clone: () => Promise.resolve(uploadUrlResponse)
    //   })
    // )
    jest.spyOn(services, 'useAddTenantAuthenticationsMutation')
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addTenantAuthentications.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
    jest.spyOn(services, 'useUpdateTenantAuthenticationsMutation')
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.updateTenantAuthentications.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )
    global.URL.createObjectURL = jest.fn()
    jest.spyOn(global.URL, 'createObjectURL')
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        text: () => Promise.resolve({})
      })
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
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
    // TODO: check if add page should start out on metadata page; if not, should use below tests instead
    // expect(screen.getByRole('button', { name: 'Browse' })).toBeVisible()
    // await userEvent.click(screen.getByRole('button', { name: 'Paste IdP Metadata code or link instead' }))
    // await userEvent.click(await screen.findByRole('button', { name: 'Upload file instead' }))
    // expect(await screen.findByRole('button', { name: 'Browse' })).toBeVisible()
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
    await userEvent.click(screen.getByRole('button',
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
    // const xmlFile = new File(['(⌐□_□)'], 'saml.xml', { type: 'text/xml' })
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
      expect(button).toBeEnabled()
    })
    await userEvent.click(button)

    // const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
    //   data: { requestId: '123' },
    //   status: 'fulfilled'
    // })]
    // await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loading' }))

    // await waitFor(()=>
    //   expect(services.useAddTenantAuthenticationsMutation).toHaveLastReturnedWith(value))
    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })
  })
})
