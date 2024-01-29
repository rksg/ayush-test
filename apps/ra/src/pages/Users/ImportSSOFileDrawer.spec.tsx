import '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useUpdateTenantSettingsMutation } from '@acx-ui/analytics/services'
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

const setVisible = jest.fn()
const drawerProps = {
  title: 'SSO Drawer',
  isEditMode: false,
  setVisible
}

let blobText = Blob.prototype.text

const validContent = '<a/>'
const invalidContent = ''

describe('ImportSSOFileDrawer', () => {
  beforeEach(() => {
    mockMutationHook.mockClear()
    Blob.prototype.text = jest.fn()
  })
  afterEach(() => {
    jest.clearAllMocks()
    Blob.prototype.text = blobText
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })
  it('should handle upload correctly', async () => {
    (Blob.prototype.text as jest.Mock).mockImplementation(() =>
      Promise.resolve(validContent))
    const updateSettingsMock = jest.fn()
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
        metadata: '<a/>'
      })
    })
    expect(setVisible).toHaveBeenCalledWith(false)
  })
  it.skip('should reject incorrect file extension upload', async () => {
    (Blob.prototype.text as jest.Mock).mockImplementation(() =>
      Promise.resolve(validContent))
    const updateSettingsMock = jest.fn()
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
    const invalidFile = new File([validContent], 'fail.svg', { type: 'image/svg+xml' })
    await userEvent.upload(uploadInput, invalidFile)
    expect((uploadInput as HTMLInputElement)?.files).toHaveLength(1)
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(await screen.findByText('File has invalid extension name.')).toBeVisible()
  })
  it('should reject incorrect file content upload', async () => {
    (Blob.prototype.text as jest.Mock).mockImplementation(() =>
      Promise.resolve(invalidContent))
    const updateSettingsMock = jest.fn()
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
    (Blob.prototype.text as jest.Mock).mockImplementation(() =>
      Promise.resolve(validContent))
    const value = 1024 * 5 * 1024 + 1
    const updateSettingsMock = jest.fn()
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
    const updateSettingsMock = jest.fn()
    mockMutationHook.mockImplementation(() => [updateSettingsMock])
    render(<ImportSSOFileDrawer
      {...drawerProps}
      isEditMode
      title='SSO Drawer'
      visible />,
    { wrapper: Provider })
    expect(await screen.findByText('SSO Drawer')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(updateSettingsMock).toHaveBeenCalledWith({ sso: JSON.stringify({}) })
    expect(setVisible).toHaveBeenCalledWith(false)
  })
})
