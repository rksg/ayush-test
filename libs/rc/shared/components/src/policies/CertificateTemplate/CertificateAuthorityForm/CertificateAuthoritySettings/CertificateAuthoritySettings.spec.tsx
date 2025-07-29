import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import moment    from 'moment'
import { rest }  from 'msw'

import { AlgorithmType, CertificateUrls, GenerationCaType } from '@acx-ui/rc/utils'
import { Provider }                                         from '@acx-ui/store'
import { mockServer, render, renderHook, screen }           from '@acx-ui/test-utils'

import { certificateAuthorityList } from '../../__tests__/fixtures'

import CertificateAuthoritySettings from './CertificateAuthoritySettings'

describe('CertificateAuthoritySettings', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      )
    )
  })

  function setup (jsx: JSX.Element) {
    const { result: formRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        generation: GenerationCaType.NEW,
        keyLength: 2048,
        algorithm: AlgorithmType.SHA_256,
        startDateMoment: moment(new Date(new Date().setMonth(new Date().getMonth() - 1))),
        expireDateMoment: moment(new Date(new Date().setFullYear(new Date().getFullYear() + 20)))
      })
      return form
    })
    return <Provider><Form form={formRef.current}>{jsx}</Form></Provider>
  }
  it('should render the component correctly', () => {
    render(setup(<CertificateAuthoritySettings />))

    const radio1 = screen.getByText('Generate New Certificate Authority')
    const radio2 = screen.getByText('Generate New Intermediate Certificate Authority')
    const radio3 = screen.getByText('Upload Existing Root or Intermediate Certificate Authority')
    expect(radio1).toBeVisible()
    expect(radio2).toBeVisible()
    expect(radio3).toBeVisible()
    expect(screen.getByText('Create Root CA')).toBeVisible()
  })

  it('should render the component correctly when clicking button', async () => {
    render(setup(<CertificateAuthoritySettings />))

    const uploadRadio = screen.getByDisplayValue('UPLOAD')
    await userEvent.click(uploadRadio)
    expect(screen.getByText('Upload CA')).toBeVisible()

    const generateNewRadio = screen.getByDisplayValue('NEW')
    await userEvent.click(generateNewRadio)
    expect(screen.getByText('Create Root CA')).toBeVisible()

    const generateNewSubCARadio = screen.getByDisplayValue('NEW_SUB_CA')
    await userEvent.click(generateNewSubCARadio)
    expect(screen.getByText('Create Intermediate CA')).toBeVisible()
  })
})
