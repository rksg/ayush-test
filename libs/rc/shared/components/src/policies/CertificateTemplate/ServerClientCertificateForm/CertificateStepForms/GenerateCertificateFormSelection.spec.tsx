import { Form } from 'antd'
import moment   from 'moment'
import { rest } from 'msw'

import { AlgorithmType, CertificateUrls, GenerationCaType } from '@acx-ui/rc/utils'
import { Provider }                                         from '@acx-ui/store'
import { mockServer, render, renderHook, screen }           from '@acx-ui/test-utils'

import { certificateAuthorityList, serverCertificateList } from '../../__test__/fixtures'

import { GenerateCertificateFormSelection } from './GenerateCertificateFormSelection'

describe('GenerateCertificateFormSelection', () => {
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
    render(setup(<GenerateCertificateFormSelection />))

    const radio1 = screen.getByText('Generate Certificate')
    const radio2 = screen.getByText('Generate Certificate with CSR')
    const radio3 = screen.getByText('Upload Certificate')
    expect(radio1).toBeVisible()
    expect(radio2).toBeVisible()
    expect(radio3).toBeVisible()
    expect(screen.getByText('Certificate Attributes')).toBeVisible()
  })

})
