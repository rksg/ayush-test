import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { AlgorithmType, CertificateUrls, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen }                  from '@acx-ui/test-utils'

import {
  certificateAuthorityList,
  certificateTemplateList,
  mockPersonaGroupWithIdentity
} from '../../__test__/fixtures'

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
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupWithIdentity))
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
      )
    )
  })

  const certificateTemplate = {
    id: 'templateId',
    name: 'templateName',
    caType: 'caType',
    keyLength: 123,
    algorithm: AlgorithmType.SHA_256,
    identityGroupId: '123'
  }

  it('should render the form correctly', async () => {
    render(<Provider><Form><CertificateSettings/></Form></Provider>)

    expect(screen.getByTitle('Certificate Template')).toBeVisible()
    expect(screen.getByTitle('Identity')).toBeVisible()
    expect(screen.getByTitle('CSR Source')).toBeVisible()
    expect(screen.getByTitle('Description')).toBeVisible()
    expect(screen.getByTitle('Auto-Generate CSR')).toBeVisible()

    const select = screen.getByRole('combobox', { name: 'Certificate Template' })
    await userEvent.click(select)
    const option1 = await screen.findByText('certificateTemplate1')
    expect(option1).toBeInTheDocument()
    expect(await screen.findByText('certificateTemplate2')).toBeInTheDocument()
    expect(await screen.findByText('certificateTemplate3')).toBeInTheDocument()
    await userEvent.click(option1)
    expect(await screen.findByText('var1')).toBeInTheDocument()
    expect(await screen.findByText('var2')).toBeInTheDocument()
  })

  it('should render Certificate Template select when specificTemplate is false', () => {
    render(<Provider><Form><CertificateSettings/></Form></Provider>)
    const certificateTemplateSelect = screen.getByLabelText('Certificate Template')
    expect(certificateTemplateSelect).toBeInTheDocument()
  })

  it('should not render Certificate Template select when specificTemplate is true', () => {
    render(<Provider><Form>
      <CertificateSettings templateData={certificateTemplate} /></Form></Provider>)
    const certificateTemplateSelect = screen.queryByLabelText('Certificate Template')
    expect(certificateTemplateSelect).toBeNull()
  })

  // eslint-disable-next-line max-len
  it('should not render Certificate Template and identity select when specificTemplate is true', () => {
    render(<Provider><Form>
      {/* eslint-disable-next-line max-len */}
      <CertificateSettings templateData={certificateTemplate} specificIdentity={'identity_id'}/></Form></Provider>)
    const certificateTemplateSelect = screen.queryByLabelText('Certificate Template')
    expect(certificateTemplateSelect).toBeNull()
  })

  it('should render CSR String input when CSR Source is "copy"', async () => {
    render(<Provider><Form>
      <CertificateSettings templateData={certificateTemplate} /></Form></Provider>)
    const csrSourceSelect = screen.getByLabelText('CSR Source')
    await userEvent.click(csrSourceSelect)
    await userEvent.click(screen.getByText('Copy & Paste CSR'))
    const csrStringInput = screen.getByLabelText('Certificate Signing Request')
    expect(csrStringInput).toBeInTheDocument()
  })
})
