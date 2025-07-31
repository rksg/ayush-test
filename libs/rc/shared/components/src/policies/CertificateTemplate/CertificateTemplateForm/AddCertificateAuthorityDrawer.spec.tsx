import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import moment    from 'moment'
import { rest }  from 'msw'

import { CertificateUrls }                                 from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import { certificateAuthorityList } from '../__tests__/fixtures'

import AddCertificateAuthorityDrawer from './AddCertificateAuthorityDrawer'

describe('AddCertificateAuthorityDrawer', () => {
  const mockedUsedNavigate = jest.fn()
  jest.mock('@acx-ui/react-router-dom', () => ({
    ...jest.requireActual('@acx-ui/react-router-dom'),
    useNavigate: () => mockedUsedNavigate
  }))

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      )
    )
  })

  it('should render the add form with initial value correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(<Provider>
      <AddCertificateAuthorityDrawer certificateTemplateForm={formRef.current} /></Provider>)
    expect(screen.getByText('Add')).toBeVisible()
    await userEvent.click(screen.getByText('Add'))
    expect(await screen.findByText('Add Certificate Authority')).toBeVisible()
    expect(await screen.findByText('Create Root CA')).toBeVisible()
    expect(await screen.findByRole('slider')).toHaveAttribute('aria-valuenow', '2048')
    expect(await screen.findByText('SHA-256')).toBeVisible()
    const start = moment(new Date().setMonth(new Date().getMonth() - 1)).format('MM/DD/YYYY')
    const end = moment(new Date().setFullYear(new Date().getFullYear() + 20)).format('MM/DD/YYYY')
    expect(await screen.findByDisplayValue(start)).toBeVisible()
    expect(await screen.findByDisplayValue(end)).toBeVisible()
  })

  it('should submit add form correctly', async () => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      ),
      rest.post(
        CertificateUrls.addCA.url,
        (req, res, ctx) => res(ctx.json({ id: 'testId' }))
      )
    )

    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      return form
    })

    render(<Provider><Form form={formRef.current}/>
      <AddCertificateAuthorityDrawer certificateTemplateForm={formRef.current} /></Provider>)
    await userEvent.click(screen.getByText('Add'))
    await userEvent.type(screen.getByLabelText('Certificate Authority Name'), 'testAuthorityName')
    await userEvent.type(screen.getByLabelText('Common Name'), 'testCommonName')
    await userEvent.type(screen.getByLabelText('Description'), 'testDescription')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.queryByText('Add Certificate Authority')).toBeNull())
    await waitFor(() => expect(formRef.current.getFieldValue(['onboard', 'certificateAuthorityId']))
      .toBe('testId'))
  })
})
