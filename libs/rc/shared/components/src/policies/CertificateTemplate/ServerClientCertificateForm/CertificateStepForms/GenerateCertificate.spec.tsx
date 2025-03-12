import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CertificateUrls }                       from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { certificateAuthorityList, serverCertificateList } from '../../__test__/fixtures'

import { GenerateCertificate } from './GenerateCertificate'


describe('GenerateCertificate', () => {
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
    render(<Provider><Form><GenerateCertificate /></Form></Provider>)
    expect(screen.getByLabelText('Name')).toBeVisible()
    expect(screen.getByText('Start Date')).toBeVisible()
    expect(screen.getByText('Expiration Date')).toBeVisible()
    expect(screen.getByRole('slider')).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Select Certificate Authority' }))
      .toBeInTheDocument()
    expect(screen.getByLabelText('Organization')).toBeVisible()
    expect(screen.getByLabelText('Organization Unit')).toBeVisible()
    expect(screen.getByLabelText('Locality')).toBeVisible()
    expect(screen.getByLabelText('State / Province')).toBeVisible()
    expect(screen.getByLabelText('Country')).toBeVisible()
  })

  it('should update the input values', async () => {
    render(<Provider><Form><GenerateCertificate /></Form></Provider>)
    const csDropdown = screen.getByRole('combobox', { name: 'Select Certificate Authority' })
    const name = screen.getByLabelText('Name')
    const organization = screen.getByLabelText('Organization')
    const organizationUnit = screen.getByLabelText('Organization Unit')
    const locality = screen.getByLabelText('Locality')
    const state = screen.getByLabelText('State / Province')
    const country = screen.getByLabelText('Country')

    fireEvent.mouseDown(csDropdown)
    await userEvent.click(await screen.findByText('onboard2'))
    await userEvent.type(name, 'certName')
    await userEvent.type(organization, 'Colorado')
    await userEvent.type(organizationUnit, 'US')
    await userEvent.type(locality, 'Westminster')
    await userEvent.type(state, 'Colorado')
    await userEvent.type(country, 'US')

    expect(name).toHaveValue('certName')
    expect(organization).toHaveValue('Colorado')
    expect(organizationUnit).toHaveValue('US')
    expect(locality).toHaveValue('Westminster')
    expect(state).toHaveValue('Colorado')
    expect(country).toHaveValue('US')
  })

  it('should validate duplicate certificate name', async () => {
    render(<Provider><Form><GenerateCertificate /></Form></Provider>)
    const certName = screen.getByLabelText('Name')
    await userEvent.type(certName, 'certificate1')
    await userEvent.tab()
    const errMsg = await screen.findByText('This Certificate Name is already exists')
    expect(errMsg).toBeVisible()
  })
})
