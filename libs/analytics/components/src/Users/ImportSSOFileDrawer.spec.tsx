import '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useUpdateTenantSettingsMutation } from '@acx-ui/analytics/services'
import { showToast }                       from '@acx-ui/components'
import { Provider }                        from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { ImportSSOFileDrawer } from './ImportSSOFileDrawer'

const mockMutationHook = useUpdateTenantSettingsMutation as jest.Mock
jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useUpdateTenantSettingsMutation: jest.fn(() => [jest.fn()])
}))

const mockShowToast = showToast as jest.Mock
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))

const setVisible = jest.fn()
const drawerProps = {
  samlFileName: undefined,
  title: 'SSO Drawer',
  isEditMode: false,
  setVisible
}

let actualBlobText = Blob.prototype.text
const mockBlobText = jest.fn()

const validContent = '<a/>'
const invalidContent = ''

describe('ImportSSOFileDrawer', () => {
  beforeEach(() => {
    mockMutationHook.mockClear()
    setVisible.mockClear()
    mockShowToast.mockClear()
    Blob.prototype.text = mockBlobText
  })
  afterEach(() => {
    jest.clearAllMocks()
    Blob.prototype.text = actualBlobText
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })
  it('should handle upload correctly', async () => {
    mockBlobText.mockImplementation(() => Promise.resolve(validContent))
    const updateSettingsMock = jest.fn(() => ({
      unwrap: async () => Promise.resolve('success')
    }))
    mockMutationHook.mockImplementation(() => [updateSettingsMock])
    render(<ImportSSOFileDrawer
      {...drawerProps}
      title='SSO Drawer'
      samlFileName='defaultFile.xml'
      visible />,
    { wrapper: Provider })
    expect(await screen.findByText('SSO Drawer')).toBeVisible()
    expect(await screen.findByText('defaultFile.xml')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Change File' }))
    const uploadInput = await screen.findByLabelText('IdP Metadata')
    expect(uploadInput).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeDisabled()
    const validFile = new File([validContent], 'saml.xml', { type: 'text/xml' })
    await userEvent.upload(uploadInput, validFile)
    expect((uploadInput as HTMLInputElement)?.files).toHaveLength(1)
    expect((uploadInput as HTMLInputElement)?.files![0]).toStrictEqual(validFile)
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeEnabled()
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(updateSettingsMock).toHaveBeenCalledWith({
      sso: JSON.stringify({
        type: 'saml2',
        metadata: '<a/>',
        fileName: 'saml.xml'
      })
    })
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      content: 'SSO configured successfully'
    })
    expect(setVisible).toHaveBeenCalledWith(false)
  })
  it('should handle upload errors correctly', async () => {
    mockBlobText.mockImplementation(() => Promise.resolve(validContent))
    const updateSettingsMock = jest.fn(() => ({
      unwrap: async () => {
        // eslint-disable-next-line no-throw-literal
        throw { data: 'Internal Server Error.' } }
    }))
    mockMutationHook.mockImplementation(() => [updateSettingsMock])
    render(<ImportSSOFileDrawer
      {...drawerProps}
      title='SSO Drawer'
      visible />,
    { wrapper: Provider })
    expect(await screen.findByText('SSO Drawer')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Browse' }))
    const uploadInput = await screen.findByLabelText('IdP Metadata')
    expect(uploadInput).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeDisabled()
    const validFile = new File([validContent], 'saml.xml', { type: 'text/xml' })
    await userEvent.upload(uploadInput, validFile)
    expect((uploadInput as HTMLInputElement)?.files).toHaveLength(1)
    expect((uploadInput as HTMLInputElement)?.files![0]).toStrictEqual(validFile)
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeEnabled()
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(updateSettingsMock).toHaveBeenCalledWith({
      sso: JSON.stringify({
        type: 'saml2',
        metadata: '<a/>',
        fileName: 'saml.xml'
      })
    })
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      content: 'Error: Internal Server Error., please try again later'
    })
    expect(setVisible).toHaveBeenCalledWith(false)
  })
  it('should handle upload correctly for isEditMode = true', async () => {
    mockBlobText.mockImplementation(() => Promise.resolve(validContent))
    const updateSettingsMock = jest.fn(() => ({
      unwrap: async () => Promise.resolve('success')
    }))
    mockMutationHook.mockImplementation(() => [updateSettingsMock])
    render(<ImportSSOFileDrawer
      {...drawerProps}
      isEditMode
      title='SSO Drawer'
      samlFileName='saml.xml'
      visible />,
    { wrapper: Provider })
    expect(await screen.findByText('SSO Drawer')).toBeVisible()
    expect(await screen.findByText('saml.xml')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Change File' }))
    const uploadInput = await screen.findByLabelText('IdP Metadata')
    expect(uploadInput).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeDisabled()
    const validFile = new File([validContent], 'saml.xml', { type: 'text/xml' })
    await userEvent.upload(uploadInput, validFile)
    expect((uploadInput as HTMLInputElement)?.files).toHaveLength(1)
    expect((uploadInput as HTMLInputElement)?.files![0]).toStrictEqual(validFile)
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeEnabled()
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(updateSettingsMock).toHaveBeenCalledWith({
      sso: JSON.stringify({
        type: 'saml2',
        metadata: '<a/>',
        fileName: 'saml.xml'
      })
    })
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      content: 'SSO configured successfully'
    })
    expect(setVisible).toHaveBeenCalledWith(false)
  })
  it('should reject incorrect file content upload', async () => {
    mockBlobText.mockImplementation(() => Promise.resolve(invalidContent))
    const updateSettingsMock = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue('success')
    })
    mockMutationHook.mockImplementation(() => [updateSettingsMock])
    render(<ImportSSOFileDrawer
      {...drawerProps}
      title='SSO Drawer'
      visible />,
    { wrapper: Provider })
    expect(await screen.findByText('SSO Drawer')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Browse' }))
    const uploadInput = await screen.findByLabelText('IdP Metadata')
    expect(uploadInput).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeDisabled()
    const invalidFile = new File([invalidContent], 'fail.xml', { type: 'text/xml' })
    await userEvent.upload(uploadInput, invalidFile)
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(await screen.findByText('File has invalid XML structure.')).toBeVisible()
  })
  it('should reject large files correctly', async () => {
    mockBlobText.mockImplementation(() => Promise.resolve(validContent))
    const value = 1024 * 5 * 1024 + 1
    const updateSettingsMock = jest.fn().mockResolvedValue({
      unwrap: jest.fn().mockResolvedValue('success')
    })
    mockMutationHook.mockImplementation(() => [updateSettingsMock])
    render(<ImportSSOFileDrawer
      {...drawerProps}
      title='SSO Drawer'
      visible />,
    { wrapper: Provider })
    expect(await screen.findByText('SSO Drawer')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Browse' }))
    const uploadInput = await screen.findByLabelText('IdP Metadata')
    expect(uploadInput).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeDisabled()
    const invalidFile = new File([validContent], 'fail.xml', { type: 'text/xml' })
    Object.defineProperty(invalidFile, 'size', { value })
    await userEvent.upload(uploadInput, invalidFile)
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(await screen.findByText('File size (5 MB) is too big.')).toBeVisible()
  })
  it('should handle close correctly', async () => {
    render(<ImportSSOFileDrawer
      {...drawerProps}
      title='SSO Drawer'
      visible />,
    { wrapper: Provider })
    expect(await screen.findByText('SSO Drawer')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(setVisible).toHaveBeenCalledWith(false)
  })
  it('should handle cancel correctly', async () => {
    render(<ImportSSOFileDrawer
      {...drawerProps}
      title='SSO Drawer'
      visible />,
    { wrapper: Provider })
    expect(await screen.findByText('SSO Drawer')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(setVisible).toHaveBeenCalledWith(false)
  })
  it('should handle delete when isEditMode = true correctly', async () => {
    const updateSettingsMock = jest.fn(() => ({
      unwrap: async () => Promise.resolve('success')
    }))
    mockMutationHook.mockImplementation(() => [updateSettingsMock])
    render(<ImportSSOFileDrawer
      {...drawerProps}
      isEditMode
      title='SSO Drawer'
      visible />,
    { wrapper: Provider })
    expect(await screen.findByText('SSO Drawer')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    expect(updateSettingsMock).toHaveBeenCalledWith({ sso: JSON.stringify({}) })
    expect(setVisible).toHaveBeenCalledWith(false)
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'success',
      content: 'SSO removed successfully'
    })
  })
  it('should handle delete errors when isEditMode = true', async () => {
    const updateSettingsMock = jest.fn(() => ({
      unwrap: async () => {
        // eslint-disable-next-line no-throw-literal
        throw { data: 'Internal Server Error.' } }
    }))
    mockMutationHook.mockImplementation(() => [updateSettingsMock])
    render(<ImportSSOFileDrawer
      {...drawerProps}
      isEditMode
      title='SSO Drawer'
      visible />,
    { wrapper: Provider })
    expect(await screen.findByText('SSO Drawer')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    expect(updateSettingsMock).toHaveBeenCalledWith({ sso: JSON.stringify({}) })
    expect(setVisible).toHaveBeenCalledWith(false)
    expect(mockShowToast).toHaveBeenCalledWith({
      type: 'error',
      content: 'Error: Internal Server Error., please try again later'
    })
  })
})
