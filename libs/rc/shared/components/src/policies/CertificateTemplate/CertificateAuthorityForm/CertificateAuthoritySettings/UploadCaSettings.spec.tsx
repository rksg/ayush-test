import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { render, screen } from '@acx-ui/test-utils'

import { UploadCaSettings } from './UploadCaSettings'



describe('UploadCaSettings', () => {

  it('should render the component correctly', () => {
    render(<Form><UploadCaSettings /></Form>)

    expect(screen.getByText('Upload CA')).toBeVisible()
    expect(screen.getAllByText('Drag & drop file here or')).toHaveLength(2)
    expect(screen.getByLabelText('Private Key Password')).toBeVisible()
  })

  it('displays file name when a file is uploaded', async () => {
    render(<Form><UploadCaSettings /></Form>)

    const publicFileInput = screen.getByTestId('public-key-upload')
    const file = new File([''], 'public.cer')
    await userEvent.upload(publicFileInput, file)
    expect(screen.getByText('public.cer')).toBeVisible()

    const privateFileInput = screen.getByTestId('private-key-upload')
    const privateFile = new File([''], 'private.cer')
    await userEvent.upload(privateFileInput, privateFile)
    expect(screen.getByText('private.cer')).toBeVisible()
  })

  it('should display error message when the file size is too big', async () => {
    render(<Form><UploadCaSettings /></Form>)

    const publicFileInput = screen.getByTestId('public-key-upload')
    const file = new File([''], 'public.cer')
    Object.defineProperty(file, 'size', { value: 1024 * 51 })
    await userEvent.upload(publicFileInput, file)
    expect(screen.getByText('File size (51 KB) is too big.')).toBeInTheDocument()
  })

  it('should not display public key when showPublicKeyUpload is false', async () => {
    render(<Form><UploadCaSettings showPublicKeyUpload={false}/></Form>)

    const publicFileInput = screen.queryByTestId('public-key-upload')
    expect(publicFileInput).not.toBeInTheDocument()
  })
})
