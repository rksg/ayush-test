import { useState } from 'react'

import { Form, Input, InputNumber, Space } from 'antd'
import { FormInstance }                    from 'antd/es/form/Form'

import { FileValidation, trailingNorLeadingSpaces } from '@acx-ui/rc/utils'
import { getIntl }                                  from '@acx-ui/utils'

import FloorplanUpload from './FloorPlanUpload'
import ground          from './ground_floor_0.png'
import * as UI         from './styledComponents'

export default function FloorPlanForm ({ form, formLoading, onFormSubmit, imageFile }: {
    form: FormInstance,
    formLoading: boolean,
    onFormSubmit: Function,
    imageFile?: string }) {

  const [file, setFile] = useState<File>({} as File)
  const { $t } = getIntl()

  const validateFile = function (_fileValidation: FileValidation, file?: File) {
    if (file) {
      setFile(file)
    } else {
      form.setFieldValue('imageName', _fileValidation.file.name)
      form.validateFields(['imageName'])
      setFile(_fileValidation.file)
    }
  }

  return (
    <Form
      layout='vertical'
      form={form}
      name='floor-plan-form'
      data-testid='floor-plan-form'
      labelAlign='left'
      colon={false}
      onFinish={(values) => {
        onFormSubmit({ formValues: values, file })
      }}
      disabled={formLoading}
    >
      <Form.Item name='name'
        label={$t({ defaultMessage: 'Floor Plan Name' })}
        rules={[
          { type: 'string', required: true },
          { min: 2 },
          { max: 64 },
          { validator: (_, value) => trailingNorLeadingSpaces(value) }
        ]}>
        <Input />
      </Form.Item>
      <Form.Item
        style={{ marginBottom: '0px' }}
      >
        <UI.FloorNumberFormItem name='floorNumber'
          label={$t({ defaultMessage: 'Floor Number' })}
          initialValue={0}
          rules={[
            { required: true },
            { type: 'number', min: -32768, max: 32767 }
          ]}
          extra={<Space>
            {$t({ defaultMessage: 'When ground floor is 0 ' })}
            <div style={{
              backgroundImage: `url(${ground})`,
              width: '45px',
              height: '45px',
              marginLeft: '8px'
            }}></div>
          </Space>}
        >
          <InputNumber />
        </UI.FloorNumberFormItem>
      </Form.Item>
      <Form.Item name='imageName'
        label={$t({ defaultMessage: 'Floor Plan Image' })}
        rules={[
          { required: true, message: $t({ defaultMessage: 'This field is required' }) }
        ]}
        extra={<>
          {$t({ defaultMessage: 'Max. file size: 20 MB' })}
          <br />
          {$t({ defaultMessage: 'Supported formats: PNG, JPEG, GIF, SVG, PDF' })}
        </>}
      >
        <FloorplanUpload
          validateFile={validateFile}
          imageFile={imageFile}/>
      </Form.Item>
    </Form>
  )
}
