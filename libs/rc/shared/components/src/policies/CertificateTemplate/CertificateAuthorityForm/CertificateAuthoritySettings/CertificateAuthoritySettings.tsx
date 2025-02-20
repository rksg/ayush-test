import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import { CertificateAuthorityFormData, CertificateUrls, GenerationCaType } from '@acx-ui/rc/utils'
import { hasAllowedOperations }                                            from '@acx-ui/user'
import { getOpsApi }                                                       from '@acx-ui/utils'

import { addCADescription, addCATitle } from '../../contentsMap'
import { RadioItemDescription }         from '../../styledComponents'

import CreateCaSettings     from './CreateCaSettings'
import { UploadCaSettings } from './UploadCaSettings'


export default function CertificateAuthoritySettings () {
  const { $t } = useIntl()
  const createCaForm = Form.useFormInstance<CertificateAuthorityFormData>()
  const generation = Form.useWatch('generation', createCaForm)
  const generationFormMapping = {
    [GenerationCaType.NEW]: hasAllowedOperations([getOpsApi(CertificateUrls.addCA)]) ?
      <CreateCaSettings /> : undefined,
    [GenerationCaType.NEW_SUB_CA]: hasAllowedOperations([getOpsApi(CertificateUrls.addSubCA)]) ?
      <CreateCaSettings rootCaMode={false} /> : undefined,
    [GenerationCaType.UPLOAD]: hasAllowedOperations([getOpsApi(CertificateUrls.addCA)]) ?
      <UploadCaSettings /> : undefined
  }

  return (
    <>
      <Form.Item name='generation' style={{ marginBottom: '40px' }}>
        <Radio.Group>
          <Space direction='vertical'>
            {Object.values(GenerationCaType).map((type) => {
              return (
                <Radio key={type} value={type}>
                  {$t(addCATitle[type])}
                  <RadioItemDescription>
                    {$t(addCADescription[type])}
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
