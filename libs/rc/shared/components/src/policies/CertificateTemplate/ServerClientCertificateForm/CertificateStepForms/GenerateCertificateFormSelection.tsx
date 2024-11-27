import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import { CertificateGenerationType, ExtendedKeyUsages, GenerateCertificateFormData } from '@acx-ui/rc/utils'

import { generateCertificateTitle } from '../../contentsMap'

import { GenerateCertificate }        from './GenerateCertificate'
import { GenerateCertificateWithCSR } from './GenerateCertificateWIthCSR'
import { UploadCertificate }          from './UploadCertificate'

type GenerateCertificateFormSelectionFormProps = {
  extendedKeyUsages?: ExtendedKeyUsages[]
}

export const GenerateCertificateFormSelection =
(props: GenerateCertificateFormSelectionFormProps) => {
  const { $t } = useIntl()
  const generateCertificateForm = Form.useFormInstance<GenerateCertificateFormData>()
  const generation = Form.useWatch('generation', generateCertificateForm)
  const generationFormMapping = {
    [CertificateGenerationType.NEW]: <GenerateCertificate
      extendedKeyUsages={props?.extendedKeyUsages}/>,
    [CertificateGenerationType.WITH_CSR]: <GenerateCertificateWithCSR
      extendedKeyUsages={props?.extendedKeyUsages}/>,
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
