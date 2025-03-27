import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import {
  CertificateGenerationType,
  CertificateUrls,
  ExtendedKeyUsages,
  GenerateCertificateFormData,
  KeyUsages
} from '@acx-ui/rc/utils'
import { hasAllowedOperations } from '@acx-ui/user'
import { getOpsApi }            from '@acx-ui/utils'

import { generateCertificateDescription, generateCertificateTitle } from '../../contentsMap'
import { RadioItemDescription }                                     from '../../styledComponents'

import { GenerateCertificate }        from './GenerateCertificate'
import { GenerateCertificateWithCSR } from './GenerateCertificateWIthCSR'
import { UploadCertificate }          from './UploadCertificate'

type GenerateCertificateFormSelectionFormProps = {
  keyUsages?: KeyUsages[]
  extendedKeyUsages?: ExtendedKeyUsages[]
}

export const GenerateCertificateFormSelection =
(props: GenerateCertificateFormSelectionFormProps) => {
  const { $t } = useIntl()
  const { keyUsages, extendedKeyUsages } = props
  const generateCertificateForm = Form.useFormInstance<GenerateCertificateFormData>()
  const generation = Form.useWatch('generation', generateCertificateForm)
  const generationFormMapping = {
    [CertificateGenerationType.NEW]: <GenerateCertificate
      extendedKeyUsages={extendedKeyUsages}
      keyUsages={keyUsages}
    />,
    [CertificateGenerationType.WITH_CSR]: <GenerateCertificateWithCSR
      extendedKeyUsages={extendedKeyUsages}
      keyUsages={keyUsages}
    />,
    [CertificateGenerationType.UPLOAD]: <UploadCertificate />
  }

  const rbacOpsIdsMapping = {
    [CertificateGenerationType.NEW]: [getOpsApi(CertificateUrls.generateClientServerCertificate)],
    /* eslint-disable max-len */
    [CertificateGenerationType.WITH_CSR]: [getOpsApi(CertificateUrls.generateClientServerCertificate)],
    [CertificateGenerationType.UPLOAD]: [getOpsApi(CertificateUrls.uploadCertificate)]
  }

  return (
    <>
      <Form.Item name='generation' style={{ marginBottom: '40px' }}>
        <Radio.Group>
          <Space direction='vertical'>
            {Object.values(CertificateGenerationType)
              .filter((type)=> hasAllowedOperations(rbacOpsIdsMapping[type]))
              .map((type) => {
                return (
                  <Radio key={type} value={type}>
                    {$t(generateCertificateTitle[type])}
                    <RadioItemDescription>
                      {$t(generateCertificateDescription[type])}
                    </RadioItemDescription>
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
