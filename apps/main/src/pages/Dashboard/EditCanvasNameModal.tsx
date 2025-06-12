import { useEffect } from 'react'

import { Col, Form, Input, Row } from 'antd'

import { useCloneCanvasMutation, useGetCanvasQuery }               from '@acx-ui/rc/services'
import { Canvas, trailingNorLeadingSpaces, validateDuplicateName } from '@acx-ui/rc/utils'
import { getIntl }                                                 from '@acx-ui/utils'

import * as UI from './styledComponents'

export function EditCanvasNameModal (props:{
  visible: boolean
  handleCancel: () => void
  editCanvas: Canvas
  callback: () => void
}) {
  const { $t } = getIntl()
  const { visible, handleCancel, editCanvas, callback } = props
  const [form] = Form.useForm()
  const [ cloneCanvas ] = useCloneCanvasMutation()

  const {
    data: canvasList
  } = useGetCanvasQuery({}, { skip: !visible })

  useEffect(() => {
    if(editCanvas){
      form.setFieldsValue({
        name: editCanvas.name + '-copy'
      })
      form.validateFields()
    }
  }, [editCanvas])

  const onOk = () => {
    form.submit()
  }

  const onFinish = async (value: { name:string }) => {
    await cloneCanvas({
      params: { canvasId: editCanvas.id },
      payload: {
        name: value.name
      }
    })
    handleCancel()
    callback()
  }

  return <UI.EditCanvasNameModal
    title={$t({ defaultMessage: 'Name Your New Canvas' })}
    visible={visible}
    onOk={onOk}
    onCancel={handleCancel}
    width='500px'
    maskClosable={false}
  >
    <Row gutter={24}>
      <Col span={22}>
        <Form
          form={form}
          onFinish={onFinish}
          layout='vertical'
        >
          <Form.Item
            name='name'
            data-testid='canvas-name'
            label={$t({ defaultMessage: 'New Canvas Name' })}
            rules={[
              { required: true },
              { max: 64 },
              { validator: (_, value) => trailingNorLeadingSpaces(value) },
              { validator: (_, value) => validateDuplicateName({
                name: value,
                id: editCanvas.id
              }, canvasList?.map(i=>({ id: i.id, name: i.name })) || [])
              }
            ]}
            children={<Input />}
          />
        </Form>
      </Col>
    </Row>
  </UI.EditCanvasNameModal>
}