import { Form, Radio, Space } from 'antd'
import { useIntl }            from 'react-intl'

import { CertificateAuthorityFormData, GenerationCaType } from '@acx-ui/rc/utils'

import { addCADescription, addCATitle } from '../../contentsMap'
import { RadioItemDescription }         from '../../styledComponents'

import CreateCaSettings     from './CreateCaSettings'
import { UploadCaSettings } from './UploadCaSettings'


export default function CertificateAuthoritySettings () {
  const { $t } = useIntl()
  const createCaForm = Form.useFormInstance<CertificateAuthorityFormData>()
  const generation = Form.useWatch('generation', createCaForm)
  const generationFormMapping = {
    [GenerationCaType.NEW]: <CreateCaSettings />,
    [GenerationCaType.NEW_SUB_CA]: <CreateCaSettings rootCaMode={false} />,
    [GenerationCaType.UPLOAD]: <UploadCaSettings />
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
