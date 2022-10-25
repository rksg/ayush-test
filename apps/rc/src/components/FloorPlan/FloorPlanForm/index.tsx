import { useState } from 'react'

import { Col, Form, Input, InputNumber, Row, Typography } from 'antd'
import { FormInstance }                                   from 'antd/es/form/Form'

import { FileValidation } from '@acx-ui/rc/utils'
import { getIntl }        from '@acx-ui/utils'

import ground from '../../../assets/images/ground_floor_0.png'

import FloorplanUpload from './FloorPlanUpload'

export default function FloorPlanForm ({ form, onFormSubmit, imageFile }: {
    form: FormInstance,
    onFormSubmit: Function,
    imageFile?: string }) {

  const [file, setFile] = useState<File>()
  const { $t } = getIntl()

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 }
  }

  const validateFile = function (_fileValidation: FileValidation) {
    form.setFieldValue('imageName', _fileValidation.file.name)
    form.validateFields(['imageName'])
    setFile(_fileValidation.file)
  }

  return (
    <Form {...layout}
      form={form}
      name='floor-plan-form'
      labelAlign='left'
      colon={false}
      onFinish={(values) => {
        // TODO: upload file and then on upload success get url and add floorplan
        onFormSubmit({ formValues: values, file })
      }}>
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Form.Item name='name'
            label={$t({ defaultMessage: 'Floor Plan Name' })}
            rules={[
              { type: 'string', required: true, message: 'This field is required' },
              { min: 2, message: 'This field should be at least 2 characters' },
              { max: 32, message: 'Name is too long. Maximal length is 32 characters' }
            ]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name='floorNumber'
            label={$t({ defaultMessage: 'Floor Number' })}
            initialValue={0}
            rules={[
              { required: true, message: 'This field is required' },
              { type: 'number', min: -32768, max: 32767 }
            ]}
          >
            <InputNumber/>
          </Form.Item>
          <div style={{
            display: 'inline-flex',
            position: 'absolute',
            right: '0',
            top: '-8px',
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
        </Col>
        <Col span={24}>
          <Form.Item name='imageName'
            label={$t({ defaultMessage: 'Floor Plan Image' })}
            rules={[
              { required: true, message: 'This field is required' }
            ]}
          >
            <FloorplanUpload validateFile={validateFile} imageFile={imageFile}/>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}