import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CertificateUrls }            from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { certificateAuthorityList, certificateTemplateList } from '../__test__/fixtures'

import CertificateSettings from './CertificateSettings'

describe('CertificateSettings', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCertificateTemplates.url,
        (req, res, ctx) => res(ctx.json(certificateTemplateList))
      ),
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      )
    )
  })

  it('should render the form correctly', async () => {
    render(<Provider><Form><CertificateSettings specificTemplate={false} /></Form></Provider>)

    expect(screen.getByTitle('Certificate Template')).toBeVisible()
    expect(screen.getByTitle('CSR Source')).toBeVisible()
    expect(screen.getByTitle('Username')).toBeVisible()
    expect(screen.getByTitle('Description')).toBeVisible()
    expect(screen.getByTitle('Auto-Generate CSR')).toBeVisible()

    const select = screen.getByRole('combobox', { name: 'Certificate Template' })
    await userEvent.click(select)
    expect(await screen.findByText('certificateTemplate1')).toBeInTheDocument()
    expect(await screen.findByText('certificateTemplate2')).toBeInTheDocument()
    expect(await screen.findByText('certificateTemplate3')).toBeInTheDocument()
  })

  it('should render Certificate Template select when specificTemplate is false', () => {
    render(<Provider><Form><CertificateSettings specificTemplate={false} /></Form></Provider>)
    const certificateTemplateSelect = screen.getByLabelText('Certificate Template')
    expect(certificateTemplateSelect).toBeInTheDocument()
  })

  it('should not render Certificate Template select when specificTemplate is true', () => {
    render(<Provider><Form><CertificateSettings specificTemplate={true} /></Form></Provider>)
    const certificateTemplateSelect = screen.queryByLabelText('Certificate Template')
    expect(certificateTemplateSelect).toBeNull()
  })

  it('should render CSR String input when CSR Source is "copy"', async () => {
    render(<Provider><Form><CertificateSettings specificTemplate={true} /></Form></Provider>)
    const csrSourceSelect = screen.getByLabelText('CSR Source')
    await userEvent.click(csrSourceSelect)
    await userEvent.click(screen.getByText('Copy & Paste CSR'))
    const csrStringInput = screen.getByLabelText('Certificate Signing Request')
    expect(csrStringInput).toBeInTheDocument()
  })
})
