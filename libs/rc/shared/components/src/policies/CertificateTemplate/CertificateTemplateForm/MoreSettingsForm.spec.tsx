import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CertificateUrls }                        from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { mockServer, render, renderHook, screen } from '@acx-ui/test-utils'


import { certificateAuthorityList } from '../__tests__/fixtures'

import MoreSettingsForm from './MoreSettingsForm'


describe('MoreSettingsForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      )
    )
  })
  it('should render More Settings', async () => {
    render(<Provider><Form><MoreSettingsForm /></Form></Provider>)

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
    const data = {
      name: 'templateName',
      onboard: {
        certificateAuthorityId: '5eb07265d99242d78004cff1a9a53cf0'
      },
      chromebook: {
        enabled: false
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
          <MoreSettingsForm />
        </Form>
      </Provider>
    )

    expect(await screen.findByText('onboard2')).toBeVisible()
  })
})
