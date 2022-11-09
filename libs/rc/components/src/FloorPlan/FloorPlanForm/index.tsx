import { useState } from 'react'

import { Form, Input, InputNumber, Typography } from 'antd'
import { FormInstance }                         from 'antd/es/form/Form'

import { FileValidation } from '@acx-ui/rc/utils'
import { getIntl }        from '@acx-ui/utils'

import FloorplanUpload from './FloorPlanUpload'
import ground          from './ground_floor_0.png'

export default function FloorPlanForm ({ form, formLoading, onFormSubmit, imageFile }: {
    form: FormInstance,
    formLoading: boolean,
    onFormSubmit: Function,
    imageFile?: string }) {

  const [file, setFile] = useState<File>({} as File)
  const { $t } = getIntl()

  const validateFile = function (_fileValidation: FileValidation) {
    form.setFieldValue('imageName', _fileValidation.file.name)
    form.validateFields(['imageName'])
    setFile(_fileValidation.file)
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
          { max: 32 }
        ]}>
        <Input />
      </Form.Item>
      <Form.Item
        style={{ marginBottom: '0px' }}
      >
        <Form.Item name='floorNumber'
          label={$t({ defaultMessage: 'Floor Number' })}
          initialValue={0}
          rules={[
            { required: true },
            { type: 'number', min: -32768, max: 32767 }
          ]}
        >
          <InputNumber />
        </Form.Item>
        <div style={{
          display: 'inline-flex',
          position: 'absolute',
          right: '0',
          top: '8px',
          alignItems: 'center'
        }}>
          <Typography.Text type='secondary'>
            {$t({ defaultMessage: 'When ground floor is 0 ' })}
          </Typography.Text>
          <div style={{
            backgroundImage: `url(${ground})`,
            width: '45px',
            height: '45px',
            marginLeft: '8px'
          }}></div>
        </div>
      </Form.Item>
      <Form.Item name='imageName'
        label={$t({ defaultMessage: 'Floor Plan Image' })}
        rules={[
          { required: true, message: $t({ defaultMessage: 'This field is required' }) }
        ]}
      >
        <FloorplanUpload
          validateFile={validateFile}
          imageFile={imageFile}/>
      </Form.Item>
    </Form>
  )
}