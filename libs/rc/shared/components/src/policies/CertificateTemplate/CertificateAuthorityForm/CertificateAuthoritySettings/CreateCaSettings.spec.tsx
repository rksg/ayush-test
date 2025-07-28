import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CertificateUrls }            from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { certificateAuthorityList } from '../../__tests__/fixtures'



import CreateCaSettings from './CreateCaSettings'

describe('CreateCaSettings', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      )
    )
  })

  it('should render the component correctly', () => {
    render(<Provider><Form><CreateCaSettings /></Form></Provider>)
    expect(screen.getByLabelText('Certificate Authority Name')).toBeVisible()
    expect(screen.getByLabelText('Common Name')).toBeVisible()
    expect(screen.getByLabelText('Description')).toBeVisible()
    expect(screen.getByText('Start Date')).toBeVisible()
    expect(screen.getByText('Expiration Date')).toBeVisible()
    expect(screen.getByRole('slider')).toBeVisible()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByLabelText('Organization')).toBeVisible()
    expect(screen.getByLabelText('Organization Unit')).toBeVisible()
    expect(screen.getByLabelText('Email Address')).toBeVisible()
    expect(screen.getByLabelText('Title')).toBeVisible()
    expect(screen.getByLabelText('Locality')).toBeVisible()
    expect(screen.getByLabelText('State')).toBeVisible()
    expect(screen.getByLabelText('Country')).toBeVisible()
  })

  it('should update the input values', async () => {
    render(<Provider><Form><CreateCaSettings /></Form></Provider>)
    const certificateAuthorityName = screen.getByLabelText('Certificate Authority Name')
    const commonName = screen.getByLabelText('Common Name')
    const description = screen.getByLabelText('Description')
    const organization = screen.getByLabelText('Organization')
    const organizationUnit = screen.getByLabelText('Organization Unit')
    const emailAddress = screen.getByLabelText('Email Address')
    const title = screen.getByLabelText('Title')
    const locality = screen.getByLabelText('Locality')
    const state = screen.getByLabelText('State')
    const country = screen.getByLabelText('Country')

    await userEvent.type(certificateAuthorityName, 'testAuthorityName')
    await userEvent.type(commonName, 'testCommonName')
    await userEvent.type(description, 'testDescription')
    await userEvent.type(organization, 'Colorado')
    await userEvent.type(organizationUnit, 'US')
    await userEvent.type(emailAddress, 'abc@email.com')
    await userEvent.type(title, 'IT')
    await userEvent.type(locality, 'Westminster')
    await userEvent.type(state, 'Colorado')
    await userEvent.type(country, 'US')

    expect(certificateAuthorityName).toHaveValue('testAuthorityName')
    expect(commonName).toHaveValue('testCommonName')
    expect(description).toHaveValue('testDescription')
    expect(organization).toHaveValue('Colorado')
    expect(organizationUnit).toHaveValue('US')
    expect(emailAddress).toHaveValue('abc@email.com')
    expect(title).toHaveValue('IT')
    expect(locality).toHaveValue('Westminster')
    expect(state).toHaveValue('Colorado')
    expect(country).toHaveValue('US')
  })

  it('should validate duplicate authority name', async () => {
    render(<Provider><Form><CreateCaSettings /></Form></Provider>)
    const certificateAuthorityName = screen.getByLabelText('Certificate Authority Name')
    await userEvent.type(certificateAuthorityName, 'onboard1')
    await userEvent.tab()
    const errMsg = await screen.findByText('Certificate Authority with that name already exists')
    expect(errMsg).toBeVisible()
  })

  it('should show correctly for creating sub CA', async () => {
    render(<Provider><Form><CreateCaSettings rootCaMode={false} /></Form></Provider>)
    expect(await screen.findByText('Create Intermediate CA')).toBeVisible()
    const select = await screen.findByRole('combobox', { name: 'Certificate Authority' })
    await userEvent.click(select)
    expect(await screen.findByText('onboard2')).toBeInTheDocument()
    expect(await screen.findByText('onboard3')).toBeInTheDocument()
    expect(await screen.findByText('onboard1')).toBeInTheDocument()
  })
})
