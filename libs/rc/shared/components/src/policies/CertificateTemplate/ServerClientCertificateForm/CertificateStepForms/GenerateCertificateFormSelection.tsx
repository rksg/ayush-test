import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import { CertificateGenerationType, GenerateCertificateFormData } from '@acx-ui/rc/utils'

import { generateCertificateTitle } from '../../contentsMap'

import GenerateCertificate        from './GenerateCertificate'
import GenerateCertificateWithCSR from './GenerateCertificateWIthCSR'
import { UploadCertificate }      from './UploadCertificate'

export default function GenerateCertificateFormSelection () {
  const { $t } = useIntl()
  const generateCertificateForm = Form.useFormInstance<GenerateCertificateFormData>()
  const generation = Form.useWatch('generation', generateCertificateForm)
  const generationFormMapping = {
    [CertificateGenerationType.NEW]: <GenerateCertificate />,
    [CertificateGenerationType.WITH_CSR]: <GenerateCertificateWithCSR />,
    [CertificateGenerationType.UPLOAD]: <UploadCertificate />
  }

  return (
    <>
      <Form.Item name='generation' style={{ marginBottom: '40px' }}>
        <Radio.Group>
          <Space direction='vertical'>
            {Object.values(CertificateGenerationType).map((type) => {
              return (
                <Radio key={type} value={type}>
                  {$t(generateCertificateTitle[type])}
                </Radio>
              )
            })}
          </Space>
        </Radio.Group>
      </Form.Item>
      {generationFormMapping[generation]}
    </>
  )
}
