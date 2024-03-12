import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CertificateUrls }                        from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { mockServer, render, renderHook, screen } from '@acx-ui/test-utils'

import { certificateAuthorityList, certificateTemplateList } from '../__test__/fixtures'

import OnboardForm from './OnboardForm'

describe('OnboardForm', () => {
  it('should render the form correctly', async () => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      )
    )
    render(
      <Provider>
        <Form>
          <OnboardForm />
        </Form>
      </Provider>)

    expect(screen.getByLabelText('Onboard Certificate Authority')).toBeInTheDocument()
    expect(screen.getByLabelText('Certificate Template Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Common Name')).toBeInTheDocument()
    expect(screen.getByText('Show more settings')).toBeInTheDocument()

    // Check if the select is populated with the correct data
    const select = await screen.findByRole('combobox')
    await userEvent.click(select)
    expect(await screen.findByText('onboard2')).toBeInTheDocument()
    expect(await screen.findByText('onboard1')).toBeInTheDocument()
    expect(await screen.findByText('onboard3')).toBeInTheDocument()

    // Check if show more settings is render correctly
    const showMoreSettings = await screen.findByText('Show more settings')
    await userEvent.click(showMoreSettings)
    expect(await screen.findByText('Validity Period')).toBeInTheDocument()
    expect(await screen.findByText('Certificate Strength')).toBeInTheDocument()
    expect(await screen.findByText('Organization Info')).toBeInTheDocument()
    expect(await screen.findByText('Start Date')).toBeInTheDocument()
    expect(await screen.findByText('Expiration Date')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Add'))
    expect(await screen.findByText('Add Certificate Authority')).toBeVisible()
  })

  it('should render the form with the given data', async () => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      )
    )

    const data = {
      name: 'templateName',
      onboard: {
        certificateAuthorityId: '5eb07265d99242d78004cff1a9a53cf0',
        commonNamePattern: '${username}@abc.com'
      }
    }
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue(data)
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <OnboardForm />
        </Form>
      </Provider>
    )

    expect(await screen.findByText('onboard2')).toBeVisible()
    expect(screen.getByLabelText('Certificate Template Name')).toHaveValue('templateName')
    expect(screen.getByLabelText('Common Name'))
      .toHaveValue('${username}@abc.com')
  })

  it('should validate duplicate certificate template name', async () => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      ),
      rest.post(
        CertificateUrls.getCertificateTemplates.url,
        (req, res, ctx) => res(ctx.json(certificateTemplateList))
      )
    )

    render(
      <Provider>
        <Form>
          <OnboardForm />
        </Form>
      </Provider>)

    const certificateAuthorityName = screen.getByLabelText('Certificate Template Name')
    await userEvent.type(certificateAuthorityName, 'certificateTemplate1')
    await userEvent.tab()
    expect(await screen.findByText('Certificate Template with that name already exists'))
      .toBeVisible()
  })
})
