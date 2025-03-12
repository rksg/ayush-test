import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CertificateUrls }            from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { serverCertificateList } from '../../__test__/fixtures'

import { UploadCertificate } from './UploadCertificate'


describe('Upload Certificate', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json(serverCertificateList))
      )
    )
  })

  it('should render the component correctly', () => {
    render(<Provider><Form><UploadCertificate /></Form></Provider>)

    expect(screen.getByText('Upload Certificate')).toBeVisible()
    expect(screen.getAllByText('Drag & drop file here or')).toHaveLength(2)
    expect(screen.getByLabelText('Private Key Password')).toBeVisible()
  })

  it('displays file name when a file is uploaded', async () => {
    render(<Provider><Form><UploadCertificate /></Form></Provider>)

    const publicFileInput = screen.getByTestId('public-key-upload')
    const file = new File([''], 'public.pem', { type: 'application/x-pem-file' })
    // file['type'] = 'application/x-pem-file'
    await userEvent.upload(publicFileInput, file)
    expect(screen.getByText('public.pem')).toBeVisible()

    const privateFileInput = screen.getByTestId('private-key-upload')
    const privateFile = new File([''], 'private.pem', { type: 'application/x-pem-file' })
    await userEvent.upload(privateFileInput, privateFile)
    expect(screen.getByText('private.pem')).toBeVisible()
  })

  it('should display error message when the file size is too big', async () => {
    render(<Provider><Form><UploadCertificate /></Form></Provider>)

    const publicFileInput = screen.getByTestId('public-key-upload')
    const file = new File([''], 'public.pem', { type: 'application/x-pem-file' })
    Object.defineProperty(file, 'size', { value: 1024 * 11 })
    await userEvent.upload(publicFileInput, file)
    expect(screen.getByText('File size (11 KB) is too big.')).toBeInTheDocument()
  })
})
