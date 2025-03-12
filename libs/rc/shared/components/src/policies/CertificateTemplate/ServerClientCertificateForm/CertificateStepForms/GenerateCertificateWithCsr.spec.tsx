import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CertificateUrls }                       from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { certificateAuthorityList, serverCertificateList } from '../../__test__/fixtures'

import { GenerateCertificateWithCSR } from './GenerateCertificateWIthCSR'

describe('GenerateCertificateWithCSR', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      ),
      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json(serverCertificateList))
      )
    )
  })

  it('should render the component correctly', () => {
    render(<Provider><Form><GenerateCertificateWithCSR /></Form></Provider>)
    expect(screen.getByLabelText('Name')).toBeVisible()
    expect(screen.getByText('Start Date')).toBeVisible()
    expect(screen.getByText('Expiration Date')).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Select Certificate Authority' }))
      .toBeInTheDocument()
    expect(screen.getByLabelText('Paste Certificate Sign Request (CSR)')).toBeVisible()
  })

  it('should update the input values', async () => {
    render(<Provider><Form><GenerateCertificateWithCSR /></Form></Provider>)
    const csDropdown = screen.getByRole('combobox', { name: 'Select Certificate Authority' })
    const name = screen.getByLabelText('Name')
    const csr = screen.getByLabelText('Paste Certificate Sign Request (CSR)')

    fireEvent.mouseDown(csDropdown)
    await userEvent.click(await screen.findByText('onboard2'))
    await userEvent.type(name, 'certName')
    await userEvent.type(csr, '----BEGIN NEW CERTIFICATE REQUEST---- csrText')

    expect(name).toHaveValue('certName')
    expect(csr).toHaveValue('----BEGIN NEW CERTIFICATE REQUEST---- csrText')
  })

  it('should validate duplicate certificate name', async () => {
    render(<Provider><Form><GenerateCertificateWithCSR /></Form></Provider>)
    const certName = screen.getByLabelText('Name')
    await userEvent.type(certName, 'certificate1')
    await userEvent.tab()
    const errMsg = await screen.findByText('This Certificate Name is already exists')
    expect(errMsg).toBeVisible()
  })
})
